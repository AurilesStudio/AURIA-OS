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
const VIEW_SIZE = 120;

export function TokenGauge({ data, index }: TokenGaugeProps) {
  const pct = Math.min(data.used / data.limit, 1);
  const dashOffset = CIRCUMFERENCE * (1 - pct);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col items-center gap-2"
    >
      <svg
        width={VIEW_SIZE}
        height={VIEW_SIZE * 0.65}
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE * 0.65}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M ${VIEW_SIZE * 0.1} ${VIEW_SIZE * 0.58} A ${RADIUS} ${RADIUS} 0 0 1 ${VIEW_SIZE * 0.9} ${VIEW_SIZE * 0.58}`}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <motion.path
          d={`M ${VIEW_SIZE * 0.1} ${VIEW_SIZE * 0.58} A ${RADIUS} ${RADIUS} 0 0 1 ${VIEW_SIZE * 0.9} ${VIEW_SIZE * 0.58}`}
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
          x={VIEW_SIZE / 2}
          y={VIEW_SIZE * 0.45}
          textAnchor="middle"
          className="fill-text-primary text-lg font-bold"
          style={{ fontSize: "16px", fontFamily: "JetBrains Mono, monospace" }}
        >
          {Math.round(pct * 100)}%
        </text>
      </svg>

      <div className="text-center">
        <p className="text-xs font-semibold" style={{ color: data.color }}>
          {data.label}
        </p>
        <p className="text-xs text-text-muted">
          {formatTokenCount(data.used)} / {formatTokenCount(data.limit)}
        </p>
      </div>
    </motion.div>
  );
}
