/**
 * DB row types (snake_case) and converters to/from Zustand types (camelCase).
 * Each table has: XxxRow, xxxToRow(), rowToXxx().
 */
import type {
  Project,
  RoomData,
  RoleDefinition,
  AvatarData,
  TokenGaugeData,
  TeamTemplate,
  AppearanceEntry,
  LLMProvider,
} from "@/types";

// ── projects ────────────────────────────────────────────────────

export interface ProjectRow {
  id: string;
  name: string;
  layout_type: string | null;
  sort_order: number;
}

export function projectToRow(p: Project, index: number): ProjectRow {
  return {
    id: p.id,
    name: p.name,
    layout_type: p.layoutType ?? null,
    sort_order: index,
  };
}

export function rowToProject(r: ProjectRow): Project {
  return {
    id: r.id,
    name: r.name,
    ...(r.layout_type ? { layoutType: r.layout_type as Project["layoutType"] } : {}),
  };
}

// ── rooms ───────────────────────────────────────────────────────

export interface RoomRow {
  id: string;
  label: string;
  position_x: number;
  position_y: number;
  position_z: number;
  border_color: string;
  skill_ids: string[];
  project_id: string;
  floor_y: number | null;
}

export function roomToRow(r: RoomData): RoomRow {
  return {
    id: r.id,
    label: r.label,
    position_x: r.position[0],
    position_y: r.position[1],
    position_z: r.position[2],
    border_color: r.borderColor,
    skill_ids: r.skillIds,
    project_id: r.projectId,
    floor_y: r.floorY ?? null,
  };
}

export function rowToRoom(r: RoomRow): RoomData {
  return {
    id: r.id,
    label: r.label,
    position: [r.position_x, r.position_y, r.position_z],
    borderColor: r.border_color,
    skillIds: r.skill_ids ?? [],
    projectId: r.project_id,
    ...(r.floor_y != null ? { floorY: r.floor_y } : {}),
  };
}

// ── roles ───────────────────────────────────────────────────────

export interface RoleRow {
  id: string;
  name: string;
  skill_ids: string[];
  system_prompt: string;
}

export function roleToRow(r: RoleDefinition): RoleRow {
  return {
    id: r.id,
    name: r.name,
    skill_ids: r.skillIds,
    system_prompt: r.systemPrompt,
  };
}

export function rowToRole(r: RoleRow): RoleDefinition {
  return {
    id: r.id,
    name: r.name,
    skillIds: r.skill_ids ?? [],
    systemPrompt: r.system_prompt,
  };
}

// ── avatars ─────────────────────────────────────────────────────

export interface AvatarRow {
  id: string;
  name: string;
  role_id: string;
  provider: string;
  color: string;
  model_url: string;
  active_clip: string;
  position_x: number;
  position_y: number;
  position_z: number;
  room_id: string;
  project_id: string;
  character_id: string;
  level: number;
  availability: string;
}

/** All avatars are now persisted (including AURIA and PM team) */
export function shouldPersistAvatar(_a: AvatarData): boolean {
  return true;
}

export function avatarToRow(a: AvatarData): AvatarRow {
  return {
    id: a.id,
    name: a.name,
    role_id: a.roleId,
    provider: a.provider,
    color: a.color,
    model_url: a.modelUrl,
    active_clip: a.activeClip,
    position_x: a.position[0],
    position_y: a.position[1],
    position_z: a.position[2],
    room_id: a.roomId,
    project_id: a.projectId,
    character_id: a.characterId,
    level: a.level,
    availability: a.availability,
  };
}

export function rowToAvatar(r: AvatarRow): AvatarData {
  return {
    id: r.id,
    name: r.name,
    roleId: r.role_id,
    provider: r.provider as LLMProvider,
    color: r.color,
    modelUrl: r.model_url,
    activeClip: r.active_clip || "Happy Idle",
    status: "idle",
    currentAction: null,
    history: [],
    position: [r.position_x, r.position_y, r.position_z],
    roomId: r.room_id,
    projectId: r.project_id,
    characterId: r.character_id,
    level: r.level,
    availability: (r.availability as "available" | "unavailable") || "available",
  };
}

// ── token_gauges ────────────────────────────────────────────────

