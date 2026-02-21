/**
 * Content Actions — structured CRUD API for AURIA agents.
 *
 * Wraps the Zustand store methods with validation,
 * providing a clean interface for LLM agents to manage the content pipeline.
 *
 * Usage (from agent execution context):
 *   const api = createContentAPI(useStore.getState);
 *   const result = api.createContent({ title: "New thread", platform: "X", stage: "idea" });
 */

import type {
  MCContentItem,
  MCContentStage,
} from "@/types/mission-control";
import type { StoreApi } from "zustand";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetState = StoreApi<any>["getState"];

export interface CreateContentInput {
  title: string;
  stage?: MCContentStage;
  platform?: string;
  script?: string;
  mediaUrls?: string[];
  scheduledDate?: number | null;
  projectId?: string;
}

export interface UpdateContentInput {
  title?: string;
  stage?: MCContentStage;
  platform?: string;
  script?: string;
  mediaUrls?: string[];
  scheduledDate?: number | null;
}

export interface ContentActionResult {
  ok: boolean;
  error?: string;
  itemId?: string;
}

export interface ContentQueryResult {
  ok: boolean;
  items: MCContentItem[];
  error?: string;
}

const VALID_STAGES: MCContentStage[] = ["idea", "draft", "review", "scheduled", "published"];

export function createContentAPI(getState: GetState) {
  return {
    /** Create a new content item. */
    createContent(input: CreateContentInput): ContentActionResult {
      if (!input.title?.trim()) {
        return { ok: false, error: "Title is required" };
      }
      if (input.stage && !VALID_STAGES.includes(input.stage)) {
        return { ok: false, error: `Invalid stage: ${input.stage}` };
      }

      const state = getState();
      state.addMCContentItem({
        title: input.title.trim(),
        stage: input.stage ?? "idea",
        platform: input.platform ?? "X",
        script: input.script ?? "",
        mediaUrls: input.mediaUrls ?? [],
        scheduledDate: input.scheduledDate ?? null,
        projectId: input.projectId ?? state.activeProjectId,
      });

      const items: MCContentItem[] = getState().mcContentPipeline;
      const created = [...items].reverse().find((c: MCContentItem) => c.title === input.title.trim());

      return { ok: true, itemId: created?.id };
    },

    /** Update an existing content item by ID. */
    updateContent(itemId: string, input: UpdateContentInput): ContentActionResult {
      const state = getState();
      const item = (state.mcContentPipeline as MCContentItem[]).find((c) => c.id === itemId);
      if (!item) {
        return { ok: false, error: `Content not found: ${itemId}` };
      }

      if (input.stage && !VALID_STAGES.includes(input.stage)) {
        return { ok: false, error: `Invalid stage: ${input.stage}` };
      }

      const updates: Partial<Omit<MCContentItem, "id">> = {};
      if (input.title !== undefined) updates.title = input.title.trim();
      if (input.stage !== undefined) updates.stage = input.stage;
      if (input.platform !== undefined) updates.platform = input.platform;
      if (input.script !== undefined) updates.script = input.script;
      if (input.mediaUrls !== undefined) updates.mediaUrls = input.mediaUrls;
      if (input.scheduledDate !== undefined) updates.scheduledDate = input.scheduledDate;

      state.updateMCContentItem(itemId, updates);
      return { ok: true, itemId };
    },

    /** Move content to a new pipeline stage. */
    moveStage(itemId: string, stage: MCContentStage): ContentActionResult {
      return this.updateContent(itemId, { stage });
    },

    /** Delete a content item by ID. */
    deleteContent(itemId: string): ContentActionResult {
      const state = getState();
      const item = (state.mcContentPipeline as MCContentItem[]).find((c) => c.id === itemId);
      if (!item) {
        return { ok: false, error: `Content not found: ${itemId}` };
      }

      state.removeMCContentItem(itemId);
      return { ok: true, itemId };
    },

    /** List content items, optionally filtered. */
    listContent(filters?: {
      stage?: MCContentStage;
      platform?: string;
      projectId?: string;
    }): ContentQueryResult {
      const state = getState();
      let items: MCContentItem[] = state.mcContentPipeline;

      if (filters?.stage) items = items.filter((c) => c.stage === filters.stage);
      if (filters?.platform) items = items.filter((c) => c.platform.toLowerCase() === filters.platform!.toLowerCase());
      if (filters?.projectId) items = items.filter((c) => c.projectId === filters.projectId);

      return { ok: true, items };
    },

    /** Get scheduled content (items with scheduledDate set). */
    getScheduled(): ContentQueryResult {
      const state = getState();
      const items = (state.mcContentPipeline as MCContentItem[]).filter(
        (c) => c.scheduledDate !== null && c.stage !== "published",
      );
      return { ok: true, items };
    },

    /** Get a single content item by ID. */
    getContent(itemId: string): { ok: boolean; item?: MCContentItem; error?: string } {
      const state = getState();
      const item = (state.mcContentPipeline as MCContentItem[]).find((c) => c.id === itemId);
      if (!item) return { ok: false, error: `Content not found: ${itemId}` };
      return { ok: true, item };
    },
  };
}
