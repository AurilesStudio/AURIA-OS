/**
 * Notification Actions — structured API for AURIA agents.
 *
 * Wraps the Zustand store methods with validation,
 * providing a clean interface for agents to manage notifications.
 *
 * Usage (from agent execution context):
 *   const api = createNotificationAPI(useStore.getState);
 *   api.notify({ title: "Task completed", message: "...", type: "task" });
 */

import type {
  MCNotification,
  MCNotificationType,
} from "@/types/mission-control";
import type { StoreApi } from "zustand";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetState = StoreApi<any>["getState"];

export interface NotifyInput {
  title: string;
  message?: string;
  type?: MCNotificationType;
}

export interface NotificationActionResult {
  ok: boolean;
  error?: string;
  notificationId?: string;
}

export interface NotificationQueryResult {
  ok: boolean;
  notifications: MCNotification[];
  error?: string;
}

const VALID_TYPES: MCNotificationType[] = ["task", "content", "error", "system"];

export function createNotificationAPI(getState: GetState) {
  return {
    /** Create a new notification. */
    notify(input: NotifyInput): NotificationActionResult {
      if (!input.title?.trim()) {
        return { ok: false, error: "Title is required" };
      }
      if (input.type && !VALID_TYPES.includes(input.type)) {
        return { ok: false, error: `Invalid type: ${input.type}` };
      }

      const state = getState();
      state.addMCNotification({
        title: input.title.trim(),
        message: input.message ?? "",
        type: input.type ?? "system",
      });

      const notifications: MCNotification[] = getState().mcNotifications;
      const created = notifications.find((n: MCNotification) => n.title === input.title.trim());

      return { ok: true, notificationId: created?.id };
    },

    /** Dismiss (remove) a notification by ID. */
    dismiss(notificationId: string): NotificationActionResult {
      const state = getState();
      const notif = (state.mcNotifications as MCNotification[]).find((n) => n.id === notificationId);
      if (!notif) {
        return { ok: false, error: `Notification not found: ${notificationId}` };
      }

      state.removeMCNotification(notificationId);
      return { ok: true, notificationId };
    },

    /** Mark a notification as read. */
    markRead(notificationId: string): NotificationActionResult {
      const state = getState();
      const notif = (state.mcNotifications as MCNotification[]).find((n) => n.id === notificationId);
      if (!notif) {
        return { ok: false, error: `Notification not found: ${notificationId}` };
      }

      state.markMCNotificationRead(notificationId);
      return { ok: true, notificationId };
    },

    /** Mark all notifications as read. */
    markAllRead(): NotificationActionResult {
      const state = getState();
      state.markAllMCNotificationsRead();
      return { ok: true };
    },

    /** List notifications, optionally filtered. */
    listNotifications(filter?: {
      type?: MCNotificationType;
      unreadOnly?: boolean;
    }): NotificationQueryResult {
      const state = getState();
      let notifications: MCNotification[] = state.mcNotifications;

      if (filter?.type) notifications = notifications.filter((n) => n.type === filter.type);
      if (filter?.unreadOnly) notifications = notifications.filter((n) => !n.read);

      return { ok: true, notifications };
    },

    /** Get count of unread notifications. */
    getUnreadCount(): { ok: true; count: number } {
      const state = getState();
      const count = (state.mcNotifications as MCNotification[]).filter((n) => !n.read).length;
      return { ok: true, count };
    },
  };
}
