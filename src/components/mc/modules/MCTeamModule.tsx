import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { TeamHeader } from "../team/TeamHeader";
import { TeamGrid } from "../team/TeamGrid";
import { AgentModal } from "../team/AgentModal";
import type { MCTeamAgent, MCTeamAgentStatus } from "@/types/mission-control";

export function MCTeamModule() {
  const agents = useStore((s) => s.mcTeamAgents);

  const [createOpen, setCreateOpen] = useState(false);
  const [editAgent, setEditAgent] = useState<MCTeamAgent | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MCTeamAgentStatus | "">("");

  const filtered = useMemo(() => {
    let result = agents;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.responsibilities.toLowerCase().includes(q),
      );
    }

    if (statusFilter) {
      result = result.filter((a) => a.status === statusFilter);
    }

    return result;
  }, [agents, search, statusFilter]);

  return (
    <div className="flex h-full flex-col">
      <TeamHeader
        count={filtered.length}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        onNewAgent={() => setCreateOpen(true)}
      />

      <TeamGrid
        agents={filtered}
        onEdit={setEditAgent}
      />

      {/* Create modal */}
      <AgentModal
        open={createOpen}
        agent={null}
        onClose={() => setCreateOpen(false)}
      />

      {/* Edit modal */}
      <AgentModal
        open={editAgent !== null}
        agent={editAgent}
        onClose={() => setEditAgent(null)}
      />
    </div>
  );
}
