import { GlowCard } from "@/components/shared/GlowCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { Activity } from "lucide-react";

export function SystemStatus() {
  const { systemStatus } = useSystemStatus();

  return (
    <GlowCard className="flex items-center gap-4">
      <Activity className="h-5 w-5 text-text-muted" />
      <div>
        <p className="text-xs text-text-muted uppercase tracking-wider">
          System Status
        </p>
        <StatusBadge status={systemStatus} className="mt-1" />
      </div>
    </GlowCard>
  );
}
