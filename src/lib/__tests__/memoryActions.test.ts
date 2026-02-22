import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMemoryAPI } from "../memoryActions";

function makeMockState(overrides = {}) {
  return {
    mcMemories: [] as any[],
    activeProjectId: "proj-1",
    addMCMemory: vi.fn(function (this: any, memory: any) {
      const id = `mem-${Date.now()}`;
      this.mcMemories = [...this.mcMemories, { id, createdAt: Date.now(), ...memory }];
    }),
    updateMCMemory: vi.fn(),
    removeMCMemory: vi.fn(),
    ...overrides,
  };
}

describe("createMemoryAPI", () => {
  let state: ReturnType<typeof makeMockState>;
  let api: ReturnType<typeof createMemoryAPI>;

  beforeEach(() => {
    state = makeMockState();
    api = createMemoryAPI(() => state as any);
  });

  // ── createMemory ─────────────────────────────────────────────

  describe("createMemory", () => {
    it("creates a memory with defaults", () => {
      const result = api.createMemory({ title: "Auth decision" });
      expect(result.ok).toBe(true);
      expect(result.memoryId).toBeTruthy();
      expect(state.addMCMemory).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Auth decision", category: "context" }),
      );
    });

    it("rejects empty title", () => {
      const result = api.createMemory({ title: "" });
      expect(result.ok).toBe(false);
      expect(result.error).toBe("Title is required");
    });

    it("rejects invalid category", () => {
      const result = api.createMemory({ title: "T", category: "nope" as any });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Invalid category");
    });

    it("passes all fields to store", () => {
      api.createMemory({
        title: "Decision",
        content: "Use JWT",
        category: "decision",
        source: "meeting-notes",
        projectId: "p-2",
      });
      expect(state.addMCMemory).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Decision",
          content: "Use JWT",
          category: "decision",
          source: "meeting-notes",
          projectId: "p-2",
        }),
      );
    });
  });

  // ── updateMemory ─────────────────────────────────────────────

  describe("updateMemory", () => {
    it("updates an existing memory", () => {
      state.mcMemories = [{ id: "m-1", title: "Old" }];
      const result = api.updateMemory("m-1", { title: "New" });
      expect(result.ok).toBe(true);
      expect(state.updateMCMemory).toHaveBeenCalledWith("m-1", expect.objectContaining({ title: "New" }));
    });

    it("returns error for non-existent memory", () => {
      const result = api.updateMemory("missing", { title: "X" });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Memory not found");
    });

    it("rejects invalid category on update", () => {
      state.mcMemories = [{ id: "m-1" }];
      const result = api.updateMemory("m-1", { category: "nope" as any });
      expect(result.ok).toBe(false);
    });
  });

  // ── deleteMemory ─────────────────────────────────────────────

  describe("deleteMemory", () => {
    it("deletes an existing memory", () => {
      state.mcMemories = [{ id: "m-1" }];
      const result = api.deleteMemory("m-1");
      expect(result.ok).toBe(true);
      expect(state.removeMCMemory).toHaveBeenCalledWith("m-1");
    });

    it("returns error for missing memory", () => {
      const result = api.deleteMemory("missing");
      expect(result.ok).toBe(false);
    });
  });

  // ── listMemories ─────────────────────────────────────────────

  describe("listMemories", () => {
    it("returns all memories without filters", () => {
      state.mcMemories = [{ id: "1" }, { id: "2" }];
      const result = api.listMemories();
      expect(result.ok).toBe(true);
      expect(result.memories).toHaveLength(2);
    });

    it("filters by category", () => {
      state.mcMemories = [
        { id: "1", category: "decision" },
        { id: "2", category: "learning" },
      ];
      const result = api.listMemories({ category: "decision" });
      expect(result.memories).toHaveLength(1);
    });

    it("filters by projectId", () => {
      state.mcMemories = [
        { id: "1", projectId: "p" },
        { id: "2", projectId: "q" },
      ];
      const result = api.listMemories({ projectId: "p" });
      expect(result.memories).toHaveLength(1);
    });

    it("filters by search query", () => {
      state.mcMemories = [
        { id: "1", title: "JWT Auth", content: "tokens", source: "" },
        { id: "2", title: "CSS fix", content: "layout", source: "" },
      ];
      const result = api.listMemories({ search: "jwt" });
      expect(result.memories).toHaveLength(1);
      expect(result.memories[0].id).toBe("1");
    });

    it("searches across title, content, and source", () => {
      state.mcMemories = [
        { id: "1", title: "Note", content: "text", source: "slack-channel" },
      ];
      const result = api.listMemories({ search: "slack" });
      expect(result.memories).toHaveLength(1);
    });
  });

  // ── searchMemories ───────────────────────────────────────────

  describe("searchMemories", () => {
    it("delegates to listMemories with search filter", () => {
      state.mcMemories = [
        { id: "1", title: "React hooks", content: "", source: "" },
        { id: "2", title: "CSS grid", content: "", source: "" },
      ];
      const result = api.searchMemories("react");
      expect(result.memories).toHaveLength(1);
      expect(result.memories[0].id).toBe("1");
    });
  });

  // ── getRecent ────────────────────────────────────────────────

  describe("getRecent", () => {
    it("returns memories sorted by createdAt desc", () => {
      state.mcMemories = [
        { id: "1", createdAt: 1000 },
        { id: "2", createdAt: 3000 },
        { id: "3", createdAt: 2000 },
      ];
      const result = api.getRecent(2);
      expect(result.memories).toHaveLength(2);
      expect(result.memories[0].id).toBe("2");
      expect(result.memories[1].id).toBe("3");
    });

    it("defaults to 10 items", () => {
      state.mcMemories = Array.from({ length: 15 }, (_, i) => ({
        id: String(i),
        createdAt: i,
      }));
      const result = api.getRecent();
      expect(result.memories).toHaveLength(10);
    });
  });
});
