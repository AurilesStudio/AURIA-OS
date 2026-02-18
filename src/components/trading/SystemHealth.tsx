import { GlowCard } from "@/components/shared/GlowCard";
import type { SystemHealthData } from "@/hooks/useTradingData";

interface SystemHealthProps {
  data: SystemHealthData;
  onToggleKillSwitch: () => void;
}

const STATUS_COLORS: Record<SystemHealthData["binanceApi"], string> = {
  connected: "bg-green-400",
  degraded: "bg-yellow-400",
  disconnected: "bg-red-400",
};

export function SystemHealth({ data, onToggleKillSwitch }: SystemHealthProps) {
  return (
    <GlowCard glowColor="cyan" className="space-y-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-neon-cyan)]">
        System Health
      </h3>

      <div className="space-y-1.5 text-xs font-mono">
        {/* Binance API status */}
        <div className="flex items-center justify-between">
          <span className="text-text-muted">Binance API</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${STATUS_COLORS[data.binanceApi]} ${
                data.binanceApi === "connected" ? "animate-pulse" : ""
              }`}
            />
            <span className="text-text-primary capitalize">{data.binanceApi}</span>
          </div>
        </div>

        {/* Latency */}
        <div className="flex items-center justify-between">
          <span className="text-text-muted">Latency</span>
          <span className="text-text-primary tabular-nums">{data.latencyMs}ms</span>
        </div>

        {/* Active strategies */}
        <div className="flex items-center justify-between">
          <span className="text-text-muted">Strategies</span>
          <span className="text-text-primary tabular-nums">{data.activeStrategies} active</span>
        </div>

        {/* Kill Switch */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className="text-text-muted">Kill Switch</span>
          <button
            onClick={onToggleKillSwitch}
            className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
              data.killSwitch
                ? "bg-red-500/20 text-red-400 animate-pulse ring-1 ring-red-500/30"
                : "bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-primary"
            }`}
          >
            {data.killSwitch ? "ACTIVE" : "OFF"}
          </button>
        </div>
      </div>
    </GlowCard>
  );
}
