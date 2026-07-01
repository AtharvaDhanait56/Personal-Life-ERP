import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/ui/Card";
import { fetchDashboard } from "../services/api";

export function Analytics() {
  const { data: dashboard, isLoading, isError } = useQuery({ queryKey: ["dashboard"], queryFn: fetchDashboard });
  const data = dashboard?.goalProgress.map((goal) => ({ name: goal.title.slice(0, 8), score: goal.progress })) ?? [];
  const completedTasks = dashboard?.todaysTasks.filter((task) => task.status === "DONE").length ?? 0;
  const taskCompletion = dashboard?.todaysTasks.length ? Math.round((completedTasks / dashboard.todaysTasks.length) * 100) : 0;
  if (isLoading) {
    return <Card>Loading analytics...</Card>;
  }
  if (isError || !dashboard) {
    return <Card>Unable to load analytics.</Card>;
  }

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-muted">Productivity Score</p><p className="mt-2 text-3xl font-semibold">{dashboard.productivityScore}</p></Card>
        <Card><p className="text-sm text-muted">Task Completion</p><p className="mt-2 text-3xl font-semibold">{taskCompletion}%</p></Card>
        <Card><p className="text-sm text-muted">Month Spend</p><p className="mt-2 text-3xl font-semibold">${dashboard.monthSpend}</p></Card>
      </section>
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Goal Analytics</h2>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={data}>
            <XAxis dataKey="name" stroke="#9bb0aa" />
            <YAxis stroke="#9bb0aa" />
            <Tooltip contentStyle={{ background: "#071012", border: "1px solid rgba(255,255,255,0.12)" }} />
            <Line type="monotone" dataKey="score" stroke="#2dd4bf" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
