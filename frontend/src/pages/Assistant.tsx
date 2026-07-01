import { Send } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function Assistant() {
  const [messages, setMessages] = useState(["Good evening. I can summarize your day, notes, tasks, or build a weekly plan."]);
  const [prompt, setPrompt] = useState("");
  const submit = () => {
    if (!prompt.trim()) return;
    setMessages((current) => [...current, prompt, `Plan generated: prioritize ${prompt}, schedule one focus block, and review progress tonight.`]);
    setPrompt("");
  };
  return (
    <Card className="mx-auto grid min-h-[70vh] max-w-4xl grid-rows-[1fr_auto]">
      <div className="grid content-start gap-3">
        {messages.map((message, index) => (
          <p key={`${message}-${index}`} className={`max-w-[78%] rounded-md px-4 py-3 text-sm ${index % 2 ? "ml-auto bg-teal text-slate-950" : "bg-white/8 text-ink"}`}>{message}</p>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => event.key === "Enter" && submit()} className="h-11 flex-1 rounded-md border border-white/10 bg-white/6 px-3 text-sm outline-none" placeholder="Ask for a summary, weekly plan, or generated to-do list" />
        <Button onClick={submit}><Send size={16} /></Button>
      </div>
    </Card>
  );
}

