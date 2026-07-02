import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { Analytics } from "./pages/Analytics";
import { Auth } from "./pages/Auth";
import { Calendar } from "./pages/Calendar";
import { Dashboard } from "./pages/Dashboard";
import { Expenses } from "./pages/Expenses";
import { Goals } from "./pages/Goals";
import { Notes } from "./pages/Notes";
import { Tasks } from "./pages/Tasks";
import { Vault } from "./pages/Vault";

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => Boolean(localStorage.getItem("accessToken") ?? localStorage.getItem("life-erp-token")));

  if (!authenticated) {
    return <Auth onAuthenticated={() => setAuthenticated(true)} />;
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("life-erp-token");
    setAuthenticated(false);
  };

  return (
    <AppLayout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </AppLayout>
  );
}
