// ── Avatar Types ──────────────────────────────────────────────

export type AvatarRole = "dev" | "designer" | "pm";
export type AvatarStatus = "idle" | "working" | "success" | "error";

export type LLMProvider = "claude" | "gemini" | "mistral";

export interface AvatarAction {
  id: string;
  prompt: string;
  result?: string;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface AvatarData {
  id: string;
  name: string;
  role: AvatarRole;
  provider: LLMProvider;
  color: string;
  modelUrl: string;
  status: AvatarStatus;
  currentAction: AvatarAction | null;
  history: AvatarAction[];
  position: [x: number, y: number, z: number];
  roomId: string;
}

// ── Room Types ───────────────────────────────────────────────

export interface RoomData {
  id: string;
  label: string;
  position: [x: number, y: number, z: number];
  borderColor: string;
}

/** All rooms share the same footprint */
export const ROOM_SIZE = { width: 10, depth: 8 } as const;
export const ROOM_FLOOR_COLOR = "#0a0608";
export const ROOM_FLOOR_OPACITY = 0.6;

/** Palette cycled when creating new rooms */
export const ROOM_BORDER_COLORS = [
  "#ff3c3c",
  "#3caaff",
  "#ff2d7a",
  "#a855f7",
  "#22d3ee",
  "#facc15",
] as const;

/** Spacing between rooms on the grid (center-to-center) */
export const ROOM_SPACING_X = 13;
export const ROOM_SPACING_Z = 11;

// ── Mapping Constants ─────────────────────────────────────────

export const AVATAR_ROLE_LABELS: Record<AvatarRole, string> = {
  dev: "Dev Agent",
  designer: "Designer Agent",
  pm: "PM Agent",
};

export const AVATAR_PROVIDER_LABELS: Record<LLMProvider, string> = {
  claude: "Claude (Anthropic)",
  gemini: "Gemini (Google)",
  mistral: "Mistral",
};

export const AVATAR_COLORS: Record<AvatarRole, string> = {
  dev: "#bf00ff",
  designer: "#ff003c",
  pm: "#ff2d7a",
};
