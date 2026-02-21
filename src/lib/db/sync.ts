/**
 * Supabase sync engine.
 *
 * - loadFromSupabase(): parallel fetch of all 8 tables → partial Zustand state
 * - seedIfEmpty(): if tables are empty, write current defaults
 * - startSyncEngine(): subscribe to Zustand mutations → upsert debounced
 * - stopSyncEngine() / flushSync(): cleanup + flush before unload
 */
import { supabase, isSupabaseEnabled } from "./supabase";
import { debounce, type DebouncedFn } from "./debounce";
import {
  projectToRow,
  rowToProject,
  roomToRow,
  rowToRoom,
  roleToRow,
  rowToRole,
  avatarToRow,
  rowToAvatar,
  shouldPersistAvatar,
  gaugeToRow,
  rowToGauge,
  teamTemplateToRow,
  rowToTeamTemplate,
  appearanceToRow,
  rowToAppearance,
  settingsToRow,
  rowToSettings,
  mcTaskToRow,
  rowToMCTask,
  mcCalendarEventToRow,
  rowToMCCalendarEvent,
  mcContentItemToRow,
  rowToMCContentItem,
  mcMemoryToRow,
  rowToMCMemory,
  mcTeamAgentToRow,
  rowToMCTeamAgent,
  type ProjectRow,
  type RoomRow,
  type RoleRow,
  type AvatarRow,
  type TokenGaugeRow,
  type TeamTemplateRow,
  type AppearanceRow,
  type UserSettingsRow,
  type UserSettingsState,
  type MCTaskRow,
  type MCCalendarEventRow,
  type MCContentItemRow,
  type MCMemoryRow,
  type MCTeamAgentRow,
} from "./tables";
import type {
  Project,
  RoomData,
  RoleDefinition,
  AvatarData,
  TokenGaugeData,
  TeamTemplate,
  AppearanceEntry,
  MCTask,
  MCCalendarEvent,
  MCContentItem,
  MCMemory,
  MCTeamAgent,
} from "@/types";

// ── Types ───────────────────────────────────────────────────────

/** Partial Zustand state that can be loaded from Supabase */
export interface SupabaseState {
  workspaceProjects: Project[];
  rooms: RoomData[];
  roles: RoleDefinition[];
  avatars: AvatarData[];
  gauges: TokenGaugeData[];
  teamTemplates: TeamTemplate[];
  appearances: AppearanceEntry[];
  // Mission Control
  mcTasks: MCTask[];
  mcCalendarEvents: MCCalendarEvent[];
  mcContentPipeline: MCContentItem[];
  mcMemories: MCMemory[];
  mcTeamAgents: MCTeamAgent[];
  // Settings flattened
  llmApiKeys: Record<string, string>;
  localLlmEndpoint: string;
  localLlmModel: string;
  tripoApiKey: string;
  activeProjectId: string;
  tradingKillSwitch: boolean;
  opportunityAlertsEnabled: boolean;
  gridOverlayEnabled: boolean;
  gridCellSize: number;
  gridWidth: number;
  gridHeight: number;
}

// ── Load ────────────────────────────────────────────────────────

