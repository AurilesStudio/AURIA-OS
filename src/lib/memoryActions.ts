/**
 * Memory Actions — structured CRUD API for AURIA agents.
 *
 * Wraps the Zustand store methods with validation,
 * providing a clean interface for LLM agents to manage the knowledge base.
 *
 * Usage (from agent execution context):
 *   const api = createMemoryAPI(useStore.getState);
 *   const result = api.createMemory({ title: "Auth decision", category: "decision", content: "..." });
 */

import type {
  MCMemory,
  MCMemoryCategory,
} from "@/types/mission-control";
import type { StoreApi } from "zustand";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetState = StoreApi<any>["getState"];

export interface CreateMemoryInput {
  title: string;
  content?: string;
  category?: MCMemoryCategory;
  source?: string;
  projectId?: string;
}

export interface UpdateMemoryInput {
  title?: string;
  content?: string;
  category?: MCMemoryCategory;
  source?: string;
}

export interface MemoryActionResult {
  ok: boolean;
  error?: string;
  memoryId?: string;
}

export interface MemoryQueryResult {
  ok: boolean;
  memories: MCMemory[];
  error?: string;
}

const VALID_CATEGORIES: MCMemoryCategory[] = ["decision", "learning", "context", "reference"];

export function createMemoryAPI(getState: GetState) {
  return {
    /** Create a new memory entry. */
    createMemory(input: CreateMemoryInput): MemoryActionResult {
      if (!input.title?.trim()) {
        return { ok: false, error: "Title is required" };
      }
      if (input.category && !VALID_CATEGORIES.includes(input.category)) {
        return { ok: false, error: `Invalid category: ${input.category}` };
      }

      const state = getState();
      state.addMCMemory({
        title: input.title.trim(),
        content: input.content ?? "",
        category: input.category ?? "context",
        source: input.source ?? "",
        projectId: input.projectId ?? state.activeProjectId,
      });

      const memories: MCMemory[] = getState().mcMemories;
      const created = [...memories].reverse().find((m: MCMemory) => m.title === input.title.trim());

      return { ok: true, memoryId: created?.id };
    },

    /** Update an existing memory by ID. */
    updateMemory(memoryId: string, input: UpdateMemoryInput): MemoryActionResult {
      const state = getState();
      const memory = (state.mcMemories as MCMemory[]).find((m) => m.id === memoryId);
      if (!memory) {
        return { ok: false, error: `Memory not found: ${memoryId}` };
      }

      if (input.category && !VALID_CATEGORIES.includes(input.category)) {
        return { ok: false, error: `Invalid category: ${input.category}` };
      }

      const updates: Partial<Omit<MCMemory, "id">> = {};
      if (input.title !== undefined) updates.title = input.title.trim();
      if (input.content !== undefined) updates.content = input.content;
      if (input.category !== undefined) updates.category = input.category;
      if (input.source !== undefined) updates.source = input.source;

      state.updateMCMemory(memoryId, updates);
      return { ok: true, memoryId };
    },

    /** Delete a memory by ID. */
    deleteMemory(memoryId: string): MemoryActionResult {
      const state = getState();
      const memory = (state.mcMemories as MCMemory[]).find((m) => m.id === memoryId);
      if (!memory) {
        return { ok: false, error: `Memory not found: ${memoryId}` };
      }

      state.removeMCMemory(memoryId);
      return { ok: true, memoryId };
    },

    /** List memories, optionally filtered. */
    listMemories(filters?: {
      category?: MCMemoryCategory;
      projectId?: string;
      search?: string;
    }): MemoryQueryResult {
      const state = getState();
      let memories: MCMemory[] = state.mcMemories;

      if (filters?.category) memories = memories.filter((m) => m.category === filters.category);
      if (filters?.projectId) memories = memories.filter((m) => m.projectId === filters.projectId);
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        memories = memories.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.content.toLowerCase().includes(q) ||
            m.source.toLowerCase().includes(q),
        );
      }

      return { ok: true, memories };
    },

    /** Search memories by full-text query across title, content, and source. */
    searchMemories(query: string): MemoryQueryResult {
      return this.listMemories({ search: query });
    },

    /** Get recent memories (sorted by createdAt desc). */
    getRecent(limit = 10): MemoryQueryResult {
      const state = getState();
      const memories = [...(state.mcMemories as MCMemory[])]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
      return { ok: true, memories };
    },

    /** Get a single memory by ID. */
    getMemory(memoryId: string): { ok: boolean; memory?: MCMemory; error?: string } {
      const state = getState();
      const memory = (state.mcMemories as MCMemory[]).find((m) => m.id === memoryId);
      if (!memory) return { ok: false, error: `Memory not found: ${memoryId}` };
      return { ok: true, memory };
    },
  };
}
