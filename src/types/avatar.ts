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
}

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
