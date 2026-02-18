import { motion } from "framer-motion";
import type { TradingOpportunity } from "@/hooks/useTradingData";

interface DecisionCardProps {
  opportunity: TradingOpportunity;
  onValidate: (id: string) => void;
  onReject: (id: string) => void;
}

export function DecisionCard({ opportunity, onValidate, onReject }: DecisionCardProps) {
  const isLong = opportunity.type === "LONG";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border border-[var(--color-trading-amber)]/20 bg-bg-surface p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[var(--color-trading-amber)] animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-trading-amber)]">
          Opportunity Detected
        </span>
      </div>

      {/* Pair + Type */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-text-primary font-mono">
          {opportunity.pair}
        </span>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
            isLong
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {opportunity.type}
        </span>
      </div>

      {/* Entry / Target / Stop Loss */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        <div className="space-y-0.5">
          <div className="text-text-muted text-[10px]">Entry</div>
          <div className="text-text-primary tabular-nums">{opportunity.entry}</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-text-muted text-[10px]">Target</div>
          <div className="text-green-400 tabular-nums">{opportunity.target}</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-text-muted text-[10px]">Stop Loss</div>
          <div className="text-red-400 tabular-nums">{opportunity.stopLoss}</div>
        </div>
      </div>

      {/* R/R + Confidence */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted">
          R/R{" "}
          <span className="text-text-primary font-semibold tabular-nums">
            {opportunity.riskReward}
          </span>
        </span>
        <span className="text-text-muted">
          Confidence{" "}
          <span className="text-[var(--color-trading-amber)] font-semibold tabular-nums">
            {opportunity.confidence}%
          </span>
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onValidate(opportunity.id)}
          className="flex-1 rounded py-1.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)]/20 transition-colors border border-[var(--color-neon-cyan)]/20"
        >
          Validate
        </button>
        <button
          onClick={() => onReject(opportunity.id)}
          className="flex-1 rounded py-1.5 text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
        >
          Reject
        </button>
      </div>
    </motion.div>
  );
}
