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
  AvatarRole,
} from "@/types";
import {
  ROOM_SIZE,
  ROOM_BORDER_COLORS,
  ROOM_SPACING_X,
  ROOM_SPACING_Z,
  AGENT_TEMPLATES,
} from "@/types";
import { mockGauges, mockActivities, mockProjects } from "@/types/mock-data";
import { mockAvatars } from "@/types/mock-avatars";
import { generateId } from "@/lib/utils";

// ── Default rooms ────────────────────────────────────────────
const defaultRooms: RoomData[] = [
  {
    id: "room-dev",
    label: "App Development",
    position: [0, 0, 0],
    borderColor: ROOM_BORDER_COLORS[0],
    skillIds: [],
  },
  {
    id: "room-vps",
    label: "VPS & Infra",
    position: [ROOM_SPACING_X, 0, 0],
    borderColor: ROOM_BORDER_COLORS[1],
    skillIds: [],
  },
  {
    id: "room-design",
    label: "Design Studio",
    position: [0, 0, ROOM_SPACING_Z],
    borderColor: ROOM_BORDER_COLORS[2],
    skillIds: [],
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
    const x = col * ROOM_SPACING_X;
    const z = row * ROOM_SPACING_Z;
    if (!occupied.has(`${x},${z}`)) {
      return [x, 0, z];
    }
  }
  // Fallback (should never happen)
  return [rooms.length * ROOM_SPACING_X, 0, 0];
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

  // Projects
  projects: ProjectData[];

  // AURIA Command Center
  commandCenterOpen: boolean;
  setCommandCenterOpen: (open: boolean) => void;

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

  // Avatars
  avatars: AvatarData[];
  selectedAvatarId: string | null;
  selectAvatar: (id: string | null) => void;
  addAvatar: (provider: LLMProvider) => void;
  updateAvatar: (avatarId: string, data: Partial<Pick<AvatarData, "name" | "role" | "apiKey" | "color">>) => void;
  removeAvatar: (avatarId: string) => void;
  assignAction: (avatarId: string, prompt: string) => void;
  completeAction: (avatarId: string, result: string) => void;
  failAction: (avatarId: string, error: string) => void;
  setAvatarStatus: (avatarId: string, status: AvatarStatus) => void;
  moveAvatarToRoom: (avatarId: string, roomId: string) => void;
  updateAvatarPosition: (avatarId: string, position: [number, number, number]) => void;
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

  // ── AURIA Command Center ────────────────────────────────────
  commandCenterOpen: false,
  setCommandCenterOpen: (open) => set({ commandCenterOpen: open }),

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

      return {
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

  // ── Avatar slice ──────────────────────────────────────────
  avatars: mockAvatars,
  selectedAvatarId: null,

  selectAvatar: (id) => set({ selectedAvatarId: id }),

  addAvatar: (provider) =>
    set((state) => {
      const template = AGENT_TEMPLATES.find((t) => t.provider === provider);
      if (!template) return state;
      // Count existing avatars of this provider to generate unique name
      const count = state.avatars.filter((a) => a.provider === provider).length;
      const suffix = count > 0 ? ` ${count + 1}` : "";
      // Place in the first room
      const room = state.rooms[0];
      if (!room) return state;
      const ox = (Math.random() - 0.5) * (ROOM_SIZE.width * 0.4);
      const oz = (Math.random() - 0.5) * (ROOM_SIZE.depth * 0.4);
      const avatar: AvatarData = {
        id: `avatar-${generateId()}`,
        name: `${template.defaultName}${suffix}`,
        role: template.defaultRole,
        provider: template.provider,
        color: template.color,
        modelUrl: "",
        status: "idle",
        currentAction: null,
        history: [],
        position: [room.position[0] + ox, 0, room.position[2] + oz],
        roomId: room.id,
        apiKey: "",
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
          a.id === avatarId ? { ...a, roomId, position } : a,
        ),
      };
    }),

  updateAvatarPosition: (avatarId, position) =>
    set((state) => ({
      avatars: state.avatars.map((a) =>
        a.id === avatarId ? { ...a, position } : a,
      ),
    })),
}), {
  name: "auria-store",
  partialize: (state) => ({
    rooms: state.rooms,
    avatars: state.avatars.map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      provider: a.provider,
      color: a.color,
      roomId: a.roomId,
      position: a.position,
      apiKey: a.apiKey,
    })),
  }),
  merge: (persisted, current) => {
    type SavedAvatar = {
      id: string; name: string; role: AvatarRole; provider: LLMProvider;
      color: string; roomId: string; position: [number, number, number]; apiKey: string;
    };
    const saved = persisted as {
      rooms?: RoomData[];
      avatars?: SavedAvatar[];
    } | undefined;
    if (!saved) return current;

    const rooms = saved.rooms && saved.rooms.length > 0
      ? saved.rooms.map((r) => ({ ...r, skillIds: r.skillIds ?? [] }))
      : current.rooms;

    if (!saved.avatars || saved.avatars.length === 0) {
      return { ...current, rooms };
    }

    // Build map of default avatars for merging
    const defaultMap = new Map(current.avatars.map((a) => [a.id, a]));

    // Restore avatars: merge saved fields into defaults when available,
    // or create full avatars for dynamically-added agents
    const avatars: AvatarData[] = saved.avatars.map((s) => {
      const base = defaultMap.get(s.id);
      return {
        id: s.id,
        name: s.name,
        role: s.role,
        provider: s.provider,
        color: s.color,
        modelUrl: base?.modelUrl ?? "",
        status: "idle" as const,
        currentAction: null,
        history: [],
        position: s.position,
        roomId: s.roomId,
        apiKey: s.apiKey ?? "",
      };
    });

    return { ...current, rooms, avatars };
  },
}));
