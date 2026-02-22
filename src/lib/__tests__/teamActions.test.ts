import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTeamAPI } from "../teamActions";

function makeMockState(overrides = {}) {
  return {
    mcTeamAgents: [] as any[],
    activeProjectId: "proj-1",
    addMCTeamAgent: vi.fn(function (this: any, agent: any) {
      const id = `agt-${Date.now()}`;
      this.mcTeamAgents = [...this.mcTeamAgents, { id, createdAt: Date.now(), ...agent }];
    }),
    updateMCTeamAgent: vi.fn(),
    removeMCTeamAgent: vi.fn(),
    ...overrides,
  };
}

describe("createTeamAPI", () => {
  let state: ReturnType<typeof makeMockState>;
  let api: ReturnType<typeof createTeamAPI>;

  beforeEach(() => {
    state = makeMockState();
    api = createTeamAPI(() => state as any);
  });

  // ── createAgent ──────────────────────────────────────────────

  describe("createAgent", () => {
    it("creates an agent with defaults", () => {
      const result = api.createAgent({ name: "DevBot" });
      expect(result.ok).toBe(true);
      expect(result.agentId).toBeTruthy();
      expect(state.addMCTeamAgent).toHaveBeenCalledWith(
        expect.objectContaining({ name: "DevBot", status: "idle" }),
      );
    });

    it("rejects empty name", () => {
      const result = api.createAgent({ name: "" });
      expect(result.ok).toBe(false);
      expect(result.error).toBe("Name is required");
    });

    it("rejects invalid status", () => {
      const result = api.createAgent({ name: "A", status: "nope" as any });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Invalid status");
    });

    it("passes all fields to store", () => {
      api.createAgent({
        name: "QA Bot",
        role: "Tester",
        responsibilities: "Run tests",
        status: "active",
        avatarUrl: "http://img.png",
        projectId: "p-2",
      });
      expect(state.addMCTeamAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "QA Bot",
          role: "Tester",
          responsibilities: "Run tests",
          status: "active",
          avatarUrl: "http://img.png",
          projectId: "p-2",
        }),
      );
    });
  });

  // ── updateAgent ──────────────────────────────────────────────

  describe("updateAgent", () => {
    it("updates an existing agent", () => {
      state.mcTeamAgents = [{ id: "a-1", name: "Old" }];
      const result = api.updateAgent("a-1", { name: "New" });
      expect(result.ok).toBe(true);
      expect(state.updateMCTeamAgent).toHaveBeenCalledWith("a-1", expect.objectContaining({ name: "New" }));
    });

    it("returns error for non-existent agent", () => {
      const result = api.updateAgent("missing", { name: "X" });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("Agent not found");
    });

    it("rejects invalid status on update", () => {
      state.mcTeamAgents = [{ id: "a-1" }];
      const result = api.updateAgent("a-1", { status: "nope" as any });
      expect(result.ok).toBe(false);
    });
  });

  // ── setStatus ────────────────────────────────────────────────

  describe("setStatus", () => {
    it("sets agent status", () => {
      state.mcTeamAgents = [{ id: "a-1" }];
      const result = api.setStatus("a-1", "active");
      expect(result.ok).toBe(true);
      expect(state.updateMCTeamAgent).toHaveBeenCalledWith("a-1", expect.objectContaining({ status: "active" }));
    });
  });

  // ── logTask ──────────────────────────────────────────────────

  describe("logTask", () => {
    it("appends task ID to agent history", () => {
      state.mcTeamAgents = [{ id: "a-1", taskHistory: ["t-1"] }];
      const result = api.logTask("a-1", "t-2");
      expect(result.ok).toBe(true);
      expect(state.updateMCTeamAgent).toHaveBeenCalledWith(
        "a-1",
        expect.objectContaining({ taskHistory: ["t-1", "t-2"] }),
      );
    });

    it("returns error for missing agent", () => {
      const result = api.logTask("missing", "t-1");
      expect(result.ok).toBe(false);
    });
  });

  // ── deleteAgent ──────────────────────────────────────────────

  describe("deleteAgent", () => {
    it("deletes an existing agent", () => {
      state.mcTeamAgents = [{ id: "a-1" }];
      const result = api.deleteAgent("a-1");
      expect(result.ok).toBe(true);
      expect(state.removeMCTeamAgent).toHaveBeenCalledWith("a-1");
    });

    it("returns error for missing agent", () => {
      const result = api.deleteAgent("missing");
      expect(result.ok).toBe(false);
    });
  });

  // ── listAgents ───────────────────────────────────────────────

  describe("listAgents", () => {
    it("returns all agents without filters", () => {
      state.mcTeamAgents = [{ id: "1" }, { id: "2" }];
      const result = api.listAgents();
      expect(result.ok).toBe(true);
      expect(result.agents).toHaveLength(2);
    });

    it("filters by status", () => {
      state.mcTeamAgents = [
        { id: "1", status: "active" },
        { id: "2", status: "idle" },
      ];
      const result = api.listAgents({ status: "active" });
      expect(result.agents).toHaveLength(1);
    });

    it("filters by projectId", () => {
      state.mcTeamAgents = [
        { id: "1", projectId: "p" },
        { id: "2", projectId: "q" },
      ];
      const result = api.listAgents({ projectId: "p" });
      expect(result.agents).toHaveLength(1);
    });

    it("filters by search query", () => {
      state.mcTeamAgents = [
        { id: "1", name: "DevBot", role: "Developer", responsibilities: "code" },
        { id: "2", name: "QABot", role: "Tester", responsibilities: "test" },
      ];
      const result = api.listAgents({ search: "dev" });
      expect(result.agents).toHaveLength(1);
      expect(result.agents[0].id).toBe("1");
    });

    it("searches across name, role, and responsibilities", () => {
      state.mcTeamAgents = [
        { id: "1", name: "Bot", role: "Dev", responsibilities: "write frontend code" },
      ];
      const result = api.listAgents({ search: "frontend" });
      expect(result.agents).toHaveLength(1);
    });
  });

  // ── getActiveAgents ──────────────────────────────────────────

  describe("getActiveAgents", () => {
    it("returns only active agents", () => {
      state.mcTeamAgents = [
        { id: "1", status: "active" },
        { id: "2", status: "idle" },
        { id: "3", status: "active" },
      ];
      const result = api.getActiveAgents();
      expect(result.agents).toHaveLength(2);
    });
  });
});
