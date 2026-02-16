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
} from "@/types";
import {
  ROOM_SIZE,
  ROOM_BORDER_COLORS,
  ROOM_SPACING_X,
  ROOM_SPACING_Z,
  CHARACTER_CATALOG,
} from "@/types";
import { mockGauges, mockActivities, mockProjects } from "@/types/mock-data";
import { generateId } from "@/lib/utils";
import { loadGlbFile, deleteGlbFile, bufferToBlobUrl } from "@/lib/glbStore";

// ── Default projects ─────────────────────────────────────────
const defaultProjects: Project[] = [
  { id: "project-1", name: "Projet #1" },
];

// Grid origin offset — pushes the room grid away from the camera
const GRID_ORIGIN_X = 8;
const GRID_ORIGIN_Z = 0.6;

// ── Default rooms ────────────────────────────────────────────
const defaultRooms: RoomData[] = [
  {
    id: "room-vision",
    label: "Vision & Stratégie",
    position: [GRID_ORIGIN_X, 0, GRID_ORIGIN_Z],
    borderColor: ROOM_BORDER_COLORS[0],
    skillIds: [],
    projectId: "project-1",
  },
  {
    id: "room-legal",
    label: "Juridique",
    position: [GRID_ORIGIN_X + ROOM_SPACING_X, 0, GRID_ORIGIN_Z],
    borderColor: ROOM_BORDER_COLORS[1],
    skillIds: [],
    projectId: "project-1",
  },
  {
    id: "room-design",
    label: "Design Studio",
    position: [GRID_ORIGIN_X + 2 * ROOM_SPACING_X, 0, GRID_ORIGIN_Z],
    borderColor: ROOM_BORDER_COLORS[2],
    skillIds: [],
    projectId: "project-1",
  },
  {
    id: "room-dev",
    label: "App Development",
    position: [GRID_ORIGIN_X, 0, GRID_ORIGIN_Z + ROOM_SPACING_Z],
    borderColor: ROOM_BORDER_COLORS[3],
    skillIds: [],
    projectId: "project-1",
  },
  {
    id: "room-vps",
    label: "Infra & DevOps",
    position: [GRID_ORIGIN_X + ROOM_SPACING_X, 0, GRID_ORIGIN_Z + ROOM_SPACING_Z],
    borderColor: ROOM_BORDER_COLORS[4],
    skillIds: [],
    projectId: "project-1",
  },
  {
    id: "room-comms",
    label: "Communication & Marketing",
    position: [GRID_ORIGIN_X + 2 * ROOM_SPACING_X, 0, GRID_ORIGIN_Z + ROOM_SPACING_Z],
    borderColor: ROOM_BORDER_COLORS[5],
    skillIds: [],
    projectId: "project-1",
  },
  {
    id: "room-finance",
    label: "Finance",
    position: [GRID_ORIGIN_X, 0, GRID_ORIGIN_Z + 2 * ROOM_SPACING_Z],
    borderColor: ROOM_BORDER_COLORS[6],
    skillIds: [],
    projectId: "project-1",
  },
  {
    id: "room-analytics",
    label: "Analytics & KPIs",
    position: [GRID_ORIGIN_X + ROOM_SPACING_X, 0, GRID_ORIGIN_Z + 2 * ROOM_SPACING_Z],
    borderColor: ROOM_BORDER_COLORS[7],
    skillIds: [],
    projectId: "project-1",
  },
  {
    id: "room-ops",
    label: "Ops & Support",
    position: [GRID_ORIGIN_X + 2 * ROOM_SPACING_X, 0, GRID_ORIGIN_Z + 2 * ROOM_SPACING_Z],
    borderColor: ROOM_BORDER_COLORS[8],
    skillIds: [],
    projectId: "project-1",
  },
];

