// ── Avatar Types ──────────────────────────────────────────────

export type AvatarRole = "dev" | "designer" | "pm";
export type AvatarStatus = "idle" | "working" | "success" | "error";

export type LLMProvider = "auria" | "claude" | "gemini" | "mistral";

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
  activeClip: string;
  status: AvatarStatus;
  currentAction: AvatarAction | null;
  history: AvatarAction[];
  position: [x: number, y: number, z: number];
  roomId: string;
  apiKey: string;
  projectId: string;
}

/** Catalog entry shown in the Recruit modal */
export interface AgentTemplate {
  provider: LLMProvider;
  label: string;
  defaultName: string;
  color: string;
  defaultRole: AvatarRole;
  defaultModelUrl: string;
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  { provider: "claude", label: "Vegeta", defaultName: "Vegeta", color: "#3c5eff", defaultRole: "dev", defaultModelUrl: "/models/vegeta_tripo.glb" },
  { provider: "gemini", label: "Gohan", defaultName: "Gohan", color: "#ff9f0a", defaultRole: "designer", defaultModelUrl: "/models/gohan_test.glb" },
  { provider: "mistral", label: "Auria", defaultName: "Auria", color: "#ff2d7a", defaultRole: "pm", defaultModelUrl: "/models/auria.glb" },
];

// ── Skill Types ──────────────────────────────────────────────

export interface SkillData {
  id: string;
  name: string;
  icon: string;   // label court ("UI", "API", "CI"...)
  color: string;
}

export const SKILLS: SkillData[] = [
  { id: "frontend",  name: "Frontend",       icon: "UI",  color: "#3caaff" },
  { id: "backend",   name: "Backend",        icon: "API", color: "#10b981" },
  { id: "devops",    name: "DevOps / CI-CD", icon: "CI",  color: "#facc15" },
  { id: "design",    name: "Design / UX",    icon: "UX",  color: "#ff2d7a" },
  { id: "database",  name: "Database",       icon: "DB",  color: "#a855f7" },
  { id: "testing",   name: "Testing / QA",   icon: "QA",  color: "#22d3ee" },
  { id: "security",  name: "Security",       icon: "SEC", color: "#ff3c3c" },
  { id: "docs",      name: "Documentation",  icon: "DOC", color: "#6b7280" },
];

// ── Room Types ───────────────────────────────────────────────

export interface RoomData {
  id: string;
  label: string;
  position: [x: number, y: number, z: number];
  borderColor: string;
  skillIds: string[];
  projectId: string;
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
  auria: "AURIA (System)",
  claude: "Vegeta",
  gemini: "Gohan",
  mistral: "Auria",
};

export const AVATAR_COLORS: Record<AvatarRole, string> = {
  dev: "#bf00ff",
  designer: "#ff003c",
  pm: "#ff2d7a",
};

// ── Project Types ─────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
}
