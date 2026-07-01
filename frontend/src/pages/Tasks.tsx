import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { createTask, fetchTasks, updateTask } from "../services/api";

export function Tasks() {
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  const addTask = useMutation({
    mutationFn: createTask,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      }),
  });

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      }),
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as const,
    dueAt: "",
    labels: "",
  });

  const columns = ["TODO", "IN_PROGRESS", "DONE"] as const;

  const submit = () => {
    if (!form.title.trim()) return;

    addTask.mutate({
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      dueAt: form.dueAt,
      labels: form.labels.trim() || "inbox",
    });

    setForm({
      title: "",
      description: "",
      priority: "MEDIUM",
      dueAt: "",
      labels: "",
    });
  };

  return (
    <div className="grid gap-4">
      <Card className="grid gap-3">
        <div className="flex min-w-64 flex-1 items-center gap-2 rounded-md border border-white/10 bg-white/6 px-3">
          <Search size={18} className="text-muted" />
          <input
            className="h-10 flex-1 bg-transparent text-sm outline-none"
            placeholder="Search tasks, labels, categories"
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr_160px_150px_1fr_auto]">
          <input
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none"
            placeholder="Task title"
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
            value={form.priority}
            onChange={(e) =>
              setForm({
                ...form,
                priority: e.target.value as typeof form.priority,
              })
            }
            className="h-10 rounded-md border border-white/10 bg-[#071012] px-3 text-sm outline-none"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <input
            type="date"
            value={form.dueAt}
            onChange={(e) =>
              setForm({
                ...form,
                dueAt: e.target.value,
              })
            }
            className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none"
          />

          <input
            value={form.labels}
            onChange={(e) =>
              setForm({
                ...form,
                labels: e.target.value,
              })
            }
            className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none"
            placeholder="Labels"
          />

          <Button disabled={addTask.isPending} onClick={submit}>
            <Plus size={16} />
            Add
          </Button>
        </div>
      </Card>

      {isLoading && <Card>Loading tasks...</Card>}

      {isError && <Card>Unable to load tasks.</Card>}

      <section className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <Card key={column} className="min-h-96">
            <h2 className="mb-3 text-sm font-semibold text-muted">
              {column.replace("_", " ")}
            </h2>

            <div className="grid gap-3">
              {tasks.filter((task) => task.status === column).length ===
                0 && (
                <p className="text-sm text-muted">
                  No tasks here yet.
                </p>
              )}

              {tasks
                .filter((task) => task.status === column)
                .map((task) => (
                  <article
                    key={task.id}
                    className="rounded-md border border-white/10 bg-white/6 p-3"
                  >
                    <div className="flex justify-between gap-3">
                      <h3 className="font-medium">
                        {task.title}
                      </h3>

                      <span className="text-xs text-coral">
                        {task.priority}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-muted">
                      {task.description || "No description"}
                    </p>

                    <p className="mt-3 text-xs text-teal">
                      {task.labels}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {task.status === "TODO" && (
                        <>
                          <Button
                            className="h-8 px-3"
                            onClick={() =>
                              updateTaskMutation.mutate({
                                ...task,
                                status: "IN_PROGRESS",
                              })
                            }
                          >
                            ▶ Start
                          </Button>

                          <Button
                            className="h-8 px-3"
                            onClick={() =>
                              updateTaskMutation.mutate({
                                ...task,
                                status: "DONE",
                              })
                            }
                          >
                            ✔ Done
                          </Button>
                        </>
                      )}

                      {task.status === "IN_PROGRESS" && (
                        <>
                          <Button
                            className="h-8 px-3"
                            onClick={() =>
                              updateTaskMutation.mutate({
                                ...task,
                                status: "TODO",
                              })
                            }
                          >
                            ↩ Todo
                          </Button>

                          <Button
                            className="h-8 px-3"
                            onClick={() =>
                              updateTaskMutation.mutate({
                                ...task,
                                status: "DONE",
                              })
                            }
                          >
                            ✔ Done
                          </Button>
                        </>
                      )}

                      {task.status === "DONE" && (
                        <Button
                          className="h-8 px-3"
                          onClick={() =>
                            updateTaskMutation.mutate({
                              ...task,
                              status: "TODO",
                            })
                          }
                        >
                          ↩ Reopen
                        </Button>
                      )}
                    </div>
                  </article>
                ))}
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}