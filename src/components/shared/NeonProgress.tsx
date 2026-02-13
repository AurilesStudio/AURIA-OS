import { motion } from "framer-motion";

interface NeonProgressProps {
  value: number;
  max: number;
  color: string;
  className?: string;
}

export function NeonProgress({
  value,
  max,
  color,
  className,
}: NeonProgressProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-white/5 ${className ?? ""}`}
    >
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}80`,
        }}
      />
    </div>
  );
}
