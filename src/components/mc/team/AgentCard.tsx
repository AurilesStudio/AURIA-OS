import type { MCTeamAgent, MCTeamAgentStatus } from "@/types/mission-control";
import { Bot } from "lucide-react";

const STATUS_CONFIG: Record<MCTeamAgentStatus, { label: string; color: string; dot: string }> = {
  active: { label: "Active", color: "#10b981", dot: "bg-emerald-400" },
  idle: { label: "Idle", color: "#f59e0b", dot: "bg-amber-400" },
  offline: { label: "Offline", color: "#6b7280", dot: "bg-gray-400" },
};

interface AgentCardProps {
  agent: MCTeamAgent;
  onClick: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const st = STATUS_CONFIG[agent.status];
  const taskCount = agent.taskHistory.length;

  return (
    <button
      onClick={onClick}
      className="overlay-glass flex w-full cursor-pointer flex-col rounded-lg border border-white/5 p-4 text-left transition-colors hover:border-white/15"
    >
      {/* Top row — avatar + status */}
      <div className="mb-3 flex items-start gap-3">
        {/* Avatar */}
        {agent.avatarUrl ? (
          <img
            src={agent.avatarUrl}
            alt={agent.name}
            className="h-10 w-10 shrink-0 rounded-full border border-white/10 object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Bot className="h-5 w-5 text-text-muted/60" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Name */}
          <p className="truncate text-xs font-semibold text-text-primary">
            {agent.name}
          </p>
          {/* Role */}
          <p className="truncate text-[10px] text-text-muted">
            {agent.role}
          </p>
        </div>

        {/* Status dot */}
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${st.dot}`} />
          <span className="text-[10px] text-text-muted" style={{ color: st.color }}>
            {st.label}
          </span>
        </div>
      </div>

      {/* Responsibilities */}
      {agent.responsibilities && (
        <p className="mb-2 line-clamp-2 text-[11px] leading-relaxed text-text-muted/70">
          {agent.responsibilities}
        </p>
      )}

      {/* Footer — task count */}
      <div className="mt-auto flex items-center gap-2 pt-1">
        <span className="text-[10px] text-text-muted/50">
          {taskCount} task{taskCount !== 1 ? "s" : ""} completed
        </span>
      </div>
    </button>
  );
}

export { STATUS_CONFIG };
