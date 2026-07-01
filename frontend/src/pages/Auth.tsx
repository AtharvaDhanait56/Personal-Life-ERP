import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { login, register } from "../services/api";

export function Auth({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.email.trim() || !form.password.trim() || (mode === "register" && !form.fullName.trim())) {
      setMessage("Fill all required fields.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = mode === "login"
        ? await login({ email: form.email.trim(), password: form.password })
        : await register({ fullName: form.fullName.trim(), email: form.email.trim(), password: form.password });
      localStorage.setItem("accessToken", response.accessToken);
      onAuthenticated();
    } catch {
      setMessage("Authentication failed. Check your details and backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-ink">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">Life ERP</h1>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button className={mode === "login" ? "bg-teal text-slate-950" : ""} onClick={() => setMode("login")}><LogIn size={16} /> Login</Button>
          <Button className={mode === "register" ? "bg-teal text-slate-950" : ""} onClick={() => setMode("register")}><UserPlus size={16} /> Register</Button>
        </div>
        <div className="mt-5 grid gap-3">
          {mode === "register" && (
            <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none" placeholder="Full name" />
          )}
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none" placeholder="Email" />
          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="h-10 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none" placeholder="Password" />
          <Button disabled={loading} onClick={submit}>{mode === "login" ? "Login" : "Create Account"}</Button>
          {message && <p className="text-sm text-coral">{message}</p>}
        </div>
      </Card>
    </main>
  );
}
