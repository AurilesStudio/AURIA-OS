import { Users } from "lucide-react";
import { useStore } from "@/store/useStore";

export function MCTeamModule() {
  const count = useStore((s) => s.mcTeamAgents.length);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <Users className="h-12 w-12 text-text-muted/30" />
      <h2 className="text-lg font-semibold text-text-primary">Team</h2>
      <p className="text-sm text-text-muted">
        {count > 0 ? `${count} agent${count > 1 ? "s" : ""}` : "No team agents yet"}
      </p>
      <p className="max-w-sm text-center text-xs text-text-muted/60">
        Manage your AI agents, their roles, and responsibilities.
      </p>
    </div>
  );
}
