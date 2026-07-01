import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { createEvent, deleteEvent, fetchEvents, updateEvent } from "../services/api";
import type { EventItem } from "../types";

const eventTypes = ["EVENT", "MEETING", "BIRTHDAY", "REMINDER"] as const;

// An event counts as done once its own "completed" flag is set, or once its
// date (end date if it has one, otherwise start date) has already passed.
const isEventDone = (event: EventItem) => {
  if (event.completed) return true;
  const reference = new Date(event.endsAt ?? event.startsAt);
  return reference.getTime() < Date.now();
};

export function Calendar() {
  const queryClient = useQueryClient();
  const { data: events = [], isLoading, isError } = useQuery({ queryKey: ["events"], queryFn: fetchEvents });

  const now = new Date();
  const monthName = now.toLocaleString(undefined, { month: "long", year: "numeric" });
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  const todayIso = now.toISOString().slice(0, 10);

  const [form, setForm] = useState({
    title: "",
    eventType: "EVENT" as (typeof eventTypes)[number],
    date: todayIso,
    time: "09:00",
  });

  const addEvent = useMutation({
    mutationFn: createEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  const saveEvent = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  const removeEvent = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  const submit = () => {
    if (!form.title.trim() || !form.date) return;

    const startsAt = new Date(`${form.date}T${form.time || "00:00"}`).toISOString();

    addEvent.mutate({
      title: form.title.trim(),
      eventType: form.eventType,
      startsAt,
    });

    setForm({ title: "", eventType: "EVENT", date: form.date, time: "09:00" });
  };

  const selectDay = (day: number) => {
    const iso = new Date(now.getFullYear(), now.getMonth(), day).toISOString().slice(0, 10);
    setForm((current) => ({ ...current, date: iso }));
  };

  const toggleDone = (event: EventItem) => {
    saveEvent.mutate({ ...event, completed: !event.completed });
  };

  const eventsByDay = new Map<number, typeof events>();
  for (const event of events) {
    const eventDate = new Date(event.startsAt);
    if (eventDate.getFullYear() === now.getFullYear() && eventDate.getMonth() === now.getMonth()) {
      const day = eventDate.getDate();
      eventsByDay.set(day, [...(eventsByDay.get(day) ?? []), event]);
    }
  }

  const sortedEvents = [...events].sort((a, b) => {
    const aDone = isEventDone(a);
    const bDone = isEventDone(b);
    if (aDone !== bDone) return aDone ? 1 : -1;
    return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <div className="grid gap-4">
        <Card className="grid gap-3 md:grid-cols-[1.2fr_150px_140px_110px_auto]">
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none"
            placeholder="Event title"
          />

          <select
            value={form.eventType}
            onChange={(event) => setForm({ ...form, eventType: event.target.value as (typeof eventTypes)[number] })}
            className="h-10 rounded-md border border-white/10 bg-[#071012] px-3 text-sm outline-none"
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={form.date}
            onChange={(event) => setForm({ ...form, date: event.target.value })}
            className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none"
          />

          <input
            type="time"
            value={form.time}
            onChange={(event) => setForm({ ...form, time: event.target.value })}
            className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none"
          />

          <Button disabled={addEvent.isPending} onClick={submit}>
            <Plus size={16} />
            Add Event
          </Button>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">{monthName}</h2>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => selectDay(day)}
                className={`min-h-24 rounded-md border p-2 text-left transition ${
                  form.date === new Date(now.getFullYear(), now.getMonth(), day).toISOString().slice(0, 10)
                    ? "border-teal bg-teal/10"
                    : "border-white/10 bg-white/6 hover:bg-white/10"
                }`}
              >
                <span className="text-sm text-muted">{day}</span>
                {day === now.getDate() && <p className="mt-1 rounded-sm bg-teal/20 px-2 py-1 text-xs text-teal">Today</p>}
                {(eventsByDay.get(day) ?? []).slice(0, 2).map((event) => (
                  <p
                    key={event.id}
                    className={`mt-1 truncate rounded-sm bg-white/10 px-1.5 py-0.5 text-xs ${
                      isEventDone(event) ? "text-muted line-through" : "text-ink"
                    }`}
                  >
                    {event.title}
                  </p>
                ))}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold">Events</h2>
        <div className="grid gap-3">
          {isLoading && <p className="text-sm text-muted">Loading events...</p>}
          {isError && <p className="text-sm text-muted">Unable to load events.</p>}
          {!isLoading && events.length === 0 && <p className="text-sm text-muted">No events yet.</p>}
          {sortedEvents.map((event) => {
            const done = isEventDone(event);
            return (
              <div key={event.id} className={`rounded-md bg-white/6 p-3 ${done ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => toggleDone(event)}
                      className="mt-0.5 text-teal"
                      title={event.completed ? "Mark not done" : "Mark done"}
                    >
                      {done ? <CheckCircle2 size={18} /> : <Circle size={18} className="text-muted" />}
                    </button>
                    <div>
                      <p className={`font-medium ${done ? "line-through text-muted" : ""}`}>{event.title}</p>
                      <p className="text-sm text-muted">{new Date(event.startsAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-teal">{event.eventType}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete "${event.title}"?`)) {
                          removeEvent.mutate(event.id);
                        }
                      }}
                      className="text-red-400 hover:text-red-300"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
