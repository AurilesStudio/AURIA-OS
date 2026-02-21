import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  SystemStatus,
  TokenGaugeData,
  ActivityEntry,
  ProjectData,
  CommandHistoryEntry,
  AvatarData,
  AvatarStatus,
  RoomData,
  LLMProvider,
  AppearanceEntry,
  Project,
  TeamTemplate,
  RoleDefinition,
  MCTask,
  MCCalendarEvent,
  MCContentItem,
  MCMemory,
  MCTeamAgent,
} from "@/types";
import {
  ROOM_SIZE,
  ROOM_BORDER_COLORS,
  ROOM_SPACING_X,
  ROOM_SPACING_Z,
  TRADING_ROOM_SIZE,
  ARENA_ROOM_SIZE,
  CHARACTER_CATALOG,
  DEFAULT_ROLES,
} from "@/types";
import { mockActivities, mockProjects } from "@/types/mock-data";
import { generateId } from "@/lib/utils";
import { computeCost } from "@/lib/llm/pricing";

// ── Initial token gauges (start at 0) ──────────────────────
const initialGauges: TokenGaugeData[] = [
  { provider: "gemini",  label: "Gemini 2.0 Flash", used: 0, limit: 2_000_000, color: "#ff003c", cost: 0 },
  { provider: "claude",  label: "Claude Sonnet",    used: 0, limit: 5_000_000, color: "#bf00ff", cost: 0 },
  { provider: "mistral", label: "Mistral Large",    used: 0, limit: 1_000_000, color: "#ff2d7a", cost: 0 },
  { provider: "local",   label: "Local (Ollama)",   used: 0, limit: 1_000_000, color: "#22d3ee", cost: 0 },
];
import { loadGlbFile, deleteGlbFile, bufferToBlobUrl } from "@/lib/glbStore";
import { isSupabaseEnabled } from "@/lib/db/supabase";
import { loadFromSupabase, seedIfEmpty, startSyncEngine, flushSync } from "@/lib/db/sync";

// ── Default projects ─────────────────────────────────────────
const defaultProjects: Project[] = [
  { id: "project-5", name: "Arena", layoutType: "arena" },
  { id: "project-1", name: "SAAS Projects" },
  { id: "project-2", name: "Trading", layoutType: "trading" },
  { id: "project-3", name: "Prospectauri" },
  { id: "project-4", name: "Gestion de projets", layoutType: "project-management" },
];

// Grid origin offset — pushes the room grid away from the camera (multiples of 2 for grid alignment)
const GRID_ORIGIN_X = 8;
const GRID_ORIGIN_Z = 0;

// Gap between project zones in Z (multiple of 2 for grid alignment)
const PROJECT_ZONE_GAP = 6;

// Trading room spacing (center-to-center, horizontal, multiple of 2 for grid alignment)
const TRADING_ROOM_SPACING_X = 18;

/**
 * Zone depth for a project based on its layout type.
 * Standard (3×3 grid): 3 rows of rooms → zoneDepth = 3·SPACING_Z + gap
 * Large (1×3 row): 1 row of large rooms → zoneDepth = roomDepth + interProjectGap
 *
 * The inter-project visual gap (8 units) is identical for both layouts.
 */
const INTER_PROJECT_GAP = PROJECT_ZONE_GAP + 3 * ROOM_SPACING_Z - 2 * ROOM_SPACING_Z - ROOM_SIZE.depth; // 8

function getProjectZoneDepth(project: Project | undefined): number {
  if (project?.layoutType === "arena") return ARENA_ROOM_SIZE.depth + INTER_PROJECT_GAP;
  const isLarge = project?.layoutType === "trading" || project?.layoutType === "project-management";
  return isLarge
    ? TRADING_ROOM_SIZE.depth + INTER_PROJECT_GAP
    : 3 * ROOM_SPACING_Z + PROJECT_ZONE_GAP;
}

/**
 * Compute the grid origin for a project.
 * Layout (2 columns):
 *   P1 (left)   P2 (right)
 *   P3 (left)   P4 (right)
 *
 * Z is computed per-column by summing zone depths of projects above,
 * so single-row layouts (trading, PM) don't waste vertical space.
 */
function getProjectGridOrigin(
  projectId: string,
  allProjects: Project[],
): { x: number; z: number } {
  const idx = allProjects.findIndex((p) => p.id === projectId);
  const zoneWidth = 2 * ROOM_SPACING_X + ROOM_SIZE.width / 2 + TRADING_ROOM_SIZE.width / 2 + INTER_PROJECT_GAP;

  const col = idx % 2;
  const row = Math.floor(idx / 2);

  // Sum zone depths of projects above in the same column
  let z = GRID_ORIGIN_Z;
  for (let r = 0; r < row; r++) {
    const aboveIdx = r * 2 + col;
    z += getProjectZoneDepth(allProjects[aboveIdx]);
  }

  return {
    x: GRID_ORIGIN_X + col * zoneWidth,
    z,
  };
}

// ── Default room labels ──────────────────────────────────────
const DEFAULT_ROOM_LABELS = [
  "Vision & Stratégie", "Juridique", "Design Studio",
  "App Development", "Infra & DevOps", "Communication & Marketing",
  "Finance", "Analytics & KPIs", "Ops & Support",
];

const DEFAULT_ROOM_IDS: Record<string, string[]> = {
  "project-1": [
    "room-vision", "room-legal", "room-design",
    "room-dev", "room-vps", "room-comms",
    "room-finance", "room-analytics", "room-ops",
  ],
  "project-2": [
    "room-p2-vision", "room-p2-legal", "room-p2-design",
    "room-p2-dev", "room-p2-vps", "room-p2-comms",
    "room-p2-finance", "room-p2-analytics", "room-p2-ops",
  ],
  "project-3": [
    "room-p3-vision", "room-p3-legal", "room-p3-design",
    "room-p3-dev", "room-p3-vps", "room-p3-comms",
    "room-p3-finance", "room-p3-analytics", "room-p3-ops",
  ],
  "project-4": ["room-github", "room-notion", "room-linear"],
};

/** Generate 3 trading sub-rooms in a 1×3 horizontal layout */
function buildTradingRooms(projectId: string): RoomData[] {
  const origin = getProjectGridOrigin(projectId, defaultProjects);
  const tradingRoomDefs = [
    { id: "room-oracle", label: "The Oracle", borderColor: "#00ffcc" },
    { id: "room-forge",  label: "The Strategy Forge", borderColor: "#f59e0b" },
    { id: "room-safe",   label: "The Safe", borderColor: "#ff003c" },
  ];
  return tradingRoomDefs.map((def, i) => ({
    id: def.id,
    label: def.label,
    position: [origin.x + i * TRADING_ROOM_SPACING_X, 0, origin.z] as [number, number, number],
    borderColor: def.borderColor,
    skillIds: [],
    projectId,
  }));
}

/** Generate 3 project-management sub-rooms in a 1×3 horizontal layout */
function buildProjectManagementRooms(projectId: string): RoomData[] {
  const origin = getProjectGridOrigin(projectId, defaultProjects);
  const pmRoomDefs = [
    { id: "room-github", label: "Github", borderColor: "#58a6ff" },
    { id: "room-notion", label: "Notion", borderColor: "#e0e0e0" },
    { id: "room-linear", label: "Linear", borderColor: "#818cf8" },
  ];
  return pmRoomDefs.map((def, i) => ({
    id: def.id,
    label: def.label,
    position: [origin.x + i * TRADING_ROOM_SPACING_X, 0, origin.z] as [number, number, number],
    borderColor: def.borderColor,
    skillIds: [],
    projectId,
  }));
}

/** Generate a single arena room centred in its project zone */
function buildArenaRoom(projectId: string): RoomData[] {
  const origin = getProjectGridOrigin(projectId, defaultProjects);
  return [{
    id: "room-arena",
    label: "Arena",
    position: [origin.x + 10, 0, origin.z + 10] as [number, number, number],
    borderColor: "#ff003c",
    skillIds: [],
    projectId,
    floorY: 3,
  }];
}

