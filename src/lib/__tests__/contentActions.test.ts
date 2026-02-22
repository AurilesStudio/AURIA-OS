import { describe, it, expect, vi, beforeEach } from "vitest";
import { createContentAPI } from "../contentActions";

function makeMockState(overrides = {}) {
  return {
    mcContentPipeline: [] as any[],
    activeProjectId: "proj-1",
    addMCContentItem: vi.fn(function (this: any, item: any) {
      const id = `cnt-${Date.now()}`;
      this.mcContentPipeline = [...this.mcContentPipeline, { id, createdAt: Date.now(), ...item }];
    }),
    updateMCContentItem: vi.fn(),
    removeMCContentItem: vi.fn(),
    ...overrides,
  };
}

describe("createContentAPI", () => {
  let state: ReturnType<typeof makeMockState>;
  let api: ReturnType<typeof createContentAPI>;

  beforeEach(() => {
    state = makeMockState();
    api = createContentAPI(() => state as any);
  });

  // ── createContent ────────────────────────────────────────────

  describe("createContent", () => {
    it("creates content with defaults", () => {
      const result = api.createContent({ title: "Thread" });
      expect(result.ok).toBe(true);
      expect(result.itemId).toBeTruthy();
      expect(state.addMCContentItem).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Thread", stage: "idea", platform: "X" }),
      );
    });

    it("rejects empty title", () => {
      const result = api.createContent({ title: "" });
      expect(result.ok).toBe(false);
      expect(result.error).toBe("Title is required");
    });

    it("rejects invalid stage", () => {
      const result = api.createContent({ title: "T", stage: "nope" as any });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Invalid stage");
    });

    it("passes all fields to store", () => {
      api.createContent({
        title: "Post",
        stage: "draft",
        platform: "LinkedIn",
        script: "Hello world",
        mediaUrls: ["http://img.png"],
        scheduledDate: 9999,
        projectId: "p-2",
      });
      expect(state.addMCContentItem).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Post",
          stage: "draft",
          platform: "LinkedIn",
          script: "Hello world",
          mediaUrls: ["http://img.png"],
          scheduledDate: 9999,
          projectId: "p-2",
        }),
      );
    });
  });

  // ── updateContent ────────────────────────────────────────────

  describe("updateContent", () => {
    it("updates an existing item", () => {
      state.mcContentPipeline = [{ id: "c-1", title: "Old" }];
      const result = api.updateContent("c-1", { title: "New" });
      expect(result.ok).toBe(true);
      expect(state.updateMCContentItem).toHaveBeenCalledWith("c-1", expect.objectContaining({ title: "New" }));
    });

    it("returns error for non-existent item", () => {
      const result = api.updateContent("missing", { title: "X" });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Content not found");
    });

    it("rejects invalid stage on update", () => {
      state.mcContentPipeline = [{ id: "c-1" }];
      const result = api.updateContent("c-1", { stage: "nope" as any });
      expect(result.ok).toBe(false);
    });
  });

  // ── moveStage ────────────────────────────────────────────────

  describe("moveStage", () => {
    it("moves item to a new stage", () => {
      state.mcContentPipeline = [{ id: "c-1" }];
      const result = api.moveStage("c-1", "review");
      expect(result.ok).toBe(true);
      expect(state.updateMCContentItem).toHaveBeenCalledWith("c-1", expect.objectContaining({ stage: "review" }));
    });
  });

  // ── deleteContent ────────────────────────────────────────────

  describe("deleteContent", () => {
    it("deletes an existing item", () => {
      state.mcContentPipeline = [{ id: "c-1" }];
      const result = api.deleteContent("c-1");
      expect(result.ok).toBe(true);
      expect(state.removeMCContentItem).toHaveBeenCalledWith("c-1");
    });

    it("returns error for missing item", () => {
      const result = api.deleteContent("missing");
      expect(result.ok).toBe(false);
    });
  });

  // ── listContent ──────────────────────────────────────────────

  describe("listContent", () => {
    it("returns all items without filters", () => {
      state.mcContentPipeline = [{ id: "1" }, { id: "2" }];
      const result = api.listContent();
      expect(result.ok).toBe(true);
      expect(result.items).toHaveLength(2);
    });

    it("filters by stage", () => {
      state.mcContentPipeline = [
        { id: "1", stage: "idea" },
        { id: "2", stage: "draft" },
      ];
      const result = api.listContent({ stage: "idea" });
      expect(result.items).toHaveLength(1);
    });

    it("filters by platform (case-insensitive)", () => {
      state.mcContentPipeline = [
        { id: "1", platform: "X" },
        { id: "2", platform: "LinkedIn" },
      ];
      const result = api.listContent({ platform: "x" });
      expect(result.items).toHaveLength(1);
    });

    it("filters by projectId", () => {
      state.mcContentPipeline = [
        { id: "1", projectId: "p" },
        { id: "2", projectId: "q" },
      ];
      const result = api.listContent({ projectId: "p" });
      expect(result.items).toHaveLength(1);
    });
  });

  // ── getScheduled ─────────────────────────────────────────────

  describe("getScheduled", () => {
    it("returns items with scheduledDate that are not published", () => {
      state.mcContentPipeline = [
        { id: "1", scheduledDate: 9999, stage: "scheduled" },
        { id: "2", scheduledDate: null, stage: "idea" },
        { id: "3", scheduledDate: 8888, stage: "published" },
      ];
      const result = api.getScheduled();
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe("1");
    });
  });
});
