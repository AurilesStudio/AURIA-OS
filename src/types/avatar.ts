// ── Avatar Types ──────────────────────────────────────────────

export type AvatarRole = string;
export type AvatarStatus = "idle" | "working" | "success" | "error";

export type LLMProvider = "auria" | "claude" | "gemini" | "mistral";

export const ROLE_SUGGESTIONS: string[] = [
  "CEO / Visionnaire",
  "Directeur Juridique",
  "Directeur Artistique",
  "CTO / Lead Dev",
  "DevOps Engineer",
  "Directeur Marketing",
  "CFO / Finance",
  "Data Analyst",
  "Ops Manager",
];

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
  characterId: string;
  systemPrompt: string;
  skillIds: string[];
  level: number;
}

// ── Character Catalog ────────────────────────────────────────

export interface CharacterEntry {
  id: string;
  name: string;
  modelUrl: string;
  color: string;
  rotationY?: number;
}

export const CHARACTER_CATALOG: CharacterEntry[] = [
  { id: "goku",   name: "Goku",   modelUrl: "/models/goku.glb",   color: "#ff3c3c", rotationY: -Math.PI / 2 },
  { id: "vegeta", name: "Vegeta", modelUrl: "/models/vegeta.glb", color: "#3c5eff", rotationY: -Math.PI / 2 },
  { id: "gohan",  name: "Gohan",  modelUrl: "/models/Gohan.glb",        color: "#f5a623", rotationY: -Math.PI / 2 },
  { id: "piccolo", name: "Piccolo", modelUrl: "/models/piccolo.glb",   color: "#2ecc71", rotationY: -Math.PI / 2 },
  { id: "gogeta",  name: "Gogeta",  modelUrl: "/models/gogeta.glb",    color: "#e056fd", rotationY: -Math.PI / 2 },
  { id: "vegeto",  name: "Vegeto",  modelUrl: "/models/vegeto.glb",    color: "#ff6b35", rotationY: -Math.PI / 2 },
  { id: "trunks",  name: "Trunks",  modelUrl: "/models/trunks.glb",    color: "#9b59b6", rotationY: -Math.PI / 2 },
  { id: "broly",      name: "Broly",      modelUrl: "/models/broly.glb",      color: "#27ae60", rotationY: -Math.PI / 2 },
  { id: "black-goku", name: "Black Goku", modelUrl: "/models/black goku.glb", color: "#1a1a2e", rotationY: -Math.PI / 2 },
  // Additional entries when user uploads GLBs
];

// ── Team Types ───────────────────────────────────────────────

export interface TeamSlot {
  roomId: string;
  characterId: string;
  provider: LLMProvider;
  roleTitle: string;
  systemPrompt: string;
  avatarName?: string;
  color?: string;
}

export interface TeamTemplate {
  id: string;
  name: string;
  slots: TeamSlot[];
  createdAt: number;
  updatedAt: number;
}

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
  "#ffffff",
  "#ffff00",
  "#00ff00",
  "#0080ff",
  "#ff0000",
  "#ff8c00",
  "#8b00ff",
  "#00ffff",
  "#f15bb5",
] as const;

/** Spacing between rooms on the grid (center-to-center) */
export const ROOM_SPACING_X = 13;
export const ROOM_SPACING_Z = 11;

// ── Mapping Constants ─────────────────────────────────────────

export const AVATAR_PROVIDER_LABELS: Record<LLMProvider, string> = {
  auria: "AURIA (System)",
  claude: "Claude (Anthropic)",
  gemini: "Gemini (Google)",
  mistral: "Mistral AI",
};

// ── Project Types ─────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
}