/** Generate 9 default rooms for a project at its grid origin */
function buildDefaultRooms(projectId: string): RoomData[] {
  const project = defaultProjects.find((p) => p.id === projectId);
  if (project?.layoutType === "trading") return buildTradingRooms(projectId);
  if (project?.layoutType === "project-management") return buildProjectManagementRooms(projectId);
  if (project?.layoutType === "arena") return buildArenaRoom(projectId);

  const origin = getProjectGridOrigin(projectId, defaultProjects);
  const ids = DEFAULT_ROOM_IDS[projectId];
  return DEFAULT_ROOM_LABELS.map((label, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    return {
      id: ids ? ids[i]! : `room-${projectId}-${i}`,
      label,
      position: [origin.x + col * ROOM_SPACING_X, 0, origin.z + row * ROOM_SPACING_Z] as [number, number, number],
      borderColor: ROOM_BORDER_COLORS[i % ROOM_BORDER_COLORS.length] as string,
      skillIds: [],
      projectId,
    };
  });
}

const defaultRooms: RoomData[] = defaultProjects.flatMap((p) => buildDefaultRooms(p.id));

// ── AURIA supervisor avatar (always present) ─────────────────
const auriaChar = CHARACTER_CATALOG.find((c) => c.id === "auria")!;
const AURIA_AVATAR_ID = "avatar-auria";
const initialAuriaAvatar: AvatarData = {
  id: AURIA_AVATAR_ID,
  name: "AURIA",
  roleId: "role-auria-overseer",
  provider: "auria",
  color: auriaChar.color,
  modelUrl: auriaChar.modelUrl,
  activeClip: "Walking",
  status: "idle",
  currentAction: null,
  history: [],
  position: [0, 0, 0],
  roomId: "",
  projectId: "",
  characterId: "auria",
  level: 0,
  availability: "available",
};

// ── Default PM avatars (placed in project-4 rooms at startup) ──
const PM_AVATAR_DEFS = [
  { id: "avatar-github", characterId: "github", roleId: "role-github-ops",   roomId: "room-github" },
  { id: "avatar-notion", characterId: "notion", roleId: "role-notion-docs",  roomId: "room-notion" },
  { id: "avatar-linear", characterId: "linear", roleId: "role-linear-tasks", roomId: "room-linear" },
] as const;

const initialPmAvatars: AvatarData[] = PM_AVATAR_DEFS.map((def) => {
  const char = CHARACTER_CATALOG.find((c) => c.id === def.characterId)!;
  const room = defaultRooms.find((r) => r.id === def.roomId)!;
  return {
    id: def.id,
    name: char.name,
    roleId: def.roleId,
    provider: "claude" as LLMProvider,
    color: char.color,
    modelUrl: char.modelUrl,
    activeClip: "Happy Idle",
    status: "idle" as const,
    currentAction: null,
    history: [],
    position: [room.position[0], room.floorY ?? 0, room.position[2]] as [number, number, number],
    roomId: def.roomId,
    projectId: "project-4",
    characterId: def.characterId,
    level: 0,
    availability: "available",
  };
});

// ── Helpers ──────────────────────────────────────────────────
/** Compute the next free grid position for a new room within a project zone */
function nextRoomPosition(
  allRooms: RoomData[],
  projectId: string,
  allProjects: Project[],
): [number, number, number] {
  const origin = getProjectGridOrigin(projectId, allProjects);
  const projectRooms = allRooms.filter((r) => r.projectId === projectId);
  const cols = 3;
  const occupied = new Set(
    projectRooms.map((r) => `${r.position[0]},${r.position[2]}`),
  );
  for (let i = 0; i < 200; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = origin.x + col * ROOM_SPACING_X;
    const z = origin.z + row * ROOM_SPACING_Z;
    if (!occupied.has(`${x},${z}`)) {
      return [x, 0, z];
    }
  }
  return [origin.x, 0, origin.z];
}

// ── AURIA message type ───────────────────────────────────────
export interface AuriaMessage {
  id: string;
  role: "user" | "auria";
  text: string;
  timestamp: Date;
  targetAgent?: string; // avatar id if directed at a specific agent
}

// ── Store interface ──────────────────────────────────────────
interface AuriaStore {
  // System
  systemStatus: SystemStatus;
  setSystemStatus: (status: SystemStatus) => void;

  // Token gauges
  gauges: TokenGaugeData[];
  updateGauge: (provider: string, used: number) => void;
  addTokenUsage: (provider: string, inputTokens: number, outputTokens: number) => void;
  resetTokenTracking: () => void;

  // Activity stream
  activities: ActivityEntry[];
  addActivity: (entry: Omit<ActivityEntry, "id" | "timestamp">) => void;

  // Command history
  commandHistory: CommandHistoryEntry[];
  addCommand: (command: string) => void;

  // Dashboard projects (legacy)
  projects: ProjectData[];

  // Workspace projects
  workspaceProjects: Project[];
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  addProject: (name: string) => void;
  renameProject: (projectId: string, name: string) => void;
  removeProject: (projectId: string) => void;
  setProjectGridCellSize: (projectId: string, size: number) => void;
  setProjectGridColumns: (projectId: string, cols: number) => void;
  setProjectGridRows: (projectId: string, rows: number) => void;

  // AURIA Command Center
  commandCenterOpen: boolean;
  setCommandCenterOpen: (open: boolean) => void;

  // Shared animation clip names (loaded from FBX files, shared across all GLB avatars)
  availableClipNames: string[];
  setAvailableClipNames: (names: string[]) => void;
  setAvatarActiveClip: (avatarId: string, clipName: string) => void;

  // Skills panel
  skillsPanelOpen: boolean;
  setSkillsPanelOpen: (open: boolean) => void;
  auriaMessages: AuriaMessage[];
  sendAuriaMessage: (text: string, targetAgent?: string) => void;

  // Rooms
  rooms: RoomData[];
  addRoom: (label: string) => void;
  renameRoom: (roomId: string, label: string) => void;
  removeRoom: (roomId: string) => void;
  toggleRoomSkill: (roomId: string, skillId: string) => void;

  // LLM API Keys (global, per-provider)
  llmApiKeys: Record<string, string>;
  setLlmApiKey: (provider: string, key: string) => void;

  // Local LLM (Ollama)
  localLlmEndpoint: string;
  localLlmModel: string;
  setLocalLlmEndpoint: (url: string) => void;
  setLocalLlmModel: (model: string) => void;

  // Tripo3D
  tripoApiKey: string;
  setTripoApiKey: (key: string) => void;

  // Appearances library
  appearances: AppearanceEntry[];
  addAppearance: (entry: Omit<AppearanceEntry, "id" | "createdAt">) => void;
  updateAppearance: (id: string, data: Partial<AppearanceEntry>) => void;
  removeAppearance: (id: string) => void;

  // Local GLB hydration (IndexedDB → blob URLs on app start)
  hydrateLocalGlbs: () => Promise<void>;

  // Avatar Generation Console
  avatarGenerationConsoleOpen: boolean;
  setAvatarGenerationConsoleOpen: (open: boolean) => void;

  // Roles
  roles: RoleDefinition[];
  addRole: (role: Omit<RoleDefinition, "id">) => void;
  updateRole: (roleId: string, data: Partial<Omit<RoleDefinition, "id">>) => void;
  removeRole: (roleId: string) => void;

  // Avatars
  avatars: AvatarData[];
  selectedAvatarId: string | null;
  selectAvatar: (id: string | null) => void;
  spawnAuria: () => void;
  removeAuria: () => void;
  addAvatar: (opts: {
    characterId: string;
    provider: LLMProvider;
    roomId: string;
    roleId: string;
  }) => void;
  updateAvatar: (avatarId: string, data: Partial<Pick<AvatarData,
    "name" | "roleId" | "color" | "modelUrl" | "activeClip" | "provider" | "characterId"
  >>) => void;
  removeAvatar: (avatarId: string) => void;
  assignAction: (avatarId: string, prompt: string) => void;
  completeAction: (avatarId: string, result: string, tokenUsage?: { inputTokens: number; outputTokens: number; cost: number }) => void;
  failAction: (avatarId: string, error: string) => void;
  setAvatarStatus: (avatarId: string, status: AvatarStatus) => void;
  moveAvatarToRoom: (avatarId: string, roomId: string) => void;
  updateAvatarPosition: (avatarId: string, position: [number, number, number]) => void;