// ── Helpers ──────────────────────────────────────────────────
/** Compute the next free grid position for a new room */
function nextRoomPosition(rooms: RoomData[]): [number, number, number] {
  const cols = 3;
  // Collect already-occupied grid slots
  const occupied = new Set(
    rooms.map((r) => `${r.position[0]},${r.position[2]}`),
  );
  // Walk the grid until we find a free slot
  for (let i = 0; i < 200; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = GRID_ORIGIN_X + col * ROOM_SPACING_X;
    const z = GRID_ORIGIN_Z + row * ROOM_SPACING_Z;
    if (!occupied.has(`${x},${z}`)) {
      return [x, 0, z];
    }
  }
  // Fallback (should never happen)
  return [GRID_ORIGIN_X + rooms.length * ROOM_SPACING_X, 0, GRID_ORIGIN_Z];
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

  // Avatars
  avatars: AvatarData[];
  selectedAvatarId: string | null;
  selectAvatar: (id: string | null) => void;
  addAvatar: (opts: {
    characterId: string;
    provider: LLMProvider;
    roomId: string;
    roleTitle: string;
    systemPrompt: string;
  }) => void;
  updateAvatar: (avatarId: string, data: Partial<Pick<AvatarData,
    "name" | "role" | "systemPrompt" | "apiKey" | "color" | "modelUrl" | "activeClip" | "provider" | "characterId" | "skillIds"
  >>) => void;
  removeAvatar: (avatarId: string) => void;
  assignAction: (avatarId: string, prompt: string) => void;
  completeAction: (avatarId: string, result: string) => void;
  failAction: (avatarId: string, error: string) => void;
  setAvatarStatus: (avatarId: string, status: AvatarStatus) => void;
  moveAvatarToRoom: (avatarId: string, roomId: string) => void;
  updateAvatarPosition: (avatarId: string, position: [number, number, number]) => void;
  toggleAvatarSkill: (avatarId: string, skillId: string) => void;

  // Team Templates
  teamTemplates: TeamTemplate[];
  addTeamTemplate: (template: Omit<TeamTemplate, "id" | "createdAt" | "updatedAt">) => void;
  updateTeamTemplate: (id: string, data: Partial<Omit<TeamTemplate, "id">>) => void;
  removeTeamTemplate: (id: string) => void;
  deployTeamToProject: (templateId: string, projectId: string) => void;
  saveProjectTeamAsTemplate: (projectId: string, name: string) => void;
}

