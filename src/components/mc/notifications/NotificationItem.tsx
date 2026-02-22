import { CheckSquare, FileText, AlertCircle, Info } from "lucide-react";
import type { MCNotification, MCNotificationType } from "@/types/mission-control";

const TYPE_CONFIG: Record<MCNotificationType, { icon: typeof Info; color: string }> = {
  task: { icon: CheckSquare, color: "#00ffff" },
  content: { icon: FileText, color: "#6366f1" },
  error: { icon: AlertCircle, color: "#ef4444" },
  system: { icon: Info, color: "#f59e0b" },
};

function timeAgo(epoch: number): string {
  const diff = Date.now() - epoch;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface NotificationItemProps {
  notification: MCNotification;
  onRead: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const config = TYPE_CONFIG[notification.type];
  const Icon = config.icon;

  return (
    <button
      onClick={() => onRead(notification.id)}
      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
        !notification.read ? "bg-white/5" : ""
      }`}
    >
      {/* Type icon */}
      <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: config.color }} />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-text-primary">{notification.title}</p>
        {notification.message && (
          <p className="mt-0.5 line-clamp-2 text-[11px] text-text-muted/70">{notification.message}</p>
        )}
        <span className="mt-1 block text-[10px] text-text-muted/50">{timeAgo(notification.createdAt)}</span>
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-mc-accent" />
      )}
    </button>
  );
}
