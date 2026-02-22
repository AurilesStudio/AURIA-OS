import { useStore } from "@/store/useStore";
import type { MCModule } from "@/types";
import { NotificationBell } from "./notifications/NotificationBell";

const MODULE_TITLES: Record<MCModule, string> = {
  office: "Office",
  tasks: "Tasks",
  content: "Content Pipeline",
  calendar: "Calendar",
  memory: "Memory",
  team: "Team",
  monitoring: "Monitoring",
  github: "GitHub",
  linear: "Linear",
  notion: "Notion",
};

export function MCHeader() {
  const activeModule = useStore((s) => s.mcActiveModule);
  const systemStatus = useStore((s) => s.systemStatus);

  // Only show header for non-office modules
  if (activeModule === "office") return null;

  const statusColor =
    systemStatus === "ERROR"
      ? "bg-red-400"
      : systemStatus === "PROCESSING" || systemStatus === "DEPLOYING"
        ? "bg-amber-400"
        : "bg-emerald-400";

  return (
    <header className="pointer-events-auto flex h-12 items-center justify-between border-b border-white/5 overlay-glass px-6">
      <h1 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
        {MODULE_TITLES[activeModule]}
      </h1>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <NotificationBell />

        {/* AURIA status badge */}
        <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1">
          <div className={`h-1.5 w-1.5 rounded-full ${statusColor}`} />
          <span className="text-[10px] text-text-muted">AURIA</span>
        </div>

        {/* User name */}
        <span className="text-xs text-text-muted">Auriles</span>
      </div>
    </header>
  );
}