export async function loadFromSupabase(): Promise<Partial<SupabaseState> | null> {
  if (!isSupabaseEnabled() || !supabase) return null;

  try {
    const [
      { data: projects },
      { data: rooms },
      { data: roles },
      { data: avatars },
      { data: gauges },
      { data: templates },
      { data: appearances },
      { data: settingsRows },
      { data: mcTasksData },
      { data: mcEventsData },
      { data: mcContentData },
      { data: mcMemoriesData },
      { data: mcAgentsData },
    ] = await Promise.all([
      supabase.from("projects").select("*").order("sort_order"),
      supabase.from("rooms").select("*"),
      supabase.from("roles").select("*"),
      supabase.from("avatars").select("*"),
      supabase.from("token_gauges").select("*"),
      supabase.from("team_templates").select("*"),
      supabase.from("appearances").select("*"),
      supabase.from("user_settings").select("*").eq("id", 1),
      supabase.from("mc_tasks").select("*"),
      supabase.from("mc_calendar_events").select("*"),
      supabase.from("mc_content_pipeline").select("*"),
      supabase.from("mc_memories").select("*"),
      supabase.from("mc_team_agents").select("*"),
    ]);

    // If all *content* tables are empty, return null (will trigger seed).
    // Exclude user_settings which always has its singleton row from the migration.
    const hasData = [projects, rooms, roles, avatars, gauges, templates, appearances]
      .some((arr) => arr && arr.length > 0);
    if (!hasData) return null;

    const settings = settingsRows?.[0] as UserSettingsRow | undefined;
    const settingsState: Partial<UserSettingsState> = settings
      ? rowToSettings(settings)
      : {};

    return {
      ...(projects && projects.length > 0
        ? { workspaceProjects: (projects as ProjectRow[]).map(rowToProject) }
        : {}),
      ...(rooms && rooms.length > 0
        ? { rooms: (rooms as RoomRow[]).map(rowToRoom) }
        : {}),
      ...(roles && roles.length > 0
        ? { roles: (roles as RoleRow[]).map(rowToRole) }
        : {}),
      ...(avatars && avatars.length > 0
        ? { avatars: (avatars as AvatarRow[]).map(rowToAvatar) }
        : {}),
      ...(gauges && gauges.length > 0
        ? { gauges: (gauges as TokenGaugeRow[]).map(rowToGauge) }
        : {}),
      ...(templates && templates.length > 0
        ? { teamTemplates: (templates as TeamTemplateRow[]).map(rowToTeamTemplate) }
        : {}),
      ...(appearances && appearances.length > 0
        ? { appearances: (appearances as AppearanceRow[]).map(rowToAppearance) }
        : {}),
      ...(mcTasksData && mcTasksData.length > 0
        ? { mcTasks: (mcTasksData as MCTaskRow[]).map(rowToMCTask) }
        : {}),
      ...(mcEventsData && mcEventsData.length > 0
        ? { mcCalendarEvents: (mcEventsData as MCCalendarEventRow[]).map(rowToMCCalendarEvent) }
        : {}),
      ...(mcContentData && mcContentData.length > 0
        ? { mcContentPipeline: (mcContentData as MCContentItemRow[]).map(rowToMCContentItem) }
        : {}),
      ...(mcMemoriesData && mcMemoriesData.length > 0
        ? { mcMemories: (mcMemoriesData as MCMemoryRow[]).map(rowToMCMemory) }
        : {}),
      ...(mcAgentsData && mcAgentsData.length > 0
        ? { mcTeamAgents: (mcAgentsData as MCTeamAgentRow[]).map(rowToMCTeamAgent) }
        : {}),
      ...settingsState,
    };
  } catch (err) {
    console.warn("[supabase] loadFromSupabase failed:", err);
    return null;
  }
}

// ── Seed ────────────────────────────────────────────────────────

interface SeedableState {
  workspaceProjects: Project[];
  rooms: RoomData[];
  roles: RoleDefinition[];
  avatars: AvatarData[];
  gauges: TokenGaugeData[];
  teamTemplates: TeamTemplate[];
  appearances: AppearanceEntry[];
  mcTasks: MCTask[];
  mcCalendarEvents: MCCalendarEvent[];
  mcContentPipeline: MCContentItem[];
  mcMemories: MCMemory[];
  mcTeamAgents: MCTeamAgent[];
  llmApiKeys: Record<string, string>;
  localLlmEndpoint: string;
  localLlmModel: string;
  tripoApiKey: string;
  activeProjectId: string;
  tradingKillSwitch: boolean;
  opportunityAlertsEnabled: boolean;
  gridOverlayEnabled: boolean;
  gridCellSize: number;
  gridWidth: number;
  gridHeight: number;
}

