import { create } from "zustand";
import type {
  SystemStatus,
  TokenGaugeData,
  ActivityEntry,
  ProjectData,
  CommandHistoryEntry,
  AvatarData,
  AvatarStatus,
} from "@/types";
import { mockGauges, mockActivities, mockProjects } from "@/types/mock-data";
import { mockAvatars } from "@/types/mock-avatars";
import { generateId } from "@/lib/utils";

interface AuriaStore {
  // System
  systemStatus: SystemStatus;
  setSystemStatus: (status: SystemStatus) => void;

  // Token gauges
  gauges: TokenGaugeData[];
  updateGauge: (provider: string, used: number) => void;

  // Activity stream
  activities: ActivityEntry[];
  addActivity: (
    entry: Omit<ActivityEntry, "id" | "timestamp">,
  ) => void;

  // Command history
  commandHistory: CommandHistoryEntry[];
  addCommand: (command: string) => void;

  // Projects
  projects: ProjectData[];

  // Avatars
  avatars: AvatarData[];
  selectedAvatarId: string | null;
  selectAvatar: (id: string | null) => void;
  assignAction: (avatarId: string, prompt: string) => void;
  completeAction: (avatarId: string, result: string) => void;
  failAction: (avatarId: string, error: string) => void;
  setAvatarStatus: (avatarId: string, status: AvatarStatus) => void;
}

export const useStore = create<AuriaStore>((set) => ({
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

  // ── Avatar slice ────────────────────────────────────────────
  avatars: mockAvatars,
  selectedAvatarId: null,

  selectAvatar: (id) => set({ selectedAvatarId: id }),

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
}));
