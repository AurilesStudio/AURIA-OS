/**
 * Task Actions — structured CRUD API for AURIA agents.
 *
 * These actions wrap the Zustand store methods with validation,
 * providing a clean interface for LLM agents to manage tasks.
 *
 * Usage (from agent execution context):
 *   const api = createTaskAPI(useStore.getState);
 *   const result = api.createTask({ title: "Fix login bug", status: "todo" });
 */

import type { MCTask, MCTaskStatus, MCTaskPriority } from "@/types/mission-control";
import type { StoreApi } from "zustand";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetState = StoreApi<any>["getState"];

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: MCTaskStatus;
  priority?: MCTaskPriority;
  assigneeId?: string;
  labels?: string[];
  projectId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: MCTaskStatus;
  priority?: MCTaskPriority;
  assigneeId?: string;
  labels?: string[];
}

export interface TaskActionResult {
  ok: boolean;
  error?: string;
  taskId?: string;
}

export interface TaskQueryResult {
  ok: boolean;
  tasks: MCTask[];
  error?: string;
}

const VALID_STATUSES: MCTaskStatus[] = ["backlog", "todo", "in_progress", "done", "cancelled"];
const VALID_PRIORITIES: MCTaskPriority[] = ["none", "low", "medium", "high", "urgent"];

export function createTaskAPI(getState: GetState) {
  return {
    /** Create a new task. Returns the action result. */
    createTask(input: CreateTaskInput): TaskActionResult {
      if (!input.title?.trim()) {
        return { ok: false, error: "Title is required" };
      }
      if (input.status && !VALID_STATUSES.includes(input.status)) {
        return { ok: false, error: `Invalid status: ${input.status}` };
      }
      if (input.priority && !VALID_PRIORITIES.includes(input.priority)) {
        return { ok: false, error: `Invalid priority: ${input.priority}` };
      }

      const state = getState();
      state.addMCTask({
        title: input.title.trim(),
        description: input.description ?? "",
        status: input.status ?? "backlog",
        priority: input.priority ?? "none",
        assigneeId: input.assigneeId ?? "",
        labels: input.labels ?? [],
        projectId: input.projectId ?? state.activeProjectId,
      });

      // Find the newly created task (latest one with matching title)
      const tasks: MCTask[] = getState().mcTasks;
      const created = [...tasks].reverse().find((t: MCTask) => t.title === input.title.trim());

      return { ok: true, taskId: created?.id };
    },

    /** Update an existing task by ID. */
    updateTask(taskId: string, input: UpdateTaskInput): TaskActionResult {
      const state = getState();
      const task = (state.mcTasks as MCTask[]).find((t) => t.id === taskId);
      if (!task) {
        return { ok: false, error: `Task not found: ${taskId}` };
      }

      if (input.status && !VALID_STATUSES.includes(input.status)) {
        return { ok: false, error: `Invalid status: ${input.status}` };
      }
      if (input.priority && !VALID_PRIORITIES.includes(input.priority)) {
        return { ok: false, error: `Invalid priority: ${input.priority}` };
      }

      const updates: Partial<Omit<MCTask, "id">> = {};
      if (input.title !== undefined) updates.title = input.title.trim();
      if (input.description !== undefined) updates.description = input.description;
      if (input.status !== undefined) updates.status = input.status;
      if (input.priority !== undefined) updates.priority = input.priority;
      if (input.assigneeId !== undefined) updates.assigneeId = input.assigneeId;
      if (input.labels !== undefined) updates.labels = input.labels;

      state.updateMCTask(taskId, updates);
      return { ok: true, taskId };
    },

    /** Move a task to a new status column. */
    moveTask(taskId: string, status: MCTaskStatus): TaskActionResult {
      return this.updateTask(taskId, { status });
    },

    /** Delete a task by ID. */
    deleteTask(taskId: string): TaskActionResult {
      const state = getState();
      const task = (state.mcTasks as MCTask[]).find((t) => t.id === taskId);
      if (!task) {
        return { ok: false, error: `Task not found: ${taskId}` };
      }

      state.removeMCTask(taskId);
      return { ok: true, taskId };
    },

    /** List tasks, optionally filtered. */
    listTasks(filters?: {
      status?: MCTaskStatus;
      priority?: MCTaskPriority;
      assigneeId?: string;
      projectId?: string;
    }): TaskQueryResult {
      const state = getState();
      let tasks: MCTask[] = state.mcTasks;

      if (filters?.status) tasks = tasks.filter((t) => t.status === filters.status);
      if (filters?.priority) tasks = tasks.filter((t) => t.priority === filters.priority);
      if (filters?.assigneeId) tasks = tasks.filter((t) => t.assigneeId === filters.assigneeId);
      if (filters?.projectId) tasks = tasks.filter((t) => t.projectId === filters.projectId);

      return { ok: true, tasks };
    },

    /** Get a single task by ID. */
    getTask(taskId: string): { ok: boolean; task?: MCTask; error?: string } {
      const state = getState();
      const task = (state.mcTasks as MCTask[]).find((t) => t.id === taskId);
      if (!task) return { ok: false, error: `Task not found: ${taskId}` };
      return { ok: true, task };
    },

    /** Assign a task to an agent/avatar. */
    assignTask(taskId: string, assigneeId: string): TaskActionResult {
      return this.updateTask(taskId, { assigneeId });
    },
  };
}
