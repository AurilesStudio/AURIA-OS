import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCalendarAPI } from "../calendarActions";

function makeMockState(overrides = {}) {
  return {
    mcCalendarEvents: [] as any[],
    activeProjectId: "proj-1",
    addMCCalendarEvent: vi.fn(function (this: any, event: any) {
      const id = `evt-${Date.now()}`;
      this.mcCalendarEvents = [...this.mcCalendarEvents, { id, createdAt: Date.now(), ...event }];
    }),
    updateMCCalendarEvent: vi.fn(),
    removeMCCalendarEvent: vi.fn(),
    ...overrides,
  };
}

describe("createCalendarAPI", () => {
  let state: ReturnType<typeof makeMockState>;
  let api: ReturnType<typeof createCalendarAPI>;

  beforeEach(() => {
    state = makeMockState();
    api = createCalendarAPI(() => state as any);
  });

  // ── createEvent ──────────────────────────────────────────────

  describe("createEvent", () => {
    it("creates an event with defaults", () => {
      const result = api.createEvent({ title: "Standup", startDate: 1000, endDate: 2000 });
      expect(result.ok).toBe(true);
      expect(result.eventId).toBeTruthy();
      expect(state.addMCCalendarEvent).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Standup", type: "meeting", status: "scheduled" }),
      );
    });

    it("rejects empty title", () => {
      const result = api.createEvent({ title: "", startDate: 1000, endDate: 2000 });
      expect(result.ok).toBe(false);
      expect(result.error).toBe("Title is required");
    });

    it("rejects missing dates", () => {
      const result = api.createEvent({ title: "T", startDate: 0, endDate: 2000 });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("dates are required");
    });

    it("rejects end < start", () => {
      const result = api.createEvent({ title: "T", startDate: 2000, endDate: 1000 });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("End date");
    });

    it("rejects invalid type", () => {
      const result = api.createEvent({ title: "T", startDate: 1000, endDate: 2000, type: "nope" as any });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Invalid type");
    });

    it("rejects invalid status", () => {
      const result = api.createEvent({ title: "T", startDate: 1000, endDate: 2000, status: "nope" as any });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Invalid status");
    });
  });

  // ── updateEvent ──────────────────────────────────────────────

  describe("updateEvent", () => {
    it("updates an existing event", () => {
      state.mcCalendarEvents = [{ id: "e-1", title: "Old" }];
      const result = api.updateEvent("e-1", { title: "New" });
      expect(result.ok).toBe(true);
      expect(state.updateMCCalendarEvent).toHaveBeenCalledWith("e-1", expect.objectContaining({ title: "New" }));
    });

    it("returns error for non-existent event", () => {
      const result = api.updateEvent("missing", { title: "X" });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Event not found");
    });

    it("rejects invalid type on update", () => {
      state.mcCalendarEvents = [{ id: "e-1" }];
      const result = api.updateEvent("e-1", { type: "nope" as any });
      expect(result.ok).toBe(false);
    });

    it("rejects invalid status on update", () => {
      state.mcCalendarEvents = [{ id: "e-1" }];
      const result = api.updateEvent("e-1", { status: "nope" as any });
      expect(result.ok).toBe(false);
    });
  });

  // ── markExecuted ─────────────────────────────────────────────

  describe("markExecuted", () => {
    it("marks event as completed with result", () => {
      state.mcCalendarEvents = [{ id: "e-1" }];
      const result = api.markExecuted("e-1", "Deployed v1.2");
      expect(result.ok).toBe(true);
      expect(state.updateMCCalendarEvent).toHaveBeenCalledWith(
        "e-1",
        expect.objectContaining({ status: "completed", executionResult: "Deployed v1.2" }),
      );
    });
  });

  // ── deleteEvent ──────────────────────────────────────────────

  describe("deleteEvent", () => {
    it("deletes an existing event", () => {
      state.mcCalendarEvents = [{ id: "e-1" }];
      const result = api.deleteEvent("e-1");
      expect(result.ok).toBe(true);
      expect(state.removeMCCalendarEvent).toHaveBeenCalledWith("e-1");
    });

    it("returns error for missing event", () => {
      const result = api.deleteEvent("missing");
      expect(result.ok).toBe(false);
    });
  });

  // ── listEvents ───────────────────────────────────────────────

  describe("listEvents", () => {
    it("returns all events without filters", () => {
      state.mcCalendarEvents = [{ id: "1" }, { id: "2" }];
      const result = api.listEvents();
      expect(result.ok).toBe(true);
      expect(result.events).toHaveLength(2);
    });

    it("filters by type", () => {
      state.mcCalendarEvents = [
        { id: "1", type: "meeting" },
        { id: "2", type: "task" },
      ];
      const result = api.listEvents({ type: "meeting" });
      expect(result.events).toHaveLength(1);
    });

    it("filters by date range", () => {
      state.mcCalendarEvents = [
        { id: "1", startDate: 500, endDate: 1500 },
        { id: "2", startDate: 3000, endDate: 4000 },
      ];
      const result = api.listEvents({ from: 1000, to: 2000 });
      expect(result.events).toHaveLength(1);
      expect(result.events[0].id).toBe("1");
    });
  });

  // ── getUpcoming ──────────────────────────────────────────────

  describe("getUpcoming", () => {
    it("returns events within the next N days", () => {
      const now = Date.now();
      state.mcCalendarEvents = [
        { id: "1", startDate: now + 1000, endDate: now + 2000 },
        { id: "2", startDate: now + 100 * 24 * 60 * 60 * 1000, endDate: now + 101 * 24 * 60 * 60 * 1000 },
      ];
      const result = api.getUpcoming(7);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].id).toBe("1");
    });
  });
});
