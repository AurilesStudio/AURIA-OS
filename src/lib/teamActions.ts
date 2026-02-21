/**
 * Team Actions — structured CRUD API for AURIA agents.
 *
 * Wraps the Zustand store methods with validation,
 * providing a clean interface for LLM agents to manage the team roster.
 *
 * Usage (from agent execution context):
 *   const api = createTeamAPI(useStore.getState);
 *   const result = api.createAgent({ name: "Dev Agent", role: "Developer" });
 */

import type {
  MCTeamAgent,
  MCTeamAgentStatus,
} from "@/types/mission-control";
import type { StoreApi } from "zustand";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetState = StoreApi<any>["getState"];

export interface CreateAgentInput {
  name: string;
  role?: string;
  responsibilities?: string;
  status?: MCTeamAgentStatus;
  avatarUrl?: string;
  projectId?: string;
}

export interface UpdateAgentInput {
  name?: string;
  role?: string;
  responsibilities?: string;
  status?: MCTeamAgentStatus;
  avatarUrl?: string;
  taskHistory?: string[];
}

export interface TeamActionResult {
  ok: boolean;
  error?: string;
  agentId?: string;
}

export interface TeamQueryResult {
  ok: boolean;
  agents: MCTeamAgent[];
  error?: string;
}

const VALID_STATUSES: MCTeamAgentStatus[] = ["active", "idle", "offline"];

export function createTeamAPI(getState: GetState) {
  return {
    /** Create a new team agent. */
    createAgent(input: CreateAgentInput): TeamActionResult {
      if (!input.name?.trim()) {
        return { ok: false, error: "Name is required" };
      }
      if (input.status && !VALID_STATUSES.includes(input.status)) {
        return { ok: false, error: `Invalid status: ${input.status}` };
      }

      const state = getState();
      state.addMCTeamAgent({
        name: input.name.trim(),
        role: input.role ?? "",
        responsibilities: input.responsibilities ?? "",
        status: input.status ?? "idle",
        avatarUrl: input.avatarUrl ?? "",
        taskHistory: [],
        projectId: input.projectId ?? state.activeProjectId,
      });

      const agents: MCTeamAgent[] = getState().mcTeamAgents;
      const created = [...agents].reverse().find((a: MCTeamAgent) => a.name === input.name.trim());

      return { ok: true, agentId: created?.id };
    },

    /** Update an existing agent by ID. */
    updateAgent(agentId: string, input: UpdateAgentInput): TeamActionResult {
      const state = getState();
      const agent = (state.mcTeamAgents as MCTeamAgent[]).find((a) => a.id === agentId);
      if (!agent) {
        return { ok: false, error: `Agent not found: ${agentId}` };
      }

      if (input.status && !VALID_STATUSES.includes(input.status)) {
        return { ok: false, error: `Invalid status: ${input.status}` };
      }

      const updates: Partial<Omit<MCTeamAgent, "id">> = {};
      if (input.name !== undefined) updates.name = input.name.trim();
      if (input.role !== undefined) updates.role = input.role;
      if (input.responsibilities !== undefined) updates.responsibilities = input.responsibilities;
      if (input.status !== undefined) updates.status = input.status;
      if (input.avatarUrl !== undefined) updates.avatarUrl = input.avatarUrl;
      if (input.taskHistory !== undefined) updates.taskHistory = input.taskHistory;

      state.updateMCTeamAgent(agentId, updates);
      return { ok: true, agentId };
    },

    /** Set agent status (active/idle/offline). */
    setStatus(agentId: string, status: MCTeamAgentStatus): TeamActionResult {
      return this.updateAgent(agentId, { status });
    },

    /** Log a completed task ID to an agent's history. */
    logTask(agentId: string, taskId: string): TeamActionResult {
      const state = getState();
      const agent = (state.mcTeamAgents as MCTeamAgent[]).find((a) => a.id === agentId);
      if (!agent) {
        return { ok: false, error: `Agent not found: ${agentId}` };
      }

      return this.updateAgent(agentId, {
        taskHistory: [...agent.taskHistory, taskId],
      });
    },

    /** Delete an agent by ID. */
    deleteAgent(agentId: string): TeamActionResult {
      const state = getState();
      const agent = (state.mcTeamAgents as MCTeamAgent[]).find((a) => a.id === agentId);
      if (!agent) {
        return { ok: false, error: `Agent not found: ${agentId}` };
      }

      state.removeMCTeamAgent(agentId);
      return { ok: true, agentId };
    },

    /** List agents, optionally filtered. */
    listAgents(filters?: {
      status?: MCTeamAgentStatus;
      projectId?: string;
      search?: string;
    }): TeamQueryResult {
      const state = getState();
      let agents: MCTeamAgent[] = state.mcTeamAgents;

      if (filters?.status) agents = agents.filter((a) => a.status === filters.status);
      if (filters?.projectId) agents = agents.filter((a) => a.projectId === filters.projectId);
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        agents = agents.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.role.toLowerCase().includes(q) ||
            a.responsibilities.toLowerCase().includes(q),
        );
      }

      return { ok: true, agents };
    },

    /** Get active agents only. */
    getActiveAgents(): TeamQueryResult {
      return this.listAgents({ status: "active" });
    },

    /** Get a single agent by ID. */
    getAgent(agentId: string): { ok: boolean; agent?: MCTeamAgent; error?: string } {
      const state = getState();
      const agent = (state.mcTeamAgents as MCTeamAgent[]).find((a) => a.id === agentId);
      if (!agent) return { ok: false, error: `Agent not found: ${agentId}` };
      return { ok: true, agent };
    },
  };
}
