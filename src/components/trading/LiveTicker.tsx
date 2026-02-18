import { motion, AnimatePresence } from "framer-motion";
import { GlowCard } from "@/components/shared/GlowCard";
import type { TradingPair } from "@/hooks/useTradingData";

interface LiveTickerProps {
  pairs: TradingPair[];
}

export function LiveTicker({ pairs }: LiveTickerProps) {
  return (
    <GlowCard glowColor="cyan" className="space-y-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-neon-cyan)]">
        Live Ticker
      </h3>
      <div className="space-y-1">
        {pairs.map((pair) => (
          <div
            key={pair.symbol}
            className="flex items-center justify-between rounded px-2 py-1 text-xs font-mono bg-white/[0.02]"
          >
            <span className="text-text-primary font-medium w-24">
              {pair.symbol}
            </span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={pair.price}
                initial={{ opacity: 0.5, y: pair.trend === "up" ? 4 : -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-text-primary tabular-nums"
              >
                {pair.price < 1
                  ? pair.price.toFixed(4)
                  : pair.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </motion.span>
            </AnimatePresence>
            <span
              className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                pair.change24h >= 0
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {pair.change24h >= 0 ? "+" : ""}
              {pair.change24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </GlowCard>
  );
}
