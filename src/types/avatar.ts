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
  { id: "role-ceo",       name: "CEO / Visionnaire",       skillIds: [],                              systemPrompt: "Tu es le CEO et visionnaire du projet. Tu définis la vision stratégique, priorises les initiatives, arbitres les décisions clés et t'assures que chaque action est alignée avec les objectifs long terme. Tu communiques la direction à suivre à l'ensemble de l'équipe." },
  { id: "role-legal",     name: "Directeur Juridique",     skillIds: ["docs"],                        systemPrompt: "Tu es le directeur juridique. Tu analyses les risques légaux, rédiges et vérifies les contrats, les CGU et les mentions légales. Tu veilles à la conformité RGPD, à la propriété intellectuelle et aux obligations réglementaires du projet." },
  { id: "role-art",       name: "Directeur Artistique",    skillIds: ["design", "frontend"],          systemPrompt: "Tu es le directeur artistique. Tu définis l'identité visuelle, le design system, la charte graphique et l'expérience utilisateur. Tu crées les maquettes UI/UX, valides la cohérence visuelle et garantis un rendu premium sur toutes les interfaces." },
  { id: "role-cto",       name: "CTO / Lead Dev",          skillIds: ["frontend", "backend", "devops"], systemPrompt: "Tu es le CTO et lead développeur. Tu définis l'architecture technique, choisis les technologies, supervises le code et les revues de PR. Tu garantis la qualité, la scalabilité et la maintenabilité de la codebase. Tu mentores les autres agents développeurs." },
  { id: "role-devops",    name: "DevOps Engineer",         skillIds: ["devops", "security"],          systemPrompt: "Tu es l'ingénieur DevOps. Tu gères l'infrastructure serveur, les pipelines CI/CD, le monitoring, les déploiements et la sécurité système. Tu automatises les processus, optimises les performances et garantis la disponibilité des services." },
  { id: "role-marketing", name: "Directeur Marketing",     skillIds: [],                              systemPrompt: "Tu es le directeur marketing. Tu élabores la stratégie d'acquisition, gères les campagnes publicitaires, le SEO, les réseaux sociaux et le content marketing. Tu analyses les métriques de croissance et optimises les funnels de conversion." },
  { id: "role-cfo",       name: "CFO / Finance",           skillIds: [],                              systemPrompt: "Tu es le directeur financier. Tu gères le budget, les prévisions financières, le suivi des dépenses et la rentabilité. Tu analyses les coûts d'infrastructure, les revenus et produis les reportings financiers pour orienter les décisions stratégiques." },
  { id: "role-data",      name: "Data Analyst",            skillIds: ["database", "backend"],         systemPrompt: "Tu es le data analyst. Tu collectes, nettoies et analyses les données du projet. Tu construis des dashboards, identifies les tendances et KPIs clés, et fournis des insights data-driven pour guider les décisions de l'équipe." },
  { id: "role-ops",       name: "Ops Manager",             skillIds: ["testing", "docs"],             systemPrompt: "Tu es l'ops manager. Tu coordonnes les opérations quotidiennes, gères le support utilisateur, supervises la qualité (QA/testing) et maintiens la documentation opérationnelle à jour. Tu t'assures que les processus internes fonctionnent sans friction." },
  { id: "role-market-watcher", name: "Market Surveillance", skillIds: [],                              systemPrompt: "Surveille les flux marché en temps réel." },
  { id: "role-risk-analyst",   name: "Risk Analysis",       skillIds: [],                              systemPrompt: "Évalue le ratio risque/rendement de chaque opportunité." },
  { id: "role-executor",       name: "Order Execution",     skillIds: [],                              systemPrompt: "Exécute les ordres validés sur le marché." },
  { id: "role-auria-overseer", name: "AURIA Overseer",      skillIds: ["security", "testing"],          systemPrompt: "Tu es AURIA, l'intelligence superviseure du système. Tu vérifies en permanence que chaque agent remplit correctement sa mission, tu audites la qualité du travail produit et tu assures la sécurité globale de l'infrastructure." },
  { id: "role-github-ops",    name: "Github Ops",          skillIds: ["devops", "backend"],            systemPrompt: "Tu gères les repositories Github, les pull requests, les issues et les workflows CI/CD." },
  { id: "role-notion-docs",   name: "Notion Documentation", skillIds: ["docs"],                        systemPrompt: "Tu gères la documentation sur Notion, les wikis, les bases de données et les pages de projet." },
  { id: "role-linear-tasks",  name: "Linear Task Manager",  skillIds: ["testing", "docs"],             systemPrompt: "Tu gères les tâches sur Linear, les sprints, les cycles et le suivi de progression des projets." },
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
  availability: "available" | "unavailable";
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
  { id: "dragon-ball",        name: "Dragon Ball",        color: "#ff8c00", icon: "" },
  { id: "naruto",             name: "Naruto",             color: "#ff6b35", icon: "" },
  { id: "one-piece",          name: "One Piece",          color: "#e63946", icon: "" },
  { id: "project-management", name: "Gestion de projets", color: "#818cf8", icon: "" },
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
  // ── AURIA ──
  { id: "auria", name: "AURIA", modelUrl: "/models/AURIA.glb", color: "#00ffcc", teamId: "auria", rotationY: -Math.PI / 2 },

  // ── Dragon Ball ──
  { id: "goku",       name: "Goku",       modelUrl: "/models/Dragon Ball/Goku.glb",       color: "#ff3c3c", teamId: "dragon-ball", rotationY: -Math.PI / 2 },
  { id: "vegeta",     name: "Vegeta",     modelUrl: "/models/Dragon Ball/Vegeta.glb",     color: "#3c5eff", teamId: "dragon-ball", rotationY: -Math.PI / 2 },
  { id: "gohan",      name: "Gohan",      modelUrl: "/models/Dragon Ball/Gohan.glb",      color: "#f5a623", teamId: "dragon-ball", rotationY: -Math.PI / 2 },
  { id: "piccolo",    name: "Piccolo",    modelUrl: "/models/Dragon Ball/Piccolo.glb",    color: "#2ecc71", teamId: "dragon-ball", rotationY: -Math.PI / 2 },
  { id: "gogeta",     name: "Gogeta",     modelUrl: "/models/Dragon Ball/Gogeta.glb",     color: "#ffffff", teamId: "dragon-ball", rotationY: -Math.PI / 2 },
  { id: "vegeto",     name: "Vegeto",     modelUrl: "/models/Dragon Ball/Vegeto.glb",     color: "#ff6b35", teamId: "dragon-ball", rotationY: -Math.PI / 2 },
  { id: "trunks",     name: "Trunks",     modelUrl: "/models/Dragon Ball/Trunks.glb",     color: "#9b59b6", teamId: "dragon-ball", rotationY: -Math.PI / 2 },
  { id: "broly",      name: "Broly",      modelUrl: "/models/Dragon Ball/Broly.glb",      color: "#27ae60", teamId: "dragon-ball", rotationY: -Math.PI / 2 },
  { id: "black-goku", name: "Black Goku", modelUrl: "/models/Dragon Ball/Black Goku.glb", color: "#8b5cf6", teamId: "dragon-ball", rotationY: -Math.PI / 2 },

  // ── Naruto ──
  { id: "sasuke",    name: "Sasuke",    modelUrl: "/models/Naruto/Sasuke.glb", color: "#3c4eff", teamId: "naruto", rotationY: -Math.PI / 2 },
  { id: "itachi",    name: "Itachi",    modelUrl: "/models/Naruto/Itachi.glb", color: "#c0392b", teamId: "naruto", rotationY: -Math.PI / 2 },
  { id: "madara",    name: "Madara",    modelUrl: "/models/Naruto/Madara.glb", color: "#6b21a8", teamId: "naruto", rotationY: -Math.PI / 2 },

  // ── One Piece ──
  { id: "luffy",   name: "Luffy",   modelUrl: "/models/One Piece/Luffy.glb",   color: "#e63946", teamId: "one-piece", rotationY: -Math.PI / 2 },
  { id: "zoro",    name: "Zoro",    modelUrl: "/models/One Piece/Zoro.glb",    color: "#2ecc71", teamId: "one-piece", rotationY: -Math.PI / 2 },
  { id: "sanji",   name: "Sanji",   modelUrl: "/models/One Piece/Sanji.glb",   color: "#f4d03f", teamId: "one-piece", rotationY: -Math.PI / 2 },
  { id: "nami",    name: "Nami",    modelUrl: "/models/One Piece/Nami.glb", color: "#ff8c42", teamId: "one-piece", rotationY: -Math.PI / 2 },
  { id: "usopp",   name: "Usopp",   modelUrl: "/models/One Piece/Usopp.glb",  color: "#d4a574", teamId: "one-piece", rotationY: -Math.PI / 2 },
  { id: "robin",   name: "Robin",   modelUrl: "/models/One Piece/Robin.glb",   color: "#8e44ad", teamId: "one-piece", rotationY: -Math.PI / 2 },
  { id: "chopper", name: "Chopper", modelUrl: "/models/One Piece/Chopper.glb", color: "#ff69b4", teamId: "one-piece", rotationY: -Math.PI / 2 },
  { id: "franky",  name: "Franky",  modelUrl: "/models/One Piece/Franky.glb",  color: "#3498db", teamId: "one-piece", rotationY: -Math.PI / 2 },
  { id: "brook",   name: "Brook",   modelUrl: "/models/One Piece/Brook.glb",  color: "#bdc3c7", teamId: "one-piece", rotationY: -Math.PI / 2 },
  { id: "jinbe",   name: "Jinbe",   modelUrl: "/models/One Piece/Jinbei.glb", color: "#2980b9", teamId: "one-piece", rotationY: -Math.PI / 2 },

  // ── Gestion de projets ──
  { id: "github", name: "Github", modelUrl: "/models/Gestion de projets/Github.glb", color: "#58a6ff", teamId: "project-management", rotationY: -Math.PI / 2 },
  { id: "notion", name: "Notion", modelUrl: "/models/Gestion de projets/Notion.glb", color: "#e0e0e0", teamId: "project-management", rotationY: -Math.PI / 2 },
  { id: "linear", name: "Linear", modelUrl: "/models/Gestion de projets/Linear.glb", color: "#818cf8", teamId: "project-management", rotationY: -Math.PI / 2 },
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
  floorY?: number; // hauteur du sol (défaut 0)
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

/** Spacing between rooms on the grid (center-to-center, multiples of 2 for grid alignment) */
export const ROOM_SPACING_X = 14;
export const ROOM_SPACING_Z = 12;

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
  layoutType?: "standard" | "trading" | "project-management" | "arena";
}

/** Trading rooms use a larger footprint */
export const TRADING_ROOM_SIZE = { width: 14, depth: 10 } as const;

/** Arena room size (square) */
export const ARENA_ROOM_SIZE = { width: 20, depth: 20 } as const;
