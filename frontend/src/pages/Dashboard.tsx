import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts";
import {
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  NotebookPen,
  TrendingUp
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { fetchDashboard } from "../services/api";

export function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard
  });

  const chart =
    data?.todaysExpenses.map((expense) => ({
      name: expense.title,
      amount: expense.amount
    })) ?? [];

  const goals =
    data?.goalProgress.map((goal) => ({
      name: goal.title.split(" ")[0],
      progress: goal.progress
    })) ?? [];

  const colors = ["#2dd4bf", "#fb7185", "#fbbf24", "#a78bfa"];

  if (isLoading) {
    return <Card>Loading dashboard...</Card>;
  }

  if (isError || !data) {
    return <Card>Unable to load dashboard data.</Card>;
  }

  return (
    <div className="grid gap-4">

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        {[
          {
            label: "Today's Tasks",
            value: data.todaysTasks.length,
            icon: CheckCircle2
          },
          {
            label: "Month Spend",
            value: `$${data.monthSpend}`,
            icon: IndianRupee
          },
          {
            label: "Productivity",
            value: `${data.productivityScore}%`,
            icon: TrendingUp
          },
          {
            label: "Quick Notes",
            value: data.quickNotes.length,
            icon: NotebookPen
          }
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">
                  {item.label}
                </span>
                <item.icon
                  size={18}
                  className="text-teal"
                />
              </div>

              <p className="mt-3 text-3xl font-semibold">
                {item.value}
              </p>
            </Card>
          </motion.div>
        ))}

      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">

        <Card className="min-h-80">

          <h2 className="mb-4 text-lg font-semibold">
            Expense Analytics
          </h2>

          <ResponsiveContainer
            width="100%"
            height={260}
          >
            <BarChart data={chart}>
              <CartesianGrid
                stroke="rgba(255,255,255,0.08)"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="#9bb0aa"
              />

              <Tooltip
                contentStyle={{
                  background: "#071012",
                  border:
                    "1px solid rgba(255,255,255,0.12)"
                }}
              />

              <Bar
                dataKey="amount"
                radius={[6, 6, 0, 0]}
                fill="#2dd4bf"
              />
            </BarChart>
          </ResponsiveContainer>

        </Card>

        <Card className="min-h-80">

          <h2 className="mb-4 text-lg font-semibold">
            Goals Progress
          </h2>

          <ResponsiveContainer
            width="100%"
            height={260}
          >
            <AreaChart data={goals}>
              <CartesianGrid
                stroke="rgba(255,255,255,0.08)"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                stroke="#9bb0aa"
              />

              <Tooltip
                contentStyle={{
                  background: "#071012",
                  border:
                    "1px solid rgba(255,255,255,0.12)"
                }}
              />

              <Area
                type="monotone"
                dataKey="progress"
                stroke="#fb7185"
                fill="rgba(251,113,133,0.22)"
              />
            </AreaChart>
          </ResponsiveContainer>

        </Card>

      </section>

      <section className="grid gap-4 xl:grid-cols-2">

        <Card>

          <h2 className="mb-3 text-lg font-semibold">
            Today
          </h2>

          <div className="grid gap-3">

            {data.todaysTasks.slice(0, 4).map((task) => (

              <div
                key={task.id}
                className="rounded-md border border-white/10 bg-white/6 p-3"
              >
                <div className="flex items-center justify-between gap-3">

                  <p className="font-medium">
                    {task.title}
                  </p>

                  <span className="text-xs text-amber">
                    {task.priority}
                  </span>

                </div>

                <p className="mt-1 text-sm text-muted">
                  {task.description}
                </p>

              </div>

            ))}

          </div>

        </Card>

        <Card>

          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <CalendarDays size={18} />
            Upcoming
          </h2>

          <div className="grid gap-3">

            {data.upcomingEvents.map((event) => (

              <div
                key={event.id}
                className="rounded-md border border-white/10 bg-white/6 p-3"
              >
                <p className="font-medium">
                  {event.title}
                </p>

                <p className="text-sm text-muted">
                  {new Date(
                    event.startsAt
                  ).toLocaleString()}
                </p>

              </div>

            ))}

          </div>

        </Card>

      </section>

      <Card>

        <h2 className="mb-4 text-lg font-semibold">
          Category Mix
        </h2>

        <ResponsiveContainer
          width="100%"
          height={220}
        >
          <PieChart>

            <Pie
              data={chart}
              dataKey="amount"
              nameKey="name"
              outerRadius={82}
            >
              {chart.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={
                    colors[index % colors.length]
                  }
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                background: "#071012",
                border:
                  "1px solid rgba(255,255,255,0.12)"
              }}
            />

          </PieChart>
        </ResponsiveContainer>

      </Card>

    </div>
  );
}