import { useState, useEffect } from "react";
import { Terminal } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useSystemStatus } from "@/hooks/useSystemStatus";

export function Header() {
  const { systemStatus } = useSystemStatus();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatted = time.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-bg-surface px-6 py-3">
      <div className="flex items-center gap-3">
        <Terminal className="h-5 w-5 text-neon-red" />
        <h1 className="text-lg font-bold tracking-wider text-neon-red text-glow-red">
          AURIA-OS
        </h1>
        <span className="text-xs text-text-muted">v0.1.0</span>
      </div>

      <div className="flex items-center gap-6">
        <StatusBadge status={systemStatus} />
        <span className="font-mono text-sm text-text-muted tabular-nums">
          {formatted}
        </span>
      </div>
    </header>
  );
}