export async function seedIfEmpty(state: SeedableState): Promise<void> {
  if (!isSupabaseEnabled() || !supabase) return;

  try {
    // Seed projects first (FK dependency for rooms)
    if (state.workspaceProjects.length > 0) {
      await supabase
        .from("projects")
        .upsert(state.workspaceProjects.map((p, i) => projectToRow(p, i)));
    }

    // Then seed remaining tables in parallel
    await Promise.all([
      state.rooms.length > 0
        ? supabase.from("rooms").upsert(state.rooms.map(roomToRow))
        : null,
      state.roles.length > 0
        ? supabase.from("roles").upsert(state.roles.map(roleToRow))
        : null,
      state.avatars.filter(shouldPersistAvatar).length > 0
        ? supabase.from("avatars").upsert(state.avatars.filter(shouldPersistAvatar).map(avatarToRow))
        : null,
      state.gauges.length > 0
        ? supabase.from("token_gauges").upsert(state.gauges.map(gaugeToRow))
        : null,
      state.teamTemplates.length > 0
        ? supabase.from("team_templates").upsert(state.teamTemplates.map(teamTemplateToRow))
        : null,
      state.appearances.length > 0
        ? supabase.from("appearances").upsert(state.appearances.map(appearanceToRow))
        : null,
      state.mcTasks.length > 0
        ? supabase.from("mc_tasks").upsert(state.mcTasks.map(mcTaskToRow))
        : null,
      state.mcCalendarEvents.length > 0
        ? supabase.from("mc_calendar_events").upsert(state.mcCalendarEvents.map(mcCalendarEventToRow))
        : null,
      state.mcContentPipeline.length > 0
        ? supabase.from("mc_content_pipeline").upsert(state.mcContentPipeline.map(mcContentItemToRow))
        : null,
      state.mcMemories.length > 0
        ? supabase.from("mc_memories").upsert(state.mcMemories.map(mcMemoryToRow))
        : null,
      state.mcTeamAgents.length > 0
        ? supabase.from("mc_team_agents").upsert(state.mcTeamAgents.map(mcTeamAgentToRow))
        : null,
      supabase.from("user_settings").upsert(
        settingsToRow({
          llmApiKeys: state.llmApiKeys,
          localLlmEndpoint: state.localLlmEndpoint,
          localLlmModel: state.localLlmModel,
          tripoApiKey: state.tripoApiKey,
          activeProjectId: state.activeProjectId,
          tradingKillSwitch: state.tradingKillSwitch,
          opportunityAlertsEnabled: state.opportunityAlertsEnabled,
          gridOverlayEnabled: state.gridOverlayEnabled,
          gridCellSize: state.gridCellSize,
          gridWidth: state.gridWidth,
          gridHeight: state.gridHeight,
        }),
      ),
    ]);

    console.info("[supabase] seeded defaults");
  } catch (err) {
    console.warn("[supabase] seedIfEmpty failed:", err);
  }
}

// ── Sync engine ─────────────────────────────────────────────────

/** Keys from the Zustand store that we track for sync */
const POSITION_KEYS = new Set(["avatars", "rooms"]);
const SYNCED_KEYS = new Set([
  "workspaceProjects",
  "rooms",
  "roles",
  "avatars",
  "gauges",
  "teamTemplates",
  "appearances",
  "mcTasks",
  "mcCalendarEvents",
  "mcContentPipeline",
  "mcMemories",
  "mcTeamAgents",
  "llmApiKeys",
  "localLlmEndpoint",
  "localLlmModel",
  "tripoApiKey",
  "activeProjectId",
  "tradingKillSwitch",
  "opportunityAlertsEnabled",
  "gridOverlayEnabled",
  "gridCellSize",
  "gridWidth",
  "gridHeight",
]);

// Settings keys (flat keys on the store that map to user_settings row)
const SETTINGS_KEYS = new Set([
  "llmApiKeys",
  "localLlmEndpoint",
  "localLlmModel",
  "tripoApiKey",
  "activeProjectId",
  "tradingKillSwitch",
  "opportunityAlertsEnabled",
  "gridOverlayEnabled",
  "gridCellSize",
  "gridWidth",
  "gridHeight",
]);

type AnyState = Record<string, unknown>;

let unsubscribe: (() => void) | null = null;
let positionDebounced: DebouncedFn<() => void> | null = null;
let normalDebounced: DebouncedFn<() => void> | null = null;

