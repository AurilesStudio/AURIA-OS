import { motion } from "framer-motion";
import { formatTime } from "@/lib/utils";
import { ACTIVITY_TYPE_COLORS } from "@/lib/constants";
import type { ActivityEntry as ActivityEntryType } from "@/types";

interface ActivityEntryProps {
  entry: ActivityEntryType;
}

export function ActivityEntry({ entry }: ActivityEntryProps) {
  const color = ACTIVITY_TYPE_COLORS[entry.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 px-3 py-1 text-xs leading-relaxed hover:bg-white/[0.02]"
    >
      <span className="shrink-0 text-text-muted tabular-nums">
        {formatTime(entry.timestamp)}
      </span>
      <span
        className="shrink-0 w-14 text-right font-semibold uppercase"
        style={{ color }}
      >
        {entry.type}
      </span>
      <span className="text-text-primary">{entry.message}</span>
      {entry.source && (
        <span className="ml-auto shrink-0 text-text-muted">
          [{entry.source}]
        </span>
      )}
    </motion.div>
  );
}
