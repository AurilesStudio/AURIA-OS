import type { MCTeamAgent } from "@/types/mission-control";
import { AgentCard } from "./AgentCard";
import { Users } from "lucide-react";

interface TeamGridProps {
  agents: MCTeamAgent[];
  onEdit: (agent: MCTeamAgent) => void;
}

export function TeamGrid({ agents, onEdit }: TeamGridProps) {
  if (agents.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <Users className="h-10 w-10 text-text-muted/20" />
        <p className="text-xs text-text-muted/60">No agents found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onClick={() => onEdit(agent)}
          />
        ))}
      </div>
    </div>
  );
}