export interface TokenGaugeRow {
  provider: string;
  label: string;
  used: number;
  limit_tokens: number;
  color: string;
  cost: number;
}

export function gaugeToRow(g: TokenGaugeData): TokenGaugeRow {
  return {
    provider: g.provider,
    label: g.label,
    used: g.used,
    limit_tokens: g.limit,
    color: g.color,
    cost: g.cost,
  };
}

export function rowToGauge(r: TokenGaugeRow): TokenGaugeData {
  return {
    provider: r.provider as TokenGaugeData["provider"],
    label: r.label,
    used: r.used,
    limit: r.limit_tokens,
    color: r.color,
    cost: r.cost ?? 0,
  };
}

// ── team_templates ──────────────────────────────────────────────

export interface TeamTemplateRow {
  id: string;
  name: string;
  slots: unknown; // jsonb
  created_at: number;
  updated_at: number;
}

export function teamTemplateToRow(t: TeamTemplate): TeamTemplateRow {
  return {
    id: t.id,
    name: t.name,
    slots: t.slots,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  };
}

export function rowToTeamTemplate(r: TeamTemplateRow): TeamTemplate {
  return {
    id: r.id,
    name: r.name,
    slots: r.slots as TeamTemplate["slots"],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ── appearances ─────────────────────────────────────────────────

export interface AppearanceRow {
  id: string;
  name: string;
  thumbnail_url: string;
  model_url: string;
  created_at: number;
  original_task_id: string | null;
  rigged: boolean;
  local_glb: boolean;
}

export function appearanceToRow(a: AppearanceEntry): AppearanceRow {
  return {
    id: a.id,
    name: a.name,
    thumbnail_url: a.thumbnailUrl,
    model_url: a.modelUrl,
    created_at: a.createdAt,
    original_task_id: a.originalTaskId ?? null,
    rigged: a.rigged ?? false,
    local_glb: a.localGlb ?? false,
  };
}

export function rowToAppearance(r: AppearanceRow): AppearanceEntry {
  return {
    id: r.id,
    name: r.name,
    thumbnailUrl: r.thumbnail_url,
    modelUrl: r.model_url,
    createdAt: r.created_at,
    ...(r.original_task_id ? { originalTaskId: r.original_task_id } : {}),
    ...(r.rigged ? { rigged: true } : {}),
    ...(r.local_glb ? { localGlb: true } : {}),
  };
}

// ── user_settings ───────────────────────────────────────────────

export interface UserSettingsRow {
  id: number;
  llm_api_keys: Record<string, string>;
  local_llm_endpoint: string;
  local_llm_model: string;
  tripo_api_key: string;
  active_project_id: string;
  trading_kill_switch: boolean;
  opportunity_alerts_enabled: boolean;
  grid_overlay_enabled: boolean;
}

export interface UserSettingsState {
  llmApiKeys: Record<string, string>;
  localLlmEndpoint: string;
  localLlmModel: string;
  tripoApiKey: string;
  activeProjectId: string;
  tradingKillSwitch: boolean;
  opportunityAlertsEnabled: boolean;
  gridOverlayEnabled: boolean;
}

export function settingsToRow(s: UserSettingsState): UserSettingsRow {
  return {
    id: 1,
    llm_api_keys: s.llmApiKeys,
    local_llm_endpoint: s.localLlmEndpoint,
    local_llm_model: s.localLlmModel,
    tripo_api_key: s.tripoApiKey,
    active_project_id: s.activeProjectId,
    trading_kill_switch: s.tradingKillSwitch,
    opportunity_alerts_enabled: s.opportunityAlertsEnabled,
    grid_overlay_enabled: s.gridOverlayEnabled,
  };
}

export function rowToSettings(r: UserSettingsRow): UserSettingsState {
  return {
    llmApiKeys: r.llm_api_keys ?? {},
    localLlmEndpoint: r.local_llm_endpoint,
    localLlmModel: r.local_llm_model,
    tripoApiKey: r.tripo_api_key,
    activeProjectId: r.active_project_id,
    tradingKillSwitch: r.trading_kill_switch,
    opportunityAlertsEnabled: r.opportunity_alerts_enabled,
    gridOverlayEnabled: r.grid_overlay_enabled,
  };
}
