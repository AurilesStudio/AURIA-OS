import { GlowCard } from "@/components/shared/GlowCard";
import { TokenGauge } from "./TokenGauge";
import { useTokenGauges } from "@/hooks/useTokenGauges";
import { Gauge } from "lucide-react";

export function TokenGaugesPanel() {
  const { gauges } = useTokenGauges();

  return (
    <GlowCard glowColor="purple">
      <div className="mb-3 flex items-center gap-2">
        <Gauge className="h-4 w-4 text-neon-purple" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Token Usage
        </h2>
      </div>
      <div className="flex items-center justify-around">
        {gauges.map((g, i) => (
          <TokenGauge key={g.provider} data={g} index={i} />
        ))}
      </div>
    </GlowCard>
  );
}