/** Upsert a specific slice to Supabase */
async function upsertSlice(key: string, state: AnyState): Promise<void> {
  if (!supabase) return;

  try {
    switch (key) {
      case "workspaceProjects": {
        const projects = state.workspaceProjects as Project[];
        await supabase.from("projects").upsert(projects.map((p, i) => projectToRow(p, i)));
        break;
      }
      case "rooms": {
        const rooms = state.rooms as RoomData[];
        await supabase.from("rooms").upsert(rooms.map(roomToRow));
        break;
      }
      case "roles": {
        const roles = state.roles as RoleDefinition[];
        await supabase.from("roles").upsert(roles.map(roleToRow));
        break;
      }
      case "avatars": {
        const avatars = (state.avatars as AvatarData[]).filter(shouldPersistAvatar);
        if (avatars.length > 0) {
          await supabase.from("avatars").upsert(avatars.map(avatarToRow));
        }
        break;
      }
      case "gauges": {
        const gauges = state.gauges as TokenGaugeData[];
        await supabase.from("token_gauges").upsert(gauges.map(gaugeToRow));
        break;
      }
      case "teamTemplates": {
        const templates = state.teamTemplates as TeamTemplate[];
        await supabase.from("team_templates").upsert(templates.map(teamTemplateToRow));
        break;
      }
      case "appearances": {
        const appearances = state.appearances as AppearanceEntry[];
        await supabase.from("appearances").upsert(appearances.map(appearanceToRow));
        break;
      }
      case "mcTasks": {
        const tasks = state.mcTasks as MCTask[];
        await supabase.from("mc_tasks").upsert(tasks.map(mcTaskToRow));
        break;
      }
      case "mcCalendarEvents": {
        const events = state.mcCalendarEvents as MCCalendarEvent[];
        await supabase.from("mc_calendar_events").upsert(events.map(mcCalendarEventToRow));
        break;
      }
      case "mcContentPipeline": {
        const items = state.mcContentPipeline as MCContentItem[];
        await supabase.from("mc_content_pipeline").upsert(items.map(mcContentItemToRow));
        break;
      }
      case "mcMemories": {
        const memories = state.mcMemories as MCMemory[];
        await supabase.from("mc_memories").upsert(memories.map(mcMemoryToRow));
        break;
      }
      case "mcTeamAgents": {
        const agents = state.mcTeamAgents as MCTeamAgent[];
        await supabase.from("mc_team_agents").upsert(agents.map(mcTeamAgentToRow));
        break;
      }
      default:
        // Settings key — upsert the whole settings row
        if (SETTINGS_KEYS.has(key)) {
          await supabase.from("user_settings").upsert(
            settingsToRow({
              llmApiKeys: state.llmApiKeys as Record<string, string>,
              localLlmEndpoint: state.localLlmEndpoint as string,
              localLlmModel: state.localLlmModel as string,
              tripoApiKey: state.tripoApiKey as string,
              activeProjectId: state.activeProjectId as string,
              tradingKillSwitch: state.tradingKillSwitch as boolean,
              opportunityAlertsEnabled: state.opportunityAlertsEnabled as boolean,
              gridOverlayEnabled: state.gridOverlayEnabled as boolean,
              gridCellSize: state.gridCellSize as number,
              gridWidth: state.gridWidth as number,
              gridHeight: state.gridHeight as number,
            }),
          );
        }
        break;
    }
  } catch (err) {
    console.warn(`[supabase] upsertSlice(${key}) failed:`, err);
  }
}

/**
 * Start the sync engine.
 * @param subscribe - `useStore.subscribe` (pass to avoid circular import)
 * @param getState - `useStore.getState`
 */
export function startSyncEngine(
  subscribe: (listener: (state: AnyState, prev: AnyState) => void) => () => void,
  getState: () => AnyState,
): void {
  if (!isSupabaseEnabled()) return;

  // Pending dirty keys, split by debounce tier
  const dirtyPosition = new Set<string>();
  const dirtyNormal = new Set<string>();

  const flushPosition = () => {
    const keys = [...dirtyPosition];
    dirtyPosition.clear();
    const state = getState();
    keys.forEach((k) => void upsertSlice(k, state));
  };

  const flushNormal = () => {
    const keys = [...dirtyNormal];
    dirtyNormal.clear();
    const state = getState();
    keys.forEach((k) => void upsertSlice(k, state));
  };

  positionDebounced = debounce(flushPosition, 2000);
  normalDebounced = debounce(flushNormal, 500);

  unsubscribe = subscribe((state, prev) => {
    for (const key of SYNCED_KEYS) {
      if ((state as AnyState)[key] !== (prev as AnyState)[key]) {
        if (POSITION_KEYS.has(key)) {
          dirtyPosition.add(key);
          positionDebounced!();
        } else {
          dirtyNormal.add(key);
          normalDebounced!();
        }
      }
    }
  });

  console.info("[supabase] sync engine started");
}

export function stopSyncEngine(): void {
  positionDebounced?.cancel();
  normalDebounced?.cancel();
  unsubscribe?.();
  unsubscribe = null;
  positionDebounced = null;
  normalDebounced = null;
}

export function flushSync(): void {
  positionDebounced?.flush();
  normalDebounced?.flush();
}
