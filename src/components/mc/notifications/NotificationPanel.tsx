import { motion } from "framer-motion";
import { CheckCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import type { MCNotificationType } from "@/types/mission-control";
import { NotificationItem } from "./NotificationItem";

const TYPE_FILTERS: { value: MCNotificationType | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "task", label: "Task" },
  { value: "content", label: "Content" },
  { value: "error", label: "Error" },
  { value: "system", label: "System" },
];

export function NotificationPanel() {
  const notifications = useStore((s) => s.mcNotifications);
  const markAllRead = useStore((s) => s.markAllMCNotificationsRead);
  const markRead = useStore((s) => s.markMCNotificationRead);
  const clear = useStore((s) => s.clearMCNotifications);

  const [typeFilter, setTypeFilter] = useState<MCNotificationType | "">("");

  const filtered = typeFilter
    ? notifications.filter((n) => n.type === typeFilter)
    : notifications;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-lg border border-white/10 overlay-glass shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <span className="text-xs font-semibold text-text-primary">Notifications</span>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-text-muted transition-colors hover:text-text-primary"
          >
            <CheckCheck className="h-3 w-3" />
            Mark all read
          </button>
          <button
            onClick={clear}
            className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-text-muted transition-colors hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1 border-b border-white/5 px-4 py-2">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={`rounded px-2.5 py-1 text-[10px] font-medium transition-colors ${
              typeFilter === f.value
                ? "bg-white/10 text-text-primary"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="max-h-[380px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-xs text-text-muted/50">No notifications</span>
          </div>
        ) : (
          filtered.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={markRead} />
          ))
        )}
      </div>
    </motion.div>
  );
}
