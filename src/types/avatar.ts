// ── Avatar Types ──────────────────────────────────────────────

export type AvatarRole = string;
export type AvatarStatus = "idle" | "working" | "success" | "error";

export type LLMProvider = "auria" | "claude" | "gemini" | "mistral" | "local";

export interface RoleDefinition {
  id: string;
  name: string;
  skillIds: string[];
  systemPrompt: string;
}

export const DEFAULT_ROLES: RoleDefinition[] = [
  { id: "role-ceo",       name: "CEO / Visionnaire",       skillIds: [],                              systemPrompt: "" },
  { id: "role-legal",     name: "Directeur Juridique",     skillIds: ["docs"],                        systemPrompt: "" },
  { id: "role-art",       name: "Directeur Artistique",    skillIds: ["design", "frontend"],          systemPrompt: "" },
  { id: "role-cto",       name: "CTO / Lead Dev",          skillIds: ["frontend", "backend", "devops"], systemPrompt: "" },
  { id: "role-devops",    name: "DevOps Engineer",         skillIds: ["devops", "security"],          systemPrompt: "" },
  { id: "role-marketing", name: "Directeur Marketing",     skillIds: [],                              systemPrompt: "" },
  { id: "role-cfo",       name: "CFO / Finance",           skillIds: [],                              systemPrompt: "" },
  { id: "role-data",      name: "Data Analyst",            skillIds: ["database", "backend"],         systemPrompt: "" },
  { id: "role-ops",       name: "Ops Manager",             skillIds: ["testing", "docs"],             systemPrompt: "" },
  { id: "role-market-watcher", name: "Market Surveillance", skillIds: [],                              systemPrompt: "Surveille les flux marché en temps réel." },
  { id: "role-risk-analyst",   name: "Risk Analysis",       skillIds: [],                              systemPrompt: "Évalue le ratio risque/rendement de chaque opportunité." },
  { id: "role-executor",       name: "Order Execution",     skillIds: [],                              systemPrompt: "Exécute les ordres validés sur le marché." },
];

export interface AvatarAction {
  id: string;
  prompt: string;
  result?: string;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  tokenUsage?: { inputTokens: number; outputTokens: number; cost: number };
}

export interface AvatarData {
  id: string;
  name: string;
  roleId: string;
  provider: LLMProvider;
  color: string;
  modelUrl: string;
  activeClip: string;
  status: AvatarStatus;
  currentAction: AvatarAction | null;
  history: AvatarAction[];
  position: [x: number, y: number, z: number];
  roomId: string;
  projectId: string;
  characterId: string;
  level: number;
}

// ── Role Helpers ────────────────────────────────────────────

export function getAvatarSkills(avatar: AvatarData, roles: RoleDefinition[]): string[] {
  const role = roles.find((r) => r.id === avatar.roleId);
  return role?.skillIds ?? [];
}

export function getAvatarSystemPrompt(avatar: AvatarData, roles: RoleDefinition[]): string {
  const role = roles.find((r) => r.id === avatar.roleId);
  return role?.systemPrompt ?? "";
}

// ── Character Teams ──────────────────────────────────────────

export interface CharacterTeam {
  id: string;
  name: string;
  color: string;
  icon: string;  // emoji or short label
}

export const CHARACTER_TEAMS: CharacterTeam[] = [
  { id: "dragon-ball", name: "Dragon Ball", color: "#ff8c00", icon: "" },
  { id: "naruto",      name: "Naruto",      color: "#ff6b35", icon: "" },
  { id: "one-piece",   name: "One Piece",   color: "#e63946", icon: "" },
];

// ── Character Catalog ────────────────────────────────────────

export interface CharacterEntry {
  id: string;
  name: string;
  modelUrl: string;
  color: string;
  teamId: string;
  rotationY?: number;
}

