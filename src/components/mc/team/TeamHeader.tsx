import { Plus, Search, X } from "lucide-react";
import type { MCTeamAgentStatus } from "@/types/mission-control";

const STATUS_FILTERS: { value: MCTeamAgentStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "idle", label: "Idle" },
  { value: "offline", label: "Offline" },
];

interface TeamHeaderProps {
  count: number;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: MCTeamAgentStatus | "";
  onStatusFilter: (status: MCTeamAgentStatus | "") => void;
  onNewAgent: () => void;
}

export function TeamHeader({
  count,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilter,
  onNewAgent,
}: TeamHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/5 px-6 py-3">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">
          {count} agent{count !== 1 ? "s" : ""}
        </span>
        <button
          onClick={onNewAgent}
          className="flex items-center gap-1.5 rounded bg-mc-accent/15 px-3 py-1.5 text-xs font-semibold text-mc-accent transition-colors hover:bg-mc-accent/25"
        >
          <Plus className="h-3.5 w-3.5" />
          New Agent
        </button>
      </div>

      {/* Search + status filters row */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-text-muted/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search agents..."
            className="w-full rounded border border-white/10 bg-bg-base/50 py-1.5 pl-8 pr-8 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted/40 hover:text-text-primary"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => onStatusFilter(f.value)}
              className={`rounded px-2.5 py-1 text-[10px] font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-white/10 text-text-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
