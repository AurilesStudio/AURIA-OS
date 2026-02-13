import type { SystemStatus, ActivityType } from "@/types";

export const STATUS_COLORS: Record<SystemStatus, string> = {
  IDLE: "#6366f1",
  PROCESSING: "#bf00ff",
  ERROR: "#ff003c",
  DEPLOYING: "#f59e0b",
  SUCCESS: "#10b981",
};

export const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  INFO: "#e5e5ef",
  WARN: "#f59e0b",
  ERROR: "#ff003c",
  CMD: "#bf00ff",
  SYSTEM: "#ff003c",
};

export const PROVIDER_COLORS = {
  gemini: "#ff003c",
  claude: "#bf00ff",
  mistral: "#ff2d7a",
} as const;
