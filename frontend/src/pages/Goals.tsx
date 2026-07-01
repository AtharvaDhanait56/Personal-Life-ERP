import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

import {
  createGoal,
  deleteGoal,
  fetchGoals,
  updateGoal,
} from "../services/api";

import type { Goal } from "../types";

export function Goals() {

  const queryClient = useQueryClient();

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const { data: goals = [], isLoading, isError } =
    useQuery({
      queryKey: ["goals"],
      queryFn: fetchGoals,
    });

  const [form, setForm] = useState({
    title: "",
    description: "",
    goalType: "MONTHLY" as Goal["goalType"],
    progress: "0",
    targetDate: "",
  });

  const saveGoal = useMutation({

    mutationFn: (goal: any) =>
      editingId
        ? updateGoal(goal)
        : createGoal(goal),

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["goals"],
      });

      setEditingId(null);

      setForm({
        title: "",
        description: "",
        goalType: "MONTHLY",
        progress: "0",
        targetDate: "",
      });

    },

  });

  const removeGoal = useMutation({

    mutationFn: deleteGoal,

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["goals"],
      });

    },

  });

  const submit = () => {

    if (!form.title.trim()) return;

    saveGoal.mutate({

      id: editingId ?? undefined,

      title: form.title.trim(),

      description: form.description.trim(),

      goalType: form.goalType,

      progress: Math.max(
        0,
        Math.min(
          100,
          Number(form.progress)
        )
      ),

      targetDate: form.targetDate,

    });

  };

  if (isLoading) {
    return <Card>Loading goals...</Card>;
  }

  if (isError) {
    return <Card>Unable to load goals.</Card>;
  }

  return (
        <div className="grid gap-4">

      <Card className="grid gap-3 lg:grid-cols-[1fr_1.3fr_150px_130px_150px_auto]">

        <input
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
          className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none"
          placeholder="Goal title"
        />

        <input
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
          className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none"
          placeholder="Description"
        />

        <select
          value={form.goalType}
          onChange={(e) =>
            setForm({
              ...form,
              goalType: e.target.value as Goal["goalType"],
            })
          }
          className="h-10 rounded-md border border-white/10 bg-[#071012] px-3 text-sm outline-none"
        >
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="YEARLY">Yearly</option>
        </select>

        <input
          type="number"
          min="0"
          max="100"
          value={form.progress}
          onChange={(e) =>
            setForm({
              ...form,
              progress: e.target.value,
            })
          }
          className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none"
          placeholder="Progress"
        />

        <input
          type="date"
          value={form.targetDate}
          onChange={(e) =>
            setForm({
              ...form,
              targetDate: e.target.value,
            })
          }
          className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none"
        />

        <Button
          disabled={saveGoal.isPending}
          onClick={submit}
        >
          {editingId ? (
            <>
              <Pencil size={16} />
              Update
            </>
          ) : (
            <>
              <Plus size={16} />
              Add
            </>
          )}
        </Button>

      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {goals.length === 0 && (
          <Card>No goals yet.</Card>
        )}

        {goals.map((goal) => (

          <Card key={goal.id}>

            <div className="flex items-center justify-between">

              <div>

                <h2 className="font-semibold">
                  {goal.title}
                </h2>

                <p className="text-xs text-muted">
                  {goal.goalType}
                </p>

              </div>

              <span className="rounded-full bg-teal/20 px-3 py-1 text-xs font-semibold text-teal">
                {goal.progress}%
              </span>

            </div>

            {goal.description && (
              <p className="mt-3 text-sm text-muted">
                {goal.description}
              </p>
            )}

            <div className="mt-5 h-3 rounded-full bg-white/10">

              <div
                className="h-3 rounded-full bg-teal transition-all"
                style={{
                  width: `${goal.progress}%`,
                }}
              />

            </div>

            <div className="mt-3 flex items-center justify-between">

              <span className="text-xs text-muted">
                Target: {goal.targetDate || "Not set"}
              </span>

              <span className="text-xs font-medium">
                {goal.progress}%
              </span>

            </div>

            <div className="mt-5 flex gap-2">

              <Button
                className="flex-1"
                onClick={() => {

                  setEditingId(goal.id);

                  setForm({
                    title: goal.title,
                    description: goal.description ?? "",
                    goalType: goal.goalType,
                    progress: goal.progress.toString(),
                    targetDate: goal.targetDate ?? "",
                  });

                }}
              >
                <Pencil size={15} />
                Edit
              </Button>

              <Button
                className="flex-1"
                onClick={() => {

                  if (confirm("Delete this goal?")) {
                    removeGoal.mutate(goal.id);
                  }

                }}
              >
                <Trash2 size={15} />
                Delete
              </Button>

            </div>

          </Card>

        ))}

      </section>

    </div>
  );
}