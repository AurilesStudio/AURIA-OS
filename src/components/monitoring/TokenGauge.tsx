import { motion } from "framer-motion";
import { formatTokenCount } from "@/lib/utils";
import type { TokenGaugeData } from "@/types";

interface TokenGaugeProps {
  data: TokenGaugeData;
  index: number;
}

const RADIUS = 45;
const STROKE = 6;
const CIRCUMFERENCE = Math.PI * RADIUS; // half-circle arc
const VB_W = 120;
const VB_H = 78; // 120 * 0.65

export function TokenGauge({ data, index }: TokenGaugeProps) {
  const pct = Math.min(data.used / data.limit, 1);
  const dashOffset = CIRCUMFERENCE * (1 - pct);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col items-center gap-1 min-w-0"
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full max-w-[110px] overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M ${VB_W * 0.1} ${VB_W * 0.58} A ${RADIUS} ${RADIUS} 0 0 1 ${VB_W * 0.9} ${VB_W * 0.58}`}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <motion.path
          d={`M ${VB_W * 0.1} ${VB_W * 0.58} A ${RADIUS} ${RADIUS} 0 0 1 ${VB_W * 0.9} ${VB_W * 0.58}`}
          fill="none"
          stroke={data.color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, delay: index * 0.15, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 6px ${data.color}80)`,
          }}
        />
        {/* Percentage text */}
        <text
          x={VB_W / 2}
          y={VB_W * 0.45}
          textAnchor="middle"
          className="fill-text-primary font-bold"
          style={{ fontSize: "16px", fontFamily: "JetBrains Mono, monospace" }}
        >
          {Math.round(pct * 100)}%
        </text>
      </svg>

      <div className="text-center min-w-0">
        <p className="text-xs font-semibold truncate" style={{ color: data.color }}>
          {data.label}
        </p>
        <p className="text-[11px] text-text-muted whitespace-nowrap">
          {formatTokenCount(data.used)} / {formatTokenCount(data.limit)}
        </p>
        {data.cost > 0 && (
          <p className="text-[11px] font-mono font-semibold text-text-secondary mt-0.5">
            ${data.cost.toFixed(2)}
          </p>
        )}
      </div>
    </motion.div>
  );
}