  // Availability
  setAvatarAvailability: (avatarId: string, availability: "available" | "unavailable") => void;

  // Arena fight
  arenaFight: { fighter1Id: string; fighter2Id: string; previousRooms: Record<string, string> } | null;
  startArenaFight: () => void;
  endArenaFight: () => void;

  // Edit mode (room dragging)
  editMode: boolean;
  setEditMode: (enabled: boolean) => void;

  // Grid overlay
  gridOverlayEnabled: boolean;
  setGridOverlayEnabled: (enabled: boolean) => void;

  // Grid configuration
  gridCellSize: number;
  gridWidth: number;
  gridHeight: number;
  setGridCellSize: (size: number) => void;
  setGridWidth: (width: number) => void;
  setGridHeight: (height: number) => void;

  // Room position update
  updateRoomPosition: (roomId: string, position: [number, number, number]) => void;

  // Trading
  tradingKillSwitch: boolean;
  toggleKillSwitch: () => void;
  opportunityAlertsEnabled: boolean;
  setOpportunityAlertsEnabled: (enabled: boolean) => void;

  // Camera presets
  cameraTarget: { position: [number, number, number]; target: [number, number, number] } | null;
  setCameraTarget: (preset: { position: [number, number, number]; target: [number, number, number] } | null) => void;
  focusedAvatarId: string | null;
  setFocusedAvatarId: (id: string | null) => void;

  // Team Templates
  teamTemplates: TeamTemplate[];
  addTeamTemplate: (template: Omit<TeamTemplate, "id" | "createdAt" | "updatedAt">) => void;
  updateTeamTemplate: (id: string, data: Partial<Omit<TeamTemplate, "id">>) => void;
  removeTeamTemplate: (id: string) => void;
  deployTeamToProject: (templateId: string, projectId: string) => void;
  saveProjectTeamAsTemplate: (projectId: string, name: string) => void;

  // ── Mission Control ──────────────────────────────────────────
  mcTasks: MCTask[];
  addMCTask: (task: Omit<MCTask, "id" | "createdAt" | "updatedAt">) => void;
  updateMCTask: (taskId: string, data: Partial<Omit<MCTask, "id">>) => void;
  removeMCTask: (taskId: string) => void;

  mcCalendarEvents: MCCalendarEvent[];
  addMCCalendarEvent: (event: Omit<MCCalendarEvent, "id" | "createdAt">) => void;
  updateMCCalendarEvent: (eventId: string, data: Partial<Omit<MCCalendarEvent, "id">>) => void;
  removeMCCalendarEvent: (eventId: string) => void;

  mcContentPipeline: MCContentItem[];
  addMCContentItem: (item: Omit<MCContentItem, "id" | "createdAt">) => void;
  updateMCContentItem: (itemId: string, data: Partial<Omit<MCContentItem, "id">>) => void;
  removeMCContentItem: (itemId: string) => void;

  mcMemories: MCMemory[];
  addMCMemory: (memory: Omit<MCMemory, "id" | "createdAt">) => void;
  updateMCMemory: (memoryId: string, data: Partial<Omit<MCMemory, "id">>) => void;
  removeMCMemory: (memoryId: string) => void;

  mcTeamAgents: MCTeamAgent[];
  addMCTeamAgent: (agent: Omit<MCTeamAgent, "id" | "createdAt" | "updatedAt">) => void;
  updateMCTeamAgent: (agentId: string, data: Partial<Omit<MCTeamAgent, "id">>) => void;
  removeMCTeamAgent: (agentId: string) => void;

  // AURIA FPV (not persisted)
  auriaFpvActive: boolean;
  setAuriaFpvActive: (active: boolean) => void;
  toggleAuriaFpv: () => void;
}