export const CHARACTER_CATALOG: CharacterEntry[] = [
  // ── Dragon Ball ──
  { id: "goku",       name: "Goku",       modelUrl: "/models/goku.glb",       color: "#ff3c3c", teamId: "dragon-ball", rotationY: -Math.PI / 2 },
  { id: "vegeta",     name: "Vegeta",     modelUrl: "/models/vegeta.glb",     color: "#3c5eff", teamId: "dragon-ball", rotationY: -Math.PI / 2 },
  { id: "gohan",      name: "Gohan",      modelUrl: "/models/Gohan.glb",      color: "#f5a623", teamId: "dragon-ball", rotationY: -Math.PI / 2 },
  { id: "piccolo",    name: "Piccolo",    modelUrl: "/models/piccolo.glb",    color: "#2ecc71", teamId: "dragon-ball", rotationY: -Math.PI / 2 },
  { id: "gogeta",     name: "Gogeta",     modelUrl: "/models/gogeta.glb",     color: "#ffffff", teamId: "dragon-ball", rotationY: -Math.PI / 2 },
  { id: "vegeto",     name: "Vegeto",     modelUrl: "/models/vegeto.glb",     color: "#ff6b35", teamId: "dragon-ball", rotationY: -Math.PI / 2 },
  { id: "trunks",     name: "Trunks",     modelUrl: "/models/trunks.glb",     color: "#9b59b6", teamId: "dragon-ball", rotationY: -Math.PI / 2 },
  { id: "broly",      name: "Broly",      modelUrl: "/models/broly.glb",      color: "#27ae60", teamId: "dragon-ball", rotationY: -Math.PI / 2 },
  { id: "black-goku", name: "Black Goku", modelUrl: "/models/black goku.glb", color: "#8b5cf6", teamId: "dragon-ball", rotationY: -Math.PI / 2 },

  // ── Naruto ──
  { id: "naruto",    name: "Naruto",    modelUrl: "", color: "#ff9a3c", teamId: "naruto" },
  { id: "sasuke",    name: "Sasuke",    modelUrl: "/models/sasuke.glb", color: "#3c4eff", teamId: "naruto", rotationY: -Math.PI / 2 },
  { id: "kakashi",   name: "Kakashi",   modelUrl: "", color: "#8e99a4", teamId: "naruto" },
  { id: "sakura",    name: "Sakura",    modelUrl: "", color: "#ff69b4", teamId: "naruto" },
  { id: "itachi",    name: "Itachi",    modelUrl: "/models/itachi.glb", color: "#c0392b", teamId: "naruto", rotationY: -Math.PI / 2 },
  { id: "gaara",     name: "Gaara",     modelUrl: "", color: "#d35400", teamId: "naruto" },
  { id: "shikamaru", name: "Shikamaru", modelUrl: "", color: "#5d6d7e", teamId: "naruto" },
  { id: "jiraiya",   name: "Jiraiya",   modelUrl: "", color: "#e74c3c", teamId: "naruto" },
  { id: "tsunade",   name: "Tsunade",   modelUrl: "", color: "#f1c40f", teamId: "naruto" },
  { id: "madara",    name: "Madara",    modelUrl: "/models/Madara.glb", color: "#6b21a8", teamId: "naruto", rotationY: -Math.PI / 2 },

  // ── One Piece ──
  { id: "luffy",   name: "Luffy",   modelUrl: "/models/luffy.glb", color: "#e63946", teamId: "one-piece", rotationY: -Math.PI / 2 },
  { id: "zoro",    name: "Zoro",    modelUrl: "/models/zoro.glb", color: "#2ecc71", teamId: "one-piece", rotationY: -Math.PI / 2 },
  { id: "sanji",   name: "Sanji",   modelUrl: "/models/sanji.glb", color: "#f4d03f", teamId: "one-piece", rotationY: -Math.PI / 2 },
  { id: "nami",    name: "Nami",    modelUrl: "", color: "#ff8c42", teamId: "one-piece" },
  { id: "robin",   name: "Robin",   modelUrl: "", color: "#8e44ad", teamId: "one-piece" },
  { id: "chopper", name: "Chopper", modelUrl: "", color: "#ff69b4", teamId: "one-piece" },
  { id: "franky",  name: "Franky",  modelUrl: "/models/franky.glb", color: "#3498db", teamId: "one-piece", rotationY: -Math.PI / 2 },
  { id: "brook",   name: "Brook",   modelUrl: "", color: "#bdc3c7", teamId: "one-piece" },
  { id: "jinbe",   name: "Jinbe",   modelUrl: "", color: "#2980b9", teamId: "one-piece" },
];

// ── Team Types ───────────────────────────────────────────────

export interface TeamSlot {
  roomId: string;
  characterId: string;
  provider: LLMProvider;
  roleId: string;
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
  local: "Local (Ollama)",
};

// ── Project Types ─────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  layoutType?: "standard" | "trading";
}

/** Trading rooms use a larger footprint */
export const TRADING_ROOM_SIZE = { width: 14, depth: 10 } as const;
