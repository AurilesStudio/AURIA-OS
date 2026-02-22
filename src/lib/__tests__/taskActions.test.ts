import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTaskAPI } from "../taskActions";

function makeMockState(overrides = {}) {
  return {
    mcTasks: [] as any[],
    activeProjectId: "proj-1",
    addMCTask: vi.fn(function (this: any, task: any) {
      const id = `task-${Date.now()}`;
      this.mcTasks = [...this.mcTasks, { id, createdAt: Date.now(), updatedAt: Date.now(), ...task }];
    }),
    updateMCTask: vi.fn(),
    removeMCTask: vi.fn(),
    ...overrides,
  };
}

describe("createTaskAPI", () => {
  let state: ReturnType<typeof makeMockState>;
  let api: ReturnType<typeof createTaskAPI>;

  beforeEach(() => {
    state = makeMockState();
    api = createTaskAPI(() => state as any);
  });

  // ── createTask ───────────────────────────────────────────────

  describe("createTask", () => {
    it("creates a task with defaults", () => {
      const result = api.createTask({ title: "Fix bug" });
      expect(result.ok).toBe(true);
      expect(result.taskId).toBeTruthy();
      expect(state.addMCTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Fix bug",
          status: "backlog",
          priority: "none",
        }),
      );
    });

    it("trims title whitespace", () => {
      api.createTask({ title: "  Fix bug  " });
      expect(state.addMCTask).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Fix bug" }),
      );
    });

    it("rejects empty title", () => {
      const result = api.createTask({ title: "" });
      expect(result.ok).toBe(false);
      expect(result.error).toBe("Title is required");
    });

    it("rejects whitespace-only title", () => {
      const result = api.createTask({ title: "   " });
      expect(result.ok).toBe(false);
    });

    it("rejects invalid status", () => {
      const result = api.createTask({ title: "T", status: "nope" as any });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Invalid status");
    });

    it("rejects invalid priority", () => {
      const result = api.createTask({ title: "T", priority: "nope" as any });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Invalid priority");
    });

    it("passes all fields to store", () => {
      api.createTask({
        title: "Task",
        status: "todo",
        priority: "high",
        assigneeId: "a-1",
        labels: ["bug"],
        projectId: "p-1",
      });
      expect(state.addMCTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Task",
          status: "todo",
          priority: "high",
          assigneeId: "a-1",
          labels: ["bug"],
          projectId: "p-1",
        }),
      );
    });
  });

  // ── updateTask ───────────────────────────────────────────────

  describe("updateTask", () => {
    it("updates an existing task", () => {
      state.mcTasks = [{ id: "t-1", title: "Old", status: "backlog", priority: "none" }];
      const result = api.updateTask("t-1", { title: "New" });
      expect(result.ok).toBe(true);
      expect(state.updateMCTask).toHaveBeenCalledWith("t-1", expect.objectContaining({ title: "New" }));
    });

    it("returns error for non-existent task", () => {
      const result = api.updateTask("missing", { title: "X" });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Task not found");
    });

    it("rejects invalid status on update", () => {
      state.mcTasks = [{ id: "t-1", title: "T", status: "backlog", priority: "none" }];
      const result = api.updateTask("t-1", { status: "nope" as any });
      expect(result.ok).toBe(false);
    });

    it("rejects invalid priority on update", () => {
      state.mcTasks = [{ id: "t-1", title: "T", status: "backlog", priority: "none" }];
      const result = api.updateTask("t-1", { priority: "nope" as any });
      expect(result.ok).toBe(false);
    });
  });

  // ── moveTask ─────────────────────────────────────────────────

  describe("moveTask", () => {
    it("moves a task to a new status", () => {
      state.mcTasks = [{ id: "t-1", title: "T", status: "backlog", priority: "none" }];
      const result = api.moveTask("t-1", "in_progress");
      expect(result.ok).toBe(true);
      expect(state.updateMCTask).toHaveBeenCalledWith("t-1", expect.objectContaining({ status: "in_progress" }));
    });
  });

  // ── deleteTask ───────────────────────────────────────────────

  describe("deleteTask", () => {
    it("deletes an existing task", () => {
      state.mcTasks = [{ id: "t-1", title: "T" }];
      const result = api.deleteTask("t-1");
      expect(result.ok).toBe(true);
      expect(state.removeMCTask).toHaveBeenCalledWith("t-1");
    });

    it("returns error for non-existent task", () => {
      const result = api.deleteTask("missing");
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Task not found");
    });
  });

  // ── listTasks ────────────────────────────────────────────────

  describe("listTasks", () => {
    it("returns all tasks without filters", () => {
      state.mcTasks = [
        { id: "1", status: "todo", priority: "high", assigneeId: "a", projectId: "p" },
        { id: "2", status: "done", priority: "low", assigneeId: "b", projectId: "q" },
      ];
      const result = api.listTasks();
      expect(result.ok).toBe(true);
      expect(result.tasks).toHaveLength(2);
    });

    it("filters by status", () => {
      state.mcTasks = [
        { id: "1", status: "todo" },
        { id: "2", status: "done" },
      ];
      const result = api.listTasks({ status: "todo" });
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].id).toBe("1");
    });

    it("filters by priority", () => {
      state.mcTasks = [
        { id: "1", priority: "high" },
        { id: "2", priority: "low" },
      ];
      const result = api.listTasks({ priority: "high" });
      expect(result.tasks).toHaveLength(1);
    });

    it("filters by assigneeId", () => {
      state.mcTasks = [
        { id: "1", assigneeId: "a" },
        { id: "2", assigneeId: "b" },
      ];
      const result = api.listTasks({ assigneeId: "a" });
      expect(result.tasks).toHaveLength(1);
    });

    it("filters by projectId", () => {
      state.mcTasks = [
        { id: "1", projectId: "p" },
        { id: "2", projectId: "q" },
      ];
      const result = api.listTasks({ projectId: "p" });
      expect(result.tasks).toHaveLength(1);
    });
  });

  // ── getTask ──────────────────────────────────────────────────

  describe("getTask", () => {
    it("returns a task by ID", () => {
      state.mcTasks = [{ id: "t-1", title: "Found" }];
      const result = api.getTask("t-1");
      expect(result.ok).toBe(true);
      expect(result.task?.title).toBe("Found");
    });

    it("returns error for missing task", () => {
      const result = api.getTask("missing");
      expect(result.ok).toBe(false);
    });
  });

  // ── assignTask ───────────────────────────────────────────────

  describe("assignTask", () => {
    it("assigns a task to an agent", () => {
      state.mcTasks = [{ id: "t-1", title: "T", status: "backlog", priority: "none" }];
      const result = api.assignTask("t-1", "agent-99");
      expect(result.ok).toBe(true);
      expect(state.updateMCTask).toHaveBeenCalledWith("t-1", expect.objectContaining({ assigneeId: "agent-99" }));
    });
  });
});
