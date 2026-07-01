import { useState } from "react";
import { Download, Moon, RotateCcw, Shield, Upload } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(() => localStorage.getItem("life-erp-notifications") === "on");
  const [message, setMessage] = useState("");

  const saveNotifications = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem("life-erp-notifications", enabled ? "on" : "off");
    setMessage(enabled ? "Notifications enabled." : "Notifications disabled.");
  };

  const exportData = () => {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), localStorage: { ...localStorage } }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "life-erp-export.json";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Export downloaded.");
  };

  const resetLocal = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("life-erp-token");
    setMessage("Local auth tokens cleared.");
    window.location.reload();
  };

  return (
    <div className="grid gap-4">
      {message && <Card>{message}</Card>}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Theme</h2>
          <Button className="mt-4" onClick={() => { setDarkMode(!darkMode); setMessage(`${darkMode ? "Light" : "Dark"} mode selected.`); }}>
            <Moon size={16} /> {darkMode ? "Use Light Mode" : "Use Dark Mode"}
          </Button>
        </Card>
        <Card>
          <h2 className="font-semibold">Notifications</h2>
          <Button className="mt-4" onClick={() => saveNotifications(!notifications)}>
            {notifications ? "Disable" : "Enable"}
          </Button>
        </Card>
        <Card>
          <h2 className="font-semibold">Export Data</h2>
          <Button className="mt-4" onClick={exportData}><Download size={16} /> Export</Button>
        </Card>
        <Card>
          <h2 className="font-semibold">Import Data</h2>
          <Button className="mt-4" onClick={() => setMessage("Import needs a backend restore endpoint before it can write data safely.")}><Upload size={16} /> Import</Button>
        </Card>
        <Card>
          <h2 className="font-semibold">Security</h2>
          <Button className="mt-4" onClick={resetLocal}><Shield size={16} /> Clear Token</Button>
        </Card>
        <Card>
          <h2 className="font-semibold">Reset</h2>
          <Button className="mt-4" onClick={() => setMessage("Database reset is intentionally unavailable from the browser.")}><RotateCcw size={16} /> Reset</Button>
        </Card>
      </section>
    </div>
  );
}
