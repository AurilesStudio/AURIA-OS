import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import type { SystemStatus } from "@/types";

interface StatusBadgeProps {
  status: SystemStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const color = STATUS_COLORS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider",
        className,
      )}
      style={{
        color,
        borderColor: `${color}40`,
        backgroundColor: `${color}10`,
      }}
    >
      <span
        className="h-2 w-2 rounded-full animate-pulse"
        style={{ backgroundColor: color }}
      />
      {status}
    </span>
  );
}
