import { describe, it, expect, vi, beforeEach } from "vitest";
import { createNotificationAPI } from "../notificationActions";

function makeMockState(overrides = {}) {
  return {
    mcNotifications: [] as any[],
    addMCNotification: vi.fn(function (this: any, n: any) {
      const id = `notif-${Date.now()}`;
      this.mcNotifications = [
        { id, read: false, createdAt: Date.now(), ...n },
        ...this.mcNotifications,
      ];
    }),
    markMCNotificationRead: vi.fn(function (this: any, id: string) {
      this.mcNotifications = this.mcNotifications.map((n: any) =>
        n.id === id ? { ...n, read: true } : n,
      );
    }),
    markAllMCNotificationsRead: vi.fn(function (this: any) {
      this.mcNotifications = this.mcNotifications.map((n: any) => ({ ...n, read: true }));
    }),
    removeMCNotification: vi.fn(function (this: any, id: string) {
      this.mcNotifications = this.mcNotifications.filter((n: any) => n.id !== id);
    }),
    clearMCNotifications: vi.fn(function (this: any) {
      this.mcNotifications = [];
    }),
    ...overrides,
  };
}

describe("createNotificationAPI", () => {
  let state: ReturnType<typeof makeMockState>;
  let api: ReturnType<typeof createNotificationAPI>;

  beforeEach(() => {
    state = makeMockState();
    api = createNotificationAPI(() => state as any);
  });

  // ── notify ──────────────────────────────────────────────────

  describe("notify", () => {
    it("creates a notification with defaults", () => {
      const result = api.notify({ title: "Task done" });
      expect(result.ok).toBe(true);
      expect(result.notificationId).toBeTruthy();
      expect(state.addMCNotification).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Task done", type: "system", message: "" }),
      );
    });

    it("rejects empty title", () => {
      const result = api.notify({ title: "" });
      expect(result.ok).toBe(false);
      expect(result.error).toBe("Title is required");
    });

    it("rejects invalid type", () => {
      const result = api.notify({ title: "T", type: "nope" as any });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Invalid type");
    });

    it("passes all fields to store", () => {
      api.notify({ title: "Deploy", message: "v2.1 live", type: "task" });
      expect(state.addMCNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Deploy",
          message: "v2.1 live",
          type: "task",
        }),
      );
    });

    it("trims whitespace from title", () => {
      api.notify({ title: "  spaced  " });
      expect(state.addMCNotification).toHaveBeenCalledWith(
        expect.objectContaining({ title: "spaced" }),
      );
    });
  });

  // ── dismiss ─────────────────────────────────────────────────

  describe("dismiss", () => {
    it("removes an existing notification", () => {
      state.mcNotifications = [{ id: "n-1", title: "X", read: false }];
      const result = api.dismiss("n-1");
      expect(result.ok).toBe(true);
      expect(state.removeMCNotification).toHaveBeenCalledWith("n-1");
    });

    it("returns error for missing notification", () => {
      const result = api.dismiss("missing");
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Notification not found");
    });
  });

  // ── markRead ────────────────────────────────────────────────

  describe("markRead", () => {
    it("marks an existing notification as read", () => {
      state.mcNotifications = [{ id: "n-1", read: false }];
      const result = api.markRead("n-1");
      expect(result.ok).toBe(true);
      expect(state.markMCNotificationRead).toHaveBeenCalledWith("n-1");
    });

    it("returns error for non-existent notification", () => {
      const result = api.markRead("missing");
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Notification not found");
    });
  });

  // ── markAllRead ─────────────────────────────────────────────

  describe("markAllRead", () => {
    it("marks all notifications as read", () => {
      state.mcNotifications = [
        { id: "n-1", read: false },
        { id: "n-2", read: false },
      ];
      const result = api.markAllRead();
      expect(result.ok).toBe(true);
      expect(state.markAllMCNotificationsRead).toHaveBeenCalled();
    });
  });

  // ── listNotifications ───────────────────────────────────────

  describe("listNotifications", () => {
    it("returns all notifications without filters", () => {
      state.mcNotifications = [{ id: "1" }, { id: "2" }];
      const result = api.listNotifications();
      expect(result.ok).toBe(true);
      expect(result.notifications).toHaveLength(2);
    });

    it("filters by type", () => {
      state.mcNotifications = [
        { id: "1", type: "task" },
        { id: "2", type: "error" },
      ];
      const result = api.listNotifications({ type: "task" });
      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].id).toBe("1");
    });

    it("filters by unreadOnly", () => {
      state.mcNotifications = [
        { id: "1", read: false },
        { id: "2", read: true },
      ];
      const result = api.listNotifications({ unreadOnly: true });
      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].id).toBe("1");
    });

    it("combines type and unreadOnly filters", () => {
      state.mcNotifications = [
        { id: "1", type: "task", read: false },
        { id: "2", type: "task", read: true },
        { id: "3", type: "error", read: false },
      ];
      const result = api.listNotifications({ type: "task", unreadOnly: true });
      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].id).toBe("1");
    });
  });

  // ── getUnreadCount ──────────────────────────────────────────

  describe("getUnreadCount", () => {
    it("returns 0 when no notifications", () => {
      const result = api.getUnreadCount();
      expect(result.ok).toBe(true);
      expect(result.count).toBe(0);
    });

    it("counts only unread notifications", () => {
      state.mcNotifications = [
        { id: "1", read: false },
        { id: "2", read: true },
        { id: "3", read: false },
      ];
      const result = api.getUnreadCount();
      expect(result.count).toBe(2);
    });
  });
});