export const useStore = create<AuriaStore>()(persist((set) => ({
  systemStatus: "IDLE",
  setSystemStatus: (status) => set({ systemStatus: status }),

  gauges: initialGauges,
  updateGauge: (provider, used) =>
    set((state) => ({
      gauges: state.gauges.map((g) =>
        g.provider === provider ? { ...g, used } : g,
      ),
    })),

  addTokenUsage: (provider, inputTokens, outputTokens) =>
    set((state) => ({
      gauges: state.gauges.map((g) =>
        g.provider === provider
          ? {
              ...g,
              used: g.used + inputTokens + outputTokens,
              cost: g.cost + computeCost(provider, inputTokens, outputTokens),
            }
          : g,
      ),
    })),

  resetTokenTracking: () =>
    set({ gauges: initialGauges.map((g) => ({ ...g })) }),

  activities: mockActivities,
  addActivity: (entry) =>
    set((state) => ({
      activities: [
        ...state.activities,
        { ...entry, id: generateId(), timestamp: new Date() },
      ],
    })),

  commandHistory: [],
  addCommand: (command) =>
    set((state) => ({
      commandHistory: [
        ...state.commandHistory,
        { id: generateId(), command, timestamp: new Date() },
      ],
    })),

  projects: mockProjects,

  // ── Workspace projects ──────────────────────────────────────
  workspaceProjects: defaultProjects,
  activeProjectId: "project-1",
  setActiveProjectId: (id) => set({ activeProjectId: id }),

  addProject: (name) =>
    set((state) => {
      const project: Project = { id: `project-${generateId()}`, name };
      const newProjects = [...state.workspaceProjects, project];
      const origin = getProjectGridOrigin(project.id, newProjects);
      const defaultLabels = [
        "Vision & Stratégie", "Juridique", "Design Studio",
        "App Development", "Infra & DevOps", "Communication & Marketing",
        "Finance", "Analytics & KPIs", "Ops & Support",
      ];
      const newRooms = defaultLabels.map((label, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return {
          id: `room-${generateId()}`,
          label,
          position: [origin.x + col * ROOM_SPACING_X, 0, origin.z + row * ROOM_SPACING_Z] as [number, number, number],
          borderColor: ROOM_BORDER_COLORS[i % ROOM_BORDER_COLORS.length] as string,
          skillIds: [],
          projectId: project.id,
        };
      });
      return {
        workspaceProjects: newProjects,
        activeProjectId: project.id,
        rooms: [...state.rooms, ...newRooms],
      };
    }),

  renameProject: (projectId, name) =>
    set((state) => ({
      workspaceProjects: state.workspaceProjects.map((p) =>
        p.id === projectId ? { ...p, name } : p,
      ),
    })),

  setProjectGridCellSize: (projectId, size) =>
    set((state) => ({
      workspaceProjects: state.workspaceProjects.map((p) =>
        p.id === projectId ? { ...p, gridCellSize: size } : p,
      ),
    })),

  setProjectGridColumns: (projectId, cols) =>
    set((state) => ({
      workspaceProjects: state.workspaceProjects.map((p) =>
        p.id === projectId ? { ...p, gridColumns: cols } : p,
      ),
    })),

  setProjectGridRows: (projectId, rows) =>
    set((state) => ({
      workspaceProjects: state.workspaceProjects.map((p) =>
        p.id === projectId ? { ...p, gridRows: rows } : p,
      ),
    })),

  removeProject: (projectId) =>
    set((state) => {
      if (state.workspaceProjects.length <= 1) return state;
      const remaining = state.workspaceProjects.filter((p) => p.id !== projectId);
      const fallbackId = remaining[0]!.id;
      return {
        workspaceProjects: remaining,
        activeProjectId: state.activeProjectId === projectId ? fallbackId : state.activeProjectId,
        rooms: state.rooms.map((r) =>
          r.projectId === projectId ? { ...r, projectId: fallbackId } : r,
        ),
        avatars: state.avatars.map((a) =>
          a.projectId === projectId ? { ...a, projectId: fallbackId } : a,
        ),
      };
    }),

  // ── AURIA Command Center ────────────────────────────────────
  commandCenterOpen: false,
  setCommandCenterOpen: (open) => set({ commandCenterOpen: open }),

  // ── Shared animation clips ────────────────────────────────
  availableClipNames: [],
  setAvailableClipNames: (names) => set({ availableClipNames: names }),
  setAvatarActiveClip: (avatarId, clipName) =>
    set((state) => ({
      avatars: state.avatars.map((a) =>
        a.id === avatarId ? { ...a, activeClip: clipName } : a,
      ),
    })),

  skillsPanelOpen: false,
  setSkillsPanelOpen: (open) => set({ skillsPanelOpen: open }),

  auriaMessages: [],
  sendAuriaMessage: (text, targetAgent) =>
    set((state) => {
      const userMsg: AuriaMessage = {
        id: generateId(),
        role: "user",
        text,
        timestamp: new Date(),
        targetAgent,
      };

      // Build AURIA's simulated response
      let reply: string;
      if (targetAgent) {
        const agent = state.avatars.find((a) => a.id === targetAgent);
        reply = `Roger. Dispatching to ${agent?.name ?? "agent"}. Standing by for execution.`;
      } else {
        reply = `Acknowledged. Processing: "${text.slice(0, 60)}${text.length > 60 ? "..." : ""}". All agents notified.`;
      }

      const auriaMsg: AuriaMessage = {
        id: generateId(),
        role: "auria",
        text: reply,
        timestamp: new Date(),
      };

      // Dispatch action to targeted agent(s) — sets them to "working"
      const targets = targetAgent
        ? state.avatars.filter((a) => a.id === targetAgent)
        : state.avatars;
      const action = { id: generateId(), prompt: text, startedAt: new Date() };
      const targetIds = new Set(targets.map((a) => a.id));
      const avatars = state.avatars.map((a) =>
        targetIds.has(a.id) && a.status === "idle"
          ? { ...a, status: "working" as const, currentAction: action }
          : a,
      );

      return {
        avatars,
        auriaMessages: [...state.auriaMessages, userMsg, auriaMsg],
        activities: [
          ...state.activities,
          {
            id: generateId(),
            timestamp: new Date(),
            type: "CMD" as const,
            message: `[AURIA] ${text}`,
            source: "auria",
          },
        ],
      };
    }),

  // ── Rooms slice ───────────────────────────────────────────
  rooms: defaultRooms,

  addRoom: (label) =>
    set((state) => {
      const colorIdx = state.rooms.length % ROOM_BORDER_COLORS.length;
      const room: RoomData = {
        id: `room-${generateId()}`,
        label,
        position: nextRoomPosition(state.rooms, state.activeProjectId, state.workspaceProjects),
        borderColor: ROOM_BORDER_COLORS[colorIdx] as string,
        skillIds: [],
        projectId: state.activeProjectId,
      };
      return { rooms: [...state.rooms, room] };
    }),

  toggleRoomSkill: (roomId, skillId) =>
    set((state) => ({
      rooms: state.rooms.map((r) => {
        if (r.id !== roomId) return r;
        const has = r.skillIds.includes(skillId);
        return {
          ...r,
          skillIds: has
            ? r.skillIds.filter((s) => s !== skillId)
            : [...r.skillIds, skillId],
        };
      }),
    })),

  renameRoom: (roomId, label) =>
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId ? { ...r, label } : r,
      ),
    })),

  removeRoom: (roomId) =>
    set((state) => {
      // Move orphaned avatars to the first remaining room
      const remaining = state.rooms.filter((r) => r.id !== roomId);
      const fallback = remaining[0];
      if (!fallback) return state; // don't delete the last room
      const ox = (Math.random() - 0.5) * (ROOM_SIZE.width * 0.4);
      const oz = (Math.random() - 0.5) * (ROOM_SIZE.depth * 0.4);
      return {
        rooms: remaining,
        avatars: state.avatars.map((a) =>
          a.roomId === roomId
            ? {
                ...a,
                roomId: fallback.id,
                position: [fallback.position[0] + ox, fallback.floorY ?? 0, fallback.position[2] + oz],
              }
            : a,
        ),
      };
    }),

  // ── Tripo3D ────────────────────────────────────────────────
  // ── LLM API Keys ──────────────────────────────────────────
  llmApiKeys: { claude: "", gemini: "", mistral: "" },
  setLlmApiKey: (provider, key) =>
    set((state) => ({
      llmApiKeys: { ...state.llmApiKeys, [provider]: key },
    })),

  // ── Local LLM (Ollama) ──────────────────────────────────
  localLlmEndpoint: "http://localhost:11434",
  localLlmModel: "mistral",
  setLocalLlmEndpoint: (url) => set({ localLlmEndpoint: url }),
  setLocalLlmModel: (model) => set({ localLlmModel: model }),

  tripoApiKey: "",
  setTripoApiKey: (key) => set({ tripoApiKey: key }),

  // ── Appearances library ──────────────────────────────────
  appearances: [
    {
      id: "appearance-goku",
      name: "Goku",
      thumbnailUrl: "",
      modelUrl: "/models/Dragon Ball/Goku.glb",
      createdAt: Date.now(),
    },
    {
      id: "appearance-vegeta",
      name: "Vegeta",
      thumbnailUrl: "",
      modelUrl: "/models/Dragon Ball/Vegeta.glb",
      createdAt: Date.now(),
    },
  ],

  addAppearance: (entry) =>
    set((state) => ({
      appearances: [
        ...state.appearances,
        { ...entry, id: `appearance-${generateId()}`, createdAt: Date.now() },
      ],
    })),

  updateAppearance: (id, data) =>
    set((state) => ({
      appearances: state.appearances.map((a) =>
        a.id === id ? { ...a, ...data } : a,
      ),
    })),

  removeAppearance: (id) => {
    // Clean up IndexedDB if local GLB
    const app = useStore.getState().appearances.find((a) => a.id === id);
    if (app?.localGlb) {
      deleteGlbFile(id).catch(() => {});
      // Revoke blob URL to free memory
      if (app.modelUrl.startsWith("blob:")) URL.revokeObjectURL(app.modelUrl);
    }
    set((state) => ({
      appearances: state.appearances.filter((a) => a.id !== id),
    }));
  },

  // ── Local GLB hydration ─────────────────────────────────
  hydrateLocalGlbs: async () => {
    const { appearances } = useStore.getState();
    const locals = appearances.filter((a) => a.localGlb);
    if (locals.length === 0) return;

    const updates: { id: string; modelUrl: string }[] = [];
    await Promise.all(
      locals.map(async (a) => {
        const buffer = await loadGlbFile(a.id).catch(() => null);
        if (buffer) {
          updates.push({ id: a.id, modelUrl: bufferToBlobUrl(buffer) });
        }
      }),
    );

    if (updates.length > 0) {
      set((state) => ({
        appearances: state.appearances.map((a) => {
          const u = updates.find((x) => x.id === a.id);
          return u ? { ...a, modelUrl: u.modelUrl } : a;
        }),
      }));
    }
  },

  // ── Avatar Generation Console ────────────────────────────
  avatarGenerationConsoleOpen: false,
  setAvatarGenerationConsoleOpen: (open) => set({ avatarGenerationConsoleOpen: open }),

  // ── Roles slice ────────────────────────────────────────────
  roles: DEFAULT_ROLES,

  addRole: (role) =>
    set((state) => ({
      roles: [...state.roles, { ...role, id: `role-${generateId()}` }],
    })),

  updateRole: (roleId, data) =>
    set((state) => ({
      roles: state.roles.map((r) =>
        r.id === roleId ? { ...r, ...data } : r,
      ),
    })),

  removeRole: (roleId) =>
    set((state) => ({
      roles: state.roles.filter((r) => r.id !== roleId),
    })),

  // ── Avatar slice ──────────────────────────────────────────
  avatars: [initialAuriaAvatar, ...initialPmAvatars],
  selectedAvatarId: null,

  selectAvatar: (id) => set({ selectedAvatarId: id }),

  spawnAuria: () =>
    set((state) => {
      // Don't spawn if already exists
      if (state.avatars.some((a) => a.characterId === "auria")) return state;
      return { avatars: [...state.avatars, initialAuriaAvatar] };
    }),

  removeAuria: () =>
    set((state) => ({
      avatars: state.avatars.filter((a) => a.characterId !== "auria"),
      selectedAvatarId: state.selectedAvatarId && state.avatars.find((a) => a.id === state.selectedAvatarId)?.characterId === "auria"
        ? null
        : state.selectedAvatarId,
    })),

  addAvatar: (opts) =>
    set((state) => {
      const character = CHARACTER_CATALOG.find((c) => c.id === opts.characterId);
      const charName = character?.name ?? opts.characterId;
      const charModelUrl = character?.modelUrl ?? "";
      const charColor = character?.color ?? "#888888";

      // Count existing avatars of this character to generate unique name
      const count = state.avatars.filter((a) => a.characterId === opts.characterId).length;
      const suffix = count > 0 ? ` ${count + 1}` : "";

      // Place in the target room
      const room = state.rooms.find((r) => r.id === opts.roomId);
      if (!room) return state;
      const project = state.workspaceProjects.find((p) => p.id === room.projectId);
      const rSize = project?.layoutType === "arena" ? ARENA_ROOM_SIZE
        : (project?.layoutType === "trading" || project?.layoutType === "project-management") ? TRADING_ROOM_SIZE
        : ROOM_SIZE;
      const ox = (Math.random() - 0.5) * (rSize.width * 0.4);
      const oz = (Math.random() - 0.5) * (rSize.depth * 0.4);

      const avatar: AvatarData = {
        id: `avatar-${generateId()}`,
        name: `${charName}${suffix}`,
        roleId: opts.roleId,
        provider: opts.provider,
        color: charColor,
        modelUrl: charModelUrl,
        activeClip: "Happy Idle",
        status: "idle",
        currentAction: null,
        history: [],
        position: [room.position[0] + ox, room.floorY ?? 0, room.position[2] + oz],
        roomId: opts.roomId,
        projectId: room.projectId,
        characterId: opts.characterId,
        level: 0,
        availability: "available",
      };
      return { avatars: [...state.avatars, avatar], selectedAvatarId: avatar.id };
    }),

  updateAvatar: (avatarId, data) =>
    set((state) => ({
      avatars: state.avatars.map((a) =>
        a.id === avatarId ? { ...a, ...data } : a,
      ),
    })),

  removeAvatar: (avatarId) =>
    set((state) => ({
      avatars: state.avatars.filter((a) => a.id !== avatarId),
      selectedAvatarId: state.selectedAvatarId === avatarId ? null : state.selectedAvatarId,
    })),

  assignAction: (avatarId, prompt) =>
    set((state) => {
      const action = {
        id: generateId(),
        prompt,
        startedAt: new Date(),
      };
      const avatar = state.avatars.find((a) => a.id === avatarId);
      return {
        avatars: state.avatars.map((a) =>
          a.id === avatarId
            ? { ...a, status: "working" as const, currentAction: action }
            : a,
        ),
        activities: [
          ...state.activities,
          {
            id: generateId(),
            timestamp: new Date(),
            type: "CMD" as const,
            message: `[${avatar?.name ?? avatarId}] ${prompt}`,
            source: avatar?.provider ?? "avatar",
          },
        ],
      };
    }),

  completeAction: (avatarId, result, tokenUsage) =>
    set((state) => {
      const avatar = state.avatars.find((a) => a.id === avatarId);
      const completed = avatar?.currentAction
        ? { ...avatar.currentAction, result, completedAt: new Date(), tokenUsage }
        : null;
      return {
        avatars: state.avatars.map((a) =>
          a.id === avatarId
            ? {
                ...a,
                status: "success" as const,
                currentAction: null,
                history: completed ? [...a.history, completed] : a.history,
                level: Math.min(a.level + 1, 100),
              }
            : a,
        ),
        activities: [
          ...state.activities,
          {
            id: generateId(),
            timestamp: new Date(),
            type: "INFO" as const,
            message: `[${avatar?.name ?? avatarId}] Done — ${result}`,
            source: avatar?.provider ?? "avatar",
          },
        ],
      };
    }),

  failAction: (avatarId, error) =>
    set((state) => {
      const avatar = state.avatars.find((a) => a.id === avatarId);
      const failed = avatar?.currentAction
        ? { ...avatar.currentAction, error, completedAt: new Date() }
        : null;
      return {
        avatars: state.avatars.map((a) =>
          a.id === avatarId
            ? {
                ...a,
                status: "error" as const,
                currentAction: null,
                history: failed ? [...a.history, failed] : a.history,
              }
            : a,
        ),
        activities: [
          ...state.activities,
          {
            id: generateId(),
            timestamp: new Date(),
            type: "ERROR" as const,
            message: `[${avatar?.name ?? avatarId}] Failed — ${error}`,
            source: avatar?.provider ?? "avatar",
          },
        ],
      };
    }),

  setAvatarStatus: (avatarId, status) =>
    set((state) => ({
      avatars: state.avatars.map((a) =>
        a.id === avatarId ? { ...a, status } : a,
      ),
    })),

  moveAvatarToRoom: (avatarId, roomId) =>
    set((state) => {
      const room = state.rooms.find((r) => r.id === roomId);
      if (!room) return state;
      const project = state.workspaceProjects.find((p) => p.id === room.projectId);
      const rSize = project?.layoutType === "arena" ? ARENA_ROOM_SIZE
        : (project?.layoutType === "trading" || project?.layoutType === "project-management") ? TRADING_ROOM_SIZE
        : ROOM_SIZE;
      const ox = (Math.random() - 0.5) * (rSize.width * 0.4);
      const oz = (Math.random() - 0.5) * (rSize.depth * 0.4);
      const position: [number, number, number] = [
        room.position[0] + ox,
        room.floorY ?? 0,
        room.position[2] + oz,
      ];
      return {
        avatars: state.avatars.map((a) =>
          a.id === avatarId ? { ...a, roomId, position, projectId: room.projectId } : a,
        ),
      };
    }),

  updateAvatarPosition: (avatarId, position) =>
    set((state) => ({
      avatars: state.avatars.map((a) =>
        a.id === avatarId ? { ...a, position } : a,
      ),
    })),

  // ── Availability ──────────────────────────────────────────────
  setAvatarAvailability: (avatarId, availability) =>
    set((state) => ({
      avatars: state.avatars.map((a) =>
        a.id === avatarId ? { ...a, availability } : a,
      ),
    })),

  // ── Arena fight ──────────────────────────────────────────────
  arenaFight: null,

  startArenaFight: () =>
    set((state) => {
      if (state.arenaFight) return state; // fight already in progress
      const eligible = state.avatars.filter(
        (a) => a.availability === "available" && a.modelUrl && a.characterId !== "auria",
      );
      if (eligible.length < 2) return state;
      // Pick 2 random distinct avatars
      const shuffled = [...eligible].sort(() => Math.random() - 0.5);
      const f1 = shuffled[0]!;
      const f2 = shuffled[1]!;
      const previousRooms: Record<string, string> = {
        [f1.id]: f1.roomId,
        [f2.id]: f2.roomId,
      };
      // Move both fighters to the arena room
      const arenaRoom = state.rooms.find((r) => r.id === "room-arena");
      if (!arenaRoom) return state;
      const hw = ARENA_ROOM_SIZE.width / 2;
      const avatars = state.avatars.map((a) => {
        if (a.id === f1.id) {
          return {
            ...a,
            roomId: "room-arena",
            projectId: arenaRoom.projectId,
            position: [arenaRoom.position[0] - hw * 0.3, arenaRoom.floorY ?? 0, arenaRoom.position[2]] as [number, number, number],
          };
        }
        if (a.id === f2.id) {
          return {
            ...a,
            roomId: "room-arena",
            projectId: arenaRoom.projectId,
            position: [arenaRoom.position[0] + hw * 0.3, arenaRoom.floorY ?? 0, arenaRoom.position[2]] as [number, number, number],
          };
        }
        return a;
      });
      return {
        avatars,
        arenaFight: { fighter1Id: f1.id, fighter2Id: f2.id, previousRooms },
      };
    }),

  endArenaFight: () =>
    set((state) => {
      if (!state.arenaFight) return state;
      const { fighter1Id, fighter2Id, previousRooms } = state.arenaFight;
      // Move fighters back to their original rooms
      let avatars = [...state.avatars];
      for (const fighterId of [fighter1Id, fighter2Id]) {
        const origRoomId = previousRooms[fighterId];
        if (!origRoomId) continue;
        const origRoom = state.rooms.find((r) => r.id === origRoomId);
        if (!origRoom) continue;
        const project = state.workspaceProjects.find((p) => p.id === origRoom.projectId);
        const rSize = project?.layoutType === "arena" ? ARENA_ROOM_SIZE
          : (project?.layoutType === "trading" || project?.layoutType === "project-management") ? TRADING_ROOM_SIZE
          : ROOM_SIZE;
        const ox = (Math.random() - 0.5) * (rSize.width * 0.4);
        const oz = (Math.random() - 0.5) * (rSize.depth * 0.4);
        avatars = avatars.map((a) =>
          a.id === fighterId
            ? {
                ...a,
                roomId: origRoomId,
                projectId: origRoom.projectId,
                position: [origRoom.position[0] + ox, origRoom.floorY ?? 0, origRoom.position[2] + oz] as [number, number, number],
              }
            : a,
        );
      }
      return { avatars, arenaFight: null };
    }),

  // ── Edit mode (room dragging) ────────────────────────────────
  editMode: false,
  setEditMode: (enabled) => {
    set({ editMode: enabled });
    // When leaving edit mode, immediately flush positions to Supabase
    // (positions are debounced at 2s, this ensures they're saved before a potential refresh)
    if (!enabled) flushSync();
  },

  // ── Grid overlay ───────────────────────────────────────────
  gridOverlayEnabled: false,
  setGridOverlayEnabled: (enabled) => set({ gridOverlayEnabled: enabled }),

  // ── Grid configuration ────────────────────────────────────
  gridCellSize: 2,
  gridWidth: 200,
  gridHeight: 200,
  setGridCellSize: (size) => set({ gridCellSize: size }),
  setGridWidth: (width) => set({ gridWidth: width }),
  setGridHeight: (height) => set({ gridHeight: height }),

  // ── Room position update ───────────────────────────────────
  updateRoomPosition: (roomId, position) =>
    set((state) => ({
      rooms: state.rooms.map((r) =>
        r.id === roomId ? { ...r, position } : r,
      ),
    })),

  // ── Trading ──────────────────────────────────────────────────
  tradingKillSwitch: false,
  toggleKillSwitch: () => set((state) => ({ tradingKillSwitch: !state.tradingKillSwitch })),
  opportunityAlertsEnabled: false,
  setOpportunityAlertsEnabled: (enabled) => set({ opportunityAlertsEnabled: enabled }),

  // ── Camera presets ──────────────────────────────────────────
  cameraTarget: null,
  setCameraTarget: (preset) => set({ cameraTarget: preset }),
  focusedAvatarId: null,
  setFocusedAvatarId: (id) => set({ focusedAvatarId: id, cameraTarget: null }),

  // ── Team Templates ────────────────────────────────────────
  teamTemplates: [],

  addTeamTemplate: (template) =>
    set((state) => ({
      teamTemplates: [
        ...state.teamTemplates,
        {
          ...template,
          id: `team-${generateId()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
    })),

  updateTeamTemplate: (id, data) =>
    set((state) => ({
      teamTemplates: state.teamTemplates.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: Date.now() } : t,
      ),
    })),

  removeTeamTemplate: (id) =>
    set((state) => ({
      teamTemplates: state.teamTemplates.filter((t) => t.id !== id),
    })),

  deployTeamToProject: (templateId, projectId) =>
    set((state) => {
      const template = state.teamTemplates.find((t) => t.id === templateId);
      if (!template) return state;

      const projectRooms = state.rooms.filter((r) => r.projectId === projectId);
      let avatars = [...state.avatars];

      for (const slot of template.slots) {
        // Find matching room in this project
        const room = projectRooms.find((r) => r.id === slot.roomId)
          ?? projectRooms[projectRooms.indexOf(projectRooms[0]!)];
        if (!room) continue;

        const character = CHARACTER_CATALOG.find((c) => c.id === slot.characterId);
        const charName = slot.avatarName ?? character?.name ?? slot.characterId;
        const charModelUrl = character?.modelUrl ?? "";
        const charColor = slot.color ?? character?.color ?? "#888888";

        // Check if an avatar already exists in this room for this project
        const existingIdx = avatars.findIndex(
          (a) => a.roomId === room.id && a.projectId === projectId,
        );

        const ox = (Math.random() - 0.5) * (ROOM_SIZE.width * 0.4);
        const oz = (Math.random() - 0.5) * (ROOM_SIZE.depth * 0.4);

        if (existingIdx >= 0) {
          // Update existing avatar
          avatars[existingIdx] = {
            ...avatars[existingIdx]!,
            characterId: slot.characterId,
            provider: slot.provider,
            roleId: slot.roleId,
            name: charName,
            color: charColor,
            modelUrl: charModelUrl,
          };
        } else {
          // Create new avatar
          avatars.push({
            id: `avatar-${generateId()}`,
            name: charName,
            roleId: slot.roleId,
            provider: slot.provider,
            color: charColor,
            modelUrl: charModelUrl,
            activeClip: "Happy Idle",
            status: "idle",
            currentAction: null,
            history: [],
            position: [room.position[0] + ox, room.floorY ?? 0, room.position[2] + oz],
            roomId: room.id,
            projectId,
            characterId: slot.characterId,
            level: 0,
            availability: "available",
          });
        }
      }

      return { avatars };
    }),

  saveProjectTeamAsTemplate: (projectId, name) =>
    set((state) => {
      const projectAvatars = state.avatars.filter((a) => a.projectId === projectId);
      const slots = projectAvatars.map((a) => ({
        roomId: a.roomId,
        characterId: a.characterId,
        provider: a.provider,
        roleId: a.roleId,
        avatarName: a.name,
        color: a.color,
      }));

      const template: TeamTemplate = {
        id: `team-${generateId()}`,
        name,
        slots,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      return { teamTemplates: [...state.teamTemplates, template] };
    }),

  // ── Mission Control ───────────────────────────────────────
  mcTasks: [],
  addMCTask: (task) =>
    set((state) => {
      const now = Date.now();
      return {
        mcTasks: [...state.mcTasks, { ...task, id: `mctask-${generateId()}`, createdAt: now, updatedAt: now }],
      };
    }),
  updateMCTask: (taskId, data) =>
    set((state) => ({
      mcTasks: state.mcTasks.map((t) =>
        t.id === taskId ? { ...t, ...data, updatedAt: Date.now() } : t,
      ),
    })),
  removeMCTask: (taskId) =>
    set((state) => ({ mcTasks: state.mcTasks.filter((t) => t.id !== taskId) })),

  mcCalendarEvents: [],
  addMCCalendarEvent: (event) =>
    set((state) => ({
      mcCalendarEvents: [...state.mcCalendarEvents, { ...event, id: `mcevent-${generateId()}`, createdAt: Date.now() }],
    })),
  updateMCCalendarEvent: (eventId, data) =>
    set((state) => ({
      mcCalendarEvents: state.mcCalendarEvents.map((e) =>
        e.id === eventId ? { ...e, ...data } : e,
      ),
    })),
  removeMCCalendarEvent: (eventId) =>
    set((state) => ({ mcCalendarEvents: state.mcCalendarEvents.filter((e) => e.id !== eventId) })),

  mcContentPipeline: [],
  addMCContentItem: (item) =>
    set((state) => ({
      mcContentPipeline: [...state.mcContentPipeline, { ...item, id: `mccontent-${generateId()}`, createdAt: Date.now() }],
    })),
  updateMCContentItem: (itemId, data) =>
    set((state) => ({
      mcContentPipeline: state.mcContentPipeline.map((c) =>
        c.id === itemId ? { ...c, ...data } : c,
      ),
    })),
  removeMCContentItem: (itemId) =>
    set((state) => ({ mcContentPipeline: state.mcContentPipeline.filter((c) => c.id !== itemId) })),

  mcMemories: [],
  addMCMemory: (memory) =>
    set((state) => ({
      mcMemories: [...state.mcMemories, { ...memory, id: `mcmem-${generateId()}`, createdAt: Date.now() }],
    })),
  updateMCMemory: (memoryId, data) =>
    set((state) => ({
      mcMemories: state.mcMemories.map((m) =>
        m.id === memoryId ? { ...m, ...data } : m,
      ),
    })),
  removeMCMemory: (memoryId) =>
    set((state) => ({ mcMemories: state.mcMemories.filter((m) => m.id !== memoryId) })),

  mcTeamAgents: [],
  addMCTeamAgent: (agent) =>
    set((state) => {
      const now = Date.now();
      return {
        mcTeamAgents: [...state.mcTeamAgents, { ...agent, id: `mcagent-${generateId()}`, createdAt: now, updatedAt: now }],
      };
    }),
  updateMCTeamAgent: (agentId, data) =>
    set((state) => ({
      mcTeamAgents: state.mcTeamAgents.map((a) =>
        a.id === agentId ? { ...a, ...data, updatedAt: Date.now() } : a,
      ),
    })),
  removeMCTeamAgent: (agentId) =>
    set((state) => ({ mcTeamAgents: state.mcTeamAgents.filter((a) => a.id !== agentId) })),

  // ── AURIA FPV ──────────────────────────────────────────────
  auriaFpvActive: false,
  setAuriaFpvActive: (active) =>
    set({
      auriaFpvActive: active,
      ...(active ? { cameraTarget: null, focusedAvatarId: null } : {}),
    }),
  toggleAuriaFpv: () =>
    set((state) => ({
      auriaFpvActive: !state.auriaFpvActive,
      ...(!state.auriaFpvActive ? { cameraTarget: null, focusedAvatarId: null } : {}),
    })),
}), {
  name: "auria-store",
  partialize: (state) => ({
    gauges: state.gauges,
    llmApiKeys: state.llmApiKeys,
    localLlmEndpoint: state.localLlmEndpoint,
    localLlmModel: state.localLlmModel,
    tripoApiKey: state.tripoApiKey,
    appearances: state.appearances,
    rooms: state.rooms,
    roles: state.roles,
    avatars: state.avatars.map((a) => ({
      id: a.id,
      name: a.name,
      roleId: a.roleId,
      provider: a.provider,
      color: a.color,
      modelUrl: a.modelUrl,
      activeClip: a.activeClip,
      roomId: a.roomId,
      position: a.position,
      projectId: a.projectId,
      characterId: a.characterId,
      level: a.level,
      availability: a.availability,
    })),
    workspaceProjects: state.workspaceProjects,
    activeProjectId: state.activeProjectId,
    teamTemplates: state.teamTemplates,
    tradingKillSwitch: state.tradingKillSwitch,
    opportunityAlertsEnabled: state.opportunityAlertsEnabled,
    gridOverlayEnabled: state.gridOverlayEnabled,
    gridCellSize: state.gridCellSize,
    gridWidth: state.gridWidth,
    gridHeight: state.gridHeight,
    mcTasks: state.mcTasks,
    mcCalendarEvents: state.mcCalendarEvents,
    mcContentPipeline: state.mcContentPipeline,
    mcMemories: state.mcMemories,
    mcTeamAgents: state.mcTeamAgents,
  }),
  merge: (persisted, current) => {
    type SavedAvatar = {
      id: string; name: string; provider: LLMProvider;
      color: string; modelUrl?: string; activeClip?: string; roomId: string; position: [number, number, number];
      projectId?: string; characterId?: string; level?: number;
      availability?: "available" | "unavailable";
      // New field
      roleId?: string;
      // Legacy fields (migration)
      role?: string; systemPrompt?: string; skillIds?: string[]; apiKey?: string;
    };
    const saved = persisted as {
      gauges?: TokenGaugeData[];
      llmApiKeys?: Record<string, string>;
      localLlmEndpoint?: string;
      localLlmModel?: string;
      tripoApiKey?: string;
      appearances?: AppearanceEntry[];
      rooms?: RoomData[];
      roles?: RoleDefinition[];
      avatars?: SavedAvatar[];
      workspaceProjects?: Project[];
      activeProjectId?: string;
      teamTemplates?: TeamTemplate[];
      tradingKillSwitch?: boolean;
      opportunityAlertsEnabled?: boolean;
      gridOverlayEnabled?: boolean;
      gridCellSize?: number;
      gridWidth?: number;
      gridHeight?: number;
      mcTasks?: MCTask[];
      mcCalendarEvents?: MCCalendarEvent[];
      mcContentPipeline?: MCContentItem[];
      mcMemories?: MCMemory[];
      mcTeamAgents?: MCTeamAgent[];
    } | undefined;
    if (!saved) return current;

    // Merge gauges: restore saved values, ensure cost field exists
    const gauges = saved.gauges
      ? saved.gauges.map((g) => ({ ...g, cost: g.cost ?? 0 }))
      : current.gauges;

    const llmApiKeys = saved.llmApiKeys
      ? { ...current.llmApiKeys, ...saved.llmApiKeys }
      : current.llmApiKeys;
    const localLlmEndpoint = saved.localLlmEndpoint ?? current.localLlmEndpoint;
    const localLlmModel = saved.localLlmModel ?? current.localLlmModel;
    const tripoApiKey = saved.tripoApiKey ?? current.tripoApiKey;

    // Merge roles: restore saved + append any missing defaults
    const savedRoles = saved.roles && saved.roles.length > 0 ? saved.roles : [];
    const savedRoleIds = new Set(savedRoles.map((r) => r.id));
    const missingRoleDefaults = current.roles.filter((r) => !savedRoleIds.has(r.id));
    const roles = savedRoles.length > 0
      ? [...savedRoles, ...missingRoleDefaults]
      : current.roles;

    // Merge workspace projects
    const savedWsProjects = saved.workspaceProjects && saved.workspaceProjects.length > 0
      ? saved.workspaceProjects
      : [];
    const savedWsProjIds = new Set(savedWsProjects.map((p) => p.id));
    const missingProjDefaults = current.workspaceProjects.filter((p) => !savedWsProjIds.has(p.id));
    const workspaceProjects = savedWsProjects.length > 0
      ? [...savedWsProjects, ...missingProjDefaults]
      : current.workspaceProjects;
    const activeProjectId = saved.activeProjectId ?? current.activeProjectId;

    // Merge appearances: restore saved + append any new defaults
    const savedAppearances = saved.appearances && saved.appearances.length > 0
      ? saved.appearances
      : [];
    const savedAppIds = new Set(savedAppearances.map((a) => a.id));
    const missingAppDefaults = current.appearances.filter((a) => !savedAppIds.has(a.id));
    const appearances = savedAppearances.length > 0
      ? [...savedAppearances, ...missingAppDefaults]
      : current.appearances;

    // Merge rooms: restore saved rooms (with their saved positions) + append any new default rooms
    const savedRooms = saved.rooms && saved.rooms.length > 0
      ? saved.rooms.map((r) => ({
          ...r,
          skillIds: r.skillIds ?? [],
          projectId: r.projectId ?? "project-1",
        }))
      : [];
    const savedRoomIds = new Set(savedRooms.map((r) => r.id));
    const missingDefaults = current.rooms.filter((r) => !savedRoomIds.has(r.id));
    const rooms = savedRooms.length > 0
      ? [...savedRooms, ...missingDefaults]
      : current.rooms;

    // Merge team templates
    const teamTemplates = saved.teamTemplates ?? current.teamTemplates;

    // Merge trading state
    const tradingKillSwitch = saved.tradingKillSwitch ?? current.tradingKillSwitch;
    const opportunityAlertsEnabled = saved.opportunityAlertsEnabled ?? current.opportunityAlertsEnabled;
    const gridOverlayEnabled = saved.gridOverlayEnabled ?? current.gridOverlayEnabled;
    const gridCellSize = saved.gridCellSize ?? current.gridCellSize;
    const gridWidth = saved.gridWidth ?? current.gridWidth;
    const gridHeight = saved.gridHeight ?? current.gridHeight;

    // Merge Mission Control slices
    const mcTasks = saved.mcTasks ?? current.mcTasks;
    const mcCalendarEvents = saved.mcCalendarEvents ?? current.mcCalendarEvents;
    const mcContentPipeline = saved.mcContentPipeline ?? current.mcContentPipeline;
    const mcMemories = saved.mcMemories ?? current.mcMemories;
    const mcTeamAgents = saved.mcTeamAgents ?? current.mcTeamAgents;

    // If no saved avatars key at all (first ever load), use defaults
    if (!saved.avatars) {
      return { ...current, gauges, llmApiKeys, localLlmEndpoint, localLlmModel, tripoApiKey, appearances, rooms, roles, workspaceProjects, activeProjectId, teamTemplates, tradingKillSwitch, opportunityAlertsEnabled, gridOverlayEnabled, gridCellSize, gridWidth, gridHeight, mcTasks, mcCalendarEvents, mcContentPipeline, mcMemories, mcTeamAgents };
    }

    // Build map of default avatars for merging
    const defaultMap = new Map(current.avatars.map((a) => [a.id, a]));

    // Build a map from characterId → current modelUrl for migration
    const catalogModelUrls = new Map(CHARACTER_CATALOG.map((c) => [c.id, c.modelUrl]));

    // Restore saved avatars (empty array = user deleted them all, respect that)
    const restoredAvatars: AvatarData[] = saved.avatars
      .map((s) => {
        const base = defaultMap.get(s.id);
        // Migrate modelUrl: if avatar has a characterId, always use the catalog's current URL
        const catalogUrl = s.characterId ? catalogModelUrls.get(s.characterId) : undefined;
        const modelUrl = catalogUrl ?? (s.modelUrl || base?.modelUrl || "");

        // Migration: if legacy `role` (string) exists but no `roleId`, match by name
        let roleId = s.roleId ?? "";
        if (!roleId && s.role) {
          const matched = roles.find((r) => r.name === s.role);
          roleId = matched?.id ?? "";
        }

        return {
          id: s.id,
          name: s.name,
          roleId,
          provider: s.provider,
          color: s.color,
          modelUrl,
          activeClip: s.activeClip || "Happy Idle",
          status: "idle" as const,
          currentAction: null,
          history: [],
          position: s.position,
          roomId: s.roomId,
          projectId: s.projectId ?? "project-1",
          characterId: s.characterId ?? "",
          level: s.level ?? 0,
          availability: s.availability ?? "available",
        };
      });
    // Inject AURIA + PM avatars only if missing from saved data
    const restoredIds = new Set(restoredAvatars.map((a) => a.id));
    const systemAvatarDefaults = [initialAuriaAvatar, ...initialPmAvatars];
    const missingSystemAvatars = systemAvatarDefaults.filter((d) => !restoredIds.has(d.id));
    const avatars: AvatarData[] = [...restoredAvatars, ...missingSystemAvatars];

    return { ...current, gauges, llmApiKeys, localLlmEndpoint, localLlmModel, tripoApiKey, appearances, rooms, roles, avatars, workspaceProjects, activeProjectId, teamTemplates, tradingKillSwitch, opportunityAlertsEnabled, gridOverlayEnabled, gridCellSize, gridWidth, gridHeight, mcTasks, mcCalendarEvents, mcContentPipeline, mcMemories, mcTeamAgents };
  },
}));

// ── Supabase bootstrap ──────────────────────────────────────────
// After localStorage hydration finishes, overlay with Supabase data
// and start the sync engine. Runs only when env vars are present.

if (isSupabaseEnabled()) {
  const persistApi = (useStore as unknown as {
    persist: {
      hasHydrated: () => boolean;
      onFinishHydration: (cb: () => void) => () => void;
    };
  }).persist;

  async function bootstrapSupabase() {
    try {
      const remote = await loadFromSupabase();

      if (remote) {
        // Snapshot local positions (from localStorage, always most recent) BEFORE overlay
        const local = useStore.getState();
        const localRoomPos = new Map(local.rooms.map((r) => [r.id, r.position]));
        const localAvatarPos = new Map(local.avatars.map((a) => [a.id, a.position]));

        // Overlay remote data, inject AURIA + PM avatars only if missing
        const remoteAvatars = remote.avatars ?? [];
        const remoteIds = new Set(remoteAvatars.map((a) => a.id));
        const systemDefaults = [initialAuriaAvatar, ...initialPmAvatars];
        const missingDefaults = systemDefaults.filter((d) => !remoteIds.has(d.id));
        const mergedAvatars = [...remoteAvatars, ...missingDefaults];

        // Merge rooms: use Supabase data but preserve local positions
        // (localStorage is written synchronously, so it's always fresher than Supabase which is debounced)
        const mergedRooms = remote.rooms
          ? remote.rooms.map((r) => ({
              ...r,
              position: localRoomPos.get(r.id) ?? r.position,
            }))
          : undefined;

        const mergedAvatarsWithPos = mergedAvatars.map((a) => ({
          ...a,
          position: localAvatarPos.get(a.id) ?? a.position,
        }));

        useStore.setState({
          ...remote,
          ...(mergedRooms ? { rooms: mergedRooms } : {}),
          avatars: mergedAvatarsWithPos,
        });
        console.info("[supabase] state overlayed from cloud (local positions preserved)");
      } else {
        // Tables are empty — seed them with current (localStorage-hydrated) state
        const s = useStore.getState();
        await seedIfEmpty({
          workspaceProjects: s.workspaceProjects,
          rooms: s.rooms,
          roles: s.roles,
          avatars: s.avatars,
          gauges: s.gauges,
          teamTemplates: s.teamTemplates,
          appearances: s.appearances,
          mcTasks: s.mcTasks,
          mcCalendarEvents: s.mcCalendarEvents,
          mcContentPipeline: s.mcContentPipeline,
          mcMemories: s.mcMemories,
          mcTeamAgents: s.mcTeamAgents,
          llmApiKeys: s.llmApiKeys,
          localLlmEndpoint: s.localLlmEndpoint,
          localLlmModel: s.localLlmModel,
          tripoApiKey: s.tripoApiKey,
          activeProjectId: s.activeProjectId,
          tradingKillSwitch: s.tradingKillSwitch,
          opportunityAlertsEnabled: s.opportunityAlertsEnabled,
          gridOverlayEnabled: s.gridOverlayEnabled,
          gridCellSize: s.gridCellSize,
          gridWidth: s.gridWidth,
          gridHeight: s.gridHeight,
        });
      }
    } catch (err) {
      console.warn("[supabase] bootstrap failed:", err);
    }

    // Start sync engine regardless (will track future mutations)
    startSyncEngine(
      useStore.subscribe as unknown as (listener: (state: Record<string, unknown>, prev: Record<string, unknown>) => void) => () => void,
      useStore.getState as unknown as () => Record<string, unknown>,
    );
  }

  // Hydration may already be done (synchronous localStorage), so check both cases
  if (persistApi.hasHydrated()) {
    void bootstrapSupabase();
  } else {
    persistApi.onFinishHydration(() => {
      void bootstrapSupabase();
    });
  }

  // Flush pending writes on page unload
  window.addEventListener("beforeunload", () => {
    flushSync();
  });
}