export const useStore = create<AuriaStore>()(persist((set) => ({
  systemStatus: "IDLE",
  setSystemStatus: (status) => set({ systemStatus: status }),

  gauges: mockGauges,
  updateGauge: (provider, used) =>
    set((state) => ({
      gauges: state.gauges.map((g) =>
        g.provider === provider ? { ...g, used } : g,
      ),
    })),

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
      return {
        workspaceProjects: [...state.workspaceProjects, project],
        activeProjectId: project.id,
      };
    }),

  renameProject: (projectId, name) =>
    set((state) => ({
      workspaceProjects: state.workspaceProjects.map((p) =>
        p.id === projectId ? { ...p, name } : p,
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
        position: nextRoomPosition(state.rooms),
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
                position: [fallback.position[0] + ox, 0, fallback.position[2] + oz],
              }
            : a,
        ),
      };
    }),

  // ── Tripo3D ────────────────────────────────────────────────
  tripoApiKey: "",
  setTripoApiKey: (key) => set({ tripoApiKey: key }),

  // ── Appearances library ──────────────────────────────────
  appearances: [
    {
      id: "appearance-goku",
      name: "Goku",
      thumbnailUrl: "",
      modelUrl: "/models/goku.glb",
      createdAt: Date.now(),
    },
    {
      id: "appearance-vegeta",
      name: "Vegeta",
      thumbnailUrl: "",
      modelUrl: "/models/vegeta.glb",
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

  // ── Avatar slice ──────────────────────────────────────────
  avatars: [{
    id: "avatar-auria",
    name: "Goku",
    role: "dev",
    provider: "auria" as const,
    color: "#ff3c3c",
    modelUrl: "/models/goku.glb",
    activeClip: "Happy Idle",
    status: "idle" as const,
    currentAction: null,
    history: [],
    position: [GRID_ORIGIN_X - 1.2, 0, GRID_ORIGIN_Z + 0.5],
    roomId: "room-dev",
    apiKey: "",
    projectId: "project-1",
    characterId: "goku",
    systemPrompt: "",
    skillIds: [],
    level: 0,
  }],
  selectedAvatarId: null,

  selectAvatar: (id) => set({ selectedAvatarId: id }),

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
      const ox = (Math.random() - 0.5) * (ROOM_SIZE.width * 0.4);
      const oz = (Math.random() - 0.5) * (ROOM_SIZE.depth * 0.4);

      const avatar: AvatarData = {
        id: `avatar-${generateId()}`,
        name: `${charName}${suffix}`,
        role: opts.roleTitle,
        provider: opts.provider,
        color: charColor,
        modelUrl: charModelUrl,
        activeClip: "Happy Idle",
        status: "idle",
        currentAction: null,
        history: [],
        position: [room.position[0] + ox, 0, room.position[2] + oz],
        roomId: opts.roomId,
        apiKey: "",
        projectId: room.projectId,
        characterId: opts.characterId,
        systemPrompt: opts.systemPrompt,
        skillIds: [],
        level: 0,
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

  completeAction: (avatarId, result) =>
    set((state) => {
      const avatar = state.avatars.find((a) => a.id === avatarId);
      const completed = avatar?.currentAction
        ? { ...avatar.currentAction, result, completedAt: new Date() }
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
      const ox = (Math.random() - 0.5) * (ROOM_SIZE.width * 0.4);
      const oz = (Math.random() - 0.5) * (ROOM_SIZE.depth * 0.4);
      const position: [number, number, number] = [
        room.position[0] + ox,
        0,
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

  toggleAvatarSkill: (avatarId, skillId) =>
    set((state) => ({
      avatars: state.avatars.map((a) => {
        if (a.id !== avatarId) return a;
        const has = a.skillIds.includes(skillId);
        return {
          ...a,
          skillIds: has
            ? a.skillIds.filter((s) => s !== skillId)
            : [...a.skillIds, skillId],
        };
      }),
    })),

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
            role: slot.roleTitle,
            systemPrompt: slot.systemPrompt,
            name: charName,
            color: charColor,
            modelUrl: charModelUrl,
            // Keep apiKey — security: user fills it manually
          };
        } else {
          // Create new avatar
          avatars.push({
            id: `avatar-${generateId()}`,
            name: charName,
            role: slot.roleTitle,
            provider: slot.provider,
            color: charColor,
            modelUrl: charModelUrl,
            activeClip: "Happy Idle",
            status: "idle",
            currentAction: null,
            history: [],
            position: [room.position[0] + ox, 0, room.position[2] + oz],
            roomId: room.id,
            apiKey: "",
            projectId,
            characterId: slot.characterId,
            systemPrompt: slot.systemPrompt,
            skillIds: [],
            level: 0,
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
        roleTitle: a.role,
        systemPrompt: a.systemPrompt,
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
}), {
  name: "auria-store",
  partialize: (state) => ({
    tripoApiKey: state.tripoApiKey,
    appearances: state.appearances,
    rooms: state.rooms,
    avatars: state.avatars.map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      provider: a.provider,
      color: a.color,
      modelUrl: a.modelUrl,
      activeClip: a.activeClip,
      roomId: a.roomId,
      position: a.position,
      apiKey: a.apiKey,
      projectId: a.projectId,
      characterId: a.characterId,
      systemPrompt: a.systemPrompt,
      skillIds: a.skillIds,
      level: a.level,
    })),
    workspaceProjects: state.workspaceProjects,
    activeProjectId: state.activeProjectId,
    teamTemplates: state.teamTemplates,
  }),
  merge: (persisted, current) => {
    type SavedAvatar = {
      id: string; name: string; role: string; provider: LLMProvider;
      color: string; modelUrl?: string; activeClip?: string; roomId: string; position: [number, number, number]; apiKey: string;
      projectId?: string; characterId?: string; systemPrompt?: string; skillIds?: string[]; level?: number;
    };
    const saved = persisted as {
      tripoApiKey?: string;
      appearances?: AppearanceEntry[];
      rooms?: RoomData[];
      avatars?: SavedAvatar[];
      workspaceProjects?: Project[];
      activeProjectId?: string;
      teamTemplates?: TeamTemplate[];
    } | undefined;
    if (!saved) return current;

    const tripoApiKey = saved.tripoApiKey ?? current.tripoApiKey;

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

    // Merge rooms: restore saved rooms + append any new default rooms
    const savedRooms = saved.rooms && saved.rooms.length > 0
      ? saved.rooms.map((r) => ({ ...r, skillIds: r.skillIds ?? [], projectId: r.projectId ?? "project-1" }))
      : [];
    const savedRoomIds = new Set(savedRooms.map((r) => r.id));
    const missingDefaults = current.rooms.filter((r) => !savedRoomIds.has(r.id));
    const rooms = savedRooms.length > 0
      ? [...savedRooms, ...missingDefaults]
      : current.rooms;

    // Merge team templates
    const teamTemplates = saved.teamTemplates ?? current.teamTemplates;

    // If no saved avatars key at all (first ever load), use defaults
    if (!saved.avatars) {
      return { ...current, tripoApiKey, appearances, rooms, workspaceProjects, activeProjectId, teamTemplates };
    }

    // Build map of default avatars for merging
    const defaultMap = new Map(current.avatars.map((a) => [a.id, a]));

    // Build a map from characterId → current modelUrl for migration
    const catalogModelUrls = new Map(CHARACTER_CATALOG.map((c) => [c.id, c.modelUrl]));

    // Restore saved avatars (empty array = user deleted them all, respect that)
    const avatars: AvatarData[] = saved.avatars.map((s) => {
      const base = defaultMap.get(s.id);
      // Migrate modelUrl: if avatar has a characterId, always use the catalog's current URL
      const catalogUrl = s.characterId ? catalogModelUrls.get(s.characterId) : undefined;
      const modelUrl = catalogUrl ?? (s.modelUrl || base?.modelUrl || "");
      return {
        id: s.id,
        name: s.name,
        role: s.role,
        provider: s.provider,
        color: s.color,
        modelUrl,
        activeClip: s.activeClip || "Happy Idle",
        status: "idle" as const,
        currentAction: null,
        history: [],
        position: s.position,
        roomId: s.roomId,
        apiKey: s.apiKey ?? "",
        projectId: s.projectId ?? "project-1",
        characterId: s.characterId ?? "",
        systemPrompt: s.systemPrompt ?? "",
        skillIds: s.skillIds ?? [],
        level: s.level ?? 0,
      };
    });

    return { ...current, tripoApiKey, appearances, rooms, avatars, workspaceProjects, activeProjectId, teamTemplates };
  },
}));
