export type SystemStatus =
  | "IDLE"
  | "PROCESSING"
  | "ERROR"
  | "DEPLOYING"
  | "SUCCESS";

export type ActivityType = "INFO" | "WARN" | "ERROR" | "CMD" | "SYSTEM";

export type ProjectStatus =
  | "In Progress"
  | "Planned"
  | "Backlog"
  | "Done"
  | "Cancelled";

export type GaugeProvider = "gemini" | "claude" | "mistral" | "local";

export interface TokenGaugeData {
  provider: GaugeProvider;
  label: string;
  used: number;
  limit: number;
  color: string;
  cost: number;
}

export interface ActivityEntry {
  id: string;
  timestamp: Date;
  type: ActivityType;
  message: string;
  source?: string;
}

export interface ProjectData {
  id: string;
  name: string;
  slug: string;
  status: ProjectStatus;
  description: string;
  progress: number;
  team: string;
}

export interface CommandHistoryEntry {
  id: string;
  command: string;
  timestamp: Date;
}

// Avatar types
export type {
  AvatarRole,
  AvatarStatus,
  LLMProvider,
  AvatarAction,
  AvatarData,
  RoomData,
  CharacterEntry,
  CharacterTeam,
  TeamSlot,
  TeamTemplate,
  SkillData,
  Project,
  RoleDefinition,
} from "./avatar";

export {
  CHARACTER_CATALOG,
  CHARACTER_TEAMS,
  DEFAULT_ROLES,
  AVATAR_PROVIDER_LABELS,
  SKILLS,
  ROOM_SIZE,
  ROOM_FLOOR_COLOR,
  ROOM_FLOOR_OPACITY,
  ROOM_BORDER_COLORS,
  ROOM_SPACING_X,
  ROOM_SPACING_Z,
  getAvatarSkills,
  getAvatarSystemPrompt,
} from "./avatar";

export type { AppearanceEntry } from "./appearance";
