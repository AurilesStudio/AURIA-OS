/**
 * Calendar Actions — structured CRUD API for AURIA agents.
 *
 * Wraps the Zustand store methods with validation,
 * providing a clean interface for LLM agents to manage calendar events.
 *
 * Usage (from agent execution context):
 *   const api = createCalendarAPI(useStore.getState);
 *   const result = api.createEvent({ title: "Sprint review", type: "meeting", ... });
 */

import type {
  MCCalendarEvent,
  MCCalendarEventType,
  MCCalendarEventStatus,
} from "@/types/mission-control";
import type { StoreApi } from "zustand";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetState = StoreApi<any>["getState"];

export interface CreateEventInput {
  title: string;
  type?: MCCalendarEventType;
  startDate: number; // epoch ms
  endDate: number;   // epoch ms
  status?: MCCalendarEventStatus;
  executionResult?: string;
  projectId?: string;
}

export interface UpdateEventInput {
  title?: string;
  type?: MCCalendarEventType;
  startDate?: number;
  endDate?: number;
  status?: MCCalendarEventStatus;
  executionResult?: string;
}

export interface CalendarActionResult {
  ok: boolean;
  error?: string;
  eventId?: string;
}

export interface CalendarQueryResult {
  ok: boolean;
  events: MCCalendarEvent[];
  error?: string;
}

const VALID_TYPES: MCCalendarEventType[] = ["task", "meeting", "deployment", "reminder", "milestone"];
const VALID_STATUSES: MCCalendarEventStatus[] = ["scheduled", "in_progress", "completed", "cancelled"];

export function createCalendarAPI(getState: GetState) {
  return {
    /** Create a new calendar event. */
    createEvent(input: CreateEventInput): CalendarActionResult {
      if (!input.title?.trim()) {
        return { ok: false, error: "Title is required" };
      }
      if (!input.startDate || !input.endDate) {
        return { ok: false, error: "Start and end dates are required" };
      }
      if (input.endDate < input.startDate) {
        return { ok: false, error: "End date must be >= start date" };
      }
      if (input.type && !VALID_TYPES.includes(input.type)) {
        return { ok: false, error: `Invalid type: ${input.type}` };
      }
      if (input.status && !VALID_STATUSES.includes(input.status)) {
        return { ok: false, error: `Invalid status: ${input.status}` };
      }

      const state = getState();
      state.addMCCalendarEvent({
        title: input.title.trim(),
        type: input.type ?? "meeting",
        startDate: input.startDate,
        endDate: input.endDate,
        status: input.status ?? "scheduled",
        executionResult: input.executionResult ?? "",
        projectId: input.projectId ?? state.activeProjectId,
      });

      const events: MCCalendarEvent[] = getState().mcCalendarEvents;
      const created = [...events].reverse().find((e: MCCalendarEvent) => e.title === input.title.trim());

      return { ok: true, eventId: created?.id };
    },

    /** Update an existing event by ID. */
    updateEvent(eventId: string, input: UpdateEventInput): CalendarActionResult {
      const state = getState();
      const event = (state.mcCalendarEvents as MCCalendarEvent[]).find((e) => e.id === eventId);
      if (!event) {
        return { ok: false, error: `Event not found: ${eventId}` };
      }

      if (input.type && !VALID_TYPES.includes(input.type)) {
        return { ok: false, error: `Invalid type: ${input.type}` };
      }
      if (input.status && !VALID_STATUSES.includes(input.status)) {
        return { ok: false, error: `Invalid status: ${input.status}` };
      }

      const updates: Partial<Omit<MCCalendarEvent, "id">> = {};
      if (input.title !== undefined) updates.title = input.title.trim();
      if (input.type !== undefined) updates.type = input.type;
      if (input.startDate !== undefined) updates.startDate = input.startDate;
      if (input.endDate !== undefined) updates.endDate = input.endDate;
      if (input.status !== undefined) updates.status = input.status;
      if (input.executionResult !== undefined) updates.executionResult = input.executionResult;

      state.updateMCCalendarEvent(eventId, updates);
      return { ok: true, eventId };
    },

    /** Mark an event as executed with a result string (AURI-52). */
    markExecuted(eventId: string, result: string): CalendarActionResult {
      return this.updateEvent(eventId, {
        status: "completed",
        executionResult: result,
      });
    },

    /** Delete an event by ID. */
    deleteEvent(eventId: string): CalendarActionResult {
      const state = getState();
      const event = (state.mcCalendarEvents as MCCalendarEvent[]).find((e) => e.id === eventId);
      if (!event) {
        return { ok: false, error: `Event not found: ${eventId}` };
      }

      state.removeMCCalendarEvent(eventId);
      return { ok: true, eventId };
    },

    /** List events, optionally filtered. */
    listEvents(filters?: {
      type?: MCCalendarEventType;
      status?: MCCalendarEventStatus;
      projectId?: string;
      from?: number;
      to?: number;
    }): CalendarQueryResult {
      const state = getState();
      let events: MCCalendarEvent[] = state.mcCalendarEvents;

      if (filters?.type) events = events.filter((e) => e.type === filters.type);
      if (filters?.status) events = events.filter((e) => e.status === filters.status);
      if (filters?.projectId) events = events.filter((e) => e.projectId === filters.projectId);
      if (filters?.from) events = events.filter((e) => e.endDate >= filters.from!);
      if (filters?.to) events = events.filter((e) => e.startDate <= filters.to!);

      return { ok: true, events };
    },

    /** Get upcoming events within N days (default 7). */
    getUpcoming(days = 7): CalendarQueryResult {
      const now = Date.now();
      const to = now + days * 24 * 60 * 60 * 1000;
      return this.listEvents({ from: now, to });
    },

    /** Get a single event by ID. */
    getEvent(eventId: string): { ok: boolean; event?: MCCalendarEvent; error?: string } {
      const state = getState();
      const event = (state.mcCalendarEvents as MCCalendarEvent[]).find((e) => e.id === eventId);
      if (!event) return { ok: false, error: `Event not found: ${eventId}` };
      return { ok: true, event };
    },
  };
}
