import { ReactNode, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  FileText,
  FolderClosed,
  Gauge,
  Landmark,
  LogOut,
  Moon,
  Sun,
  Target,
  Zap
} from "lucide-react";
import { cn } from "../lib/cn";
import { applyTheme, getStoredTheme, type Theme } from "../lib/theme";

const nav = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/expenses", label: "Expenses", icon: Landmark },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/notes", label: "Notes", icon: FileText },
  { to: "/vault", label: "Vault", icon: FolderClosed },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/analytics", label: "Analytics", icon: BarChart3 }
];

export function AppLayout({ children, onLogout }: { children: ReactNode; onLogout: () => void }) {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="min-h-screen bg-background text-ink">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(45,212,191,0.16),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(251,113,133,0.14),transparent_30%)]" />

      <div className="relative flex min-h-screen">

        <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-black/20 p-5 backdrop-blur-xl lg:flex">

          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-teal text-slate-950">
              <Zap size={21} />
            </span>

            <span>
              <span className="block text-lg font-semibold">
                Life ERP
              </span>

              <span className="text-xs text-muted">
                Personal operating system
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onLogout}
            className="mt-4 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted transition hover:bg-white/10 hover:text-ink"
          >
            <LogOut size={18} />
            Logout
          </button>

          <nav className="mt-4 grid gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted transition hover:bg-white/10 hover:text-ink",
                    isActive && "bg-white/12 text-ink"
                  )
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

        </aside>

        <main className="w-full px-4 py-5 sm:px-6 lg:px-8">

          <header className="mb-5 flex flex-wrap items-center justify-between gap-3">

            <div>
              <p className="text-sm text-muted">
                {currentDate}
              </p>

              <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">
                Personal Life ERP
              </h1>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-md border border-white/10 bg-white/8 px-3 py-2 text-sm text-muted transition hover:bg-white/14 hover:text-ink"
            >
              {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </button>

          </header>

          {children}

        </main>

      </div>
    </div>
  );
}
