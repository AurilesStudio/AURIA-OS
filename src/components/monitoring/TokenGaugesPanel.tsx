import { GlowCard } from "@/components/shared/GlowCard";
import { TokenGauge } from "./TokenGauge";
import { useTokenGauges } from "@/hooks/useTokenGauges";
import { Coins, RotateCcw } from "lucide-react";

export function TokenGaugesPanel() {
  const { gauges, resetTokenTracking } = useTokenGauges();

  const totalCost = gauges.reduce((sum, g) => sum + g.cost, 0);

  return (
    <GlowCard glowColor="purple">
      <div className="mb-3 flex items-center gap-2">
        <Coins className="h-4 w-4 text-neon-purple" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Token Usage
        </h2>
        <button
          onClick={resetTokenTracking}
          className="ml-auto p-1 rounded hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
          title="Reset counters"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {gauges.map((g, i) => (
          <TokenGauge key={g.provider} data={g} index={i} />
        ))}
      </div>
      {totalCost > 0 && (
        <div className="mt-3 pt-2 border-t border-white/5 text-center">
          <span className="text-xs text-text-muted">Total: </span>
          <span className="text-xs font-mono font-bold text-text-primary">
            ${totalCost.toFixed(2)}
          </span>
        </div>
      )}
    </GlowCard>
  );
}
