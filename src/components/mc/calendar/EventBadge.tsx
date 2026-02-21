import type { MCCalendarEvent, MCCalendarEventType, MCCalendarEventStatus } from "@/types/mission-control";

const TYPE_COLORS: Record<MCCalendarEventType, string> = {
  task: "#00ffff",
  meeting: "#6366f1",
  deployment: "#f59e0b",
  reminder: "#f59e0b",
  milestone: "#10b981",
};

const STATUS_COLORS: Record<MCCalendarEventStatus, string> = {
  scheduled: "#6b7280",
  in_progress: "#f59e0b",
  completed: "#10b981",
  cancelled: "#ef4444",
};

interface EventBadgeProps {
  event: MCCalendarEvent;
  onClick?: () => void;
}

export function EventBadge({ event, onClick }: EventBadgeProps) {
  const typeColor = TYPE_COLORS[event.type];
  const statusColor = STATUS_COLORS[event.status];

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="group flex w-full items-center gap-1 rounded px-1 py-0.5 text-left transition-colors hover:bg-white/10"
    >
      {/* Type dot */}
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: typeColor }}
      />

      {/* Title */}
      <span className="min-w-0 flex-1 truncate text-[10px] text-text-primary/80 group-hover:text-text-primary">
        {event.title}
      </span>

      {/* Status dot */}
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: statusColor }}
      />
    </button>
  );
}

/** Dot-only variant for month view overflow */
export function EventDot({ type, onClick }: { type: MCCalendarEventType; onClick?: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="h-2 w-2 rounded-full transition-transform hover:scale-125"
      style={{ backgroundColor: TYPE_COLORS[type] }}
    />
  );
}

export { TYPE_COLORS, STATUS_COLORS };
