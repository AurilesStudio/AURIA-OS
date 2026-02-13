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

export type GaugeProvider = "gemini" | "claude" | "mistral";

export interface TokenGaugeData {
  provider: GaugeProvider;
  label: string;
  used: number;
  limit: number;
  color: string;
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
} from "./avatar";

export {
  AVATAR_ROLE_LABELS,
  AVATAR_PROVIDER_LABELS,
  AVATAR_COLORS,
  ROOM_SIZE,
  ROOM_FLOOR_COLOR,
  ROOM_FLOOR_OPACITY,
  ROOM_BORDER_COLORS,
  ROOM_SPACING_X,
  ROOM_SPACING_Z,
} from "./avatar";
