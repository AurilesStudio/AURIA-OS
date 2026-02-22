// ── Mission Control Types ─────────────────────────────────────

/** Top-level navigation modules */
export type MCModule = "office" | "tasks" | "content" | "calendar" | "memory" | "team" | "monitoring" | "github" | "linear" | "notion";

/** Task status workflow: backlog → todo → in_progress → done | cancelled */
export type MCTaskStatus = "backlog" | "todo" | "in_progress" | "done" | "cancelled";
export type MCTaskPriority = "none" | "low" | "medium" | "high" | "urgent";

export interface MCTask {
  id: string;
  title: string;
  description: string;
  status: MCTaskStatus;
  priority: MCTaskPriority;
  assigneeId: string; // avatar id (or empty)
  labels: string[];
  projectId: string;
  createdAt: number;
  updatedAt: number;
}

/** Calendar event types */
export type MCCalendarEventType = "task" | "meeting" | "deployment" | "reminder" | "milestone";
export type MCCalendarEventStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface MCCalendarEvent {
  id: string;
  title: string;
  type: MCCalendarEventType;
  startDate: number; // epoch ms
  endDate: number;   // epoch ms
  status: MCCalendarEventStatus;
  executionResult: string;
  projectId: string;
  createdAt: number;
}

/** Content pipeline stages: idea → draft → review → scheduled → published */
export type MCContentStage = "idea" | "draft" | "review" | "scheduled" | "published";

export interface MCContentItem {
  id: string;
  title: string;
  stage: MCContentStage;
  platform: string;
  script: string;
  mediaUrls: string[];
  scheduledDate: number | null; // epoch ms or null
  projectId: string;
  createdAt: number;
}

/** Memory categories for the knowledge base */
export type MCMemoryCategory = "decision" | "learning" | "context" | "reference";

export interface MCMemory {
  id: string;
  title: string;
  content: string;
  category: MCMemoryCategory;
  source: string;
  projectId: string;
  createdAt: number;
}

/** Notification types */
export type MCNotificationType = "task" | "content" | "error" | "system";

export interface MCNotification {
  id: string;
  title: string;
  message: string;
  type: MCNotificationType;
  read: boolean;
  createdAt: number; // epoch ms
}

/** Team agent status in Mission Control context */
export type MCTeamAgentStatus = "active" | "idle" | "offline";

export interface MCTeamAgent {
  id: string;
  name: string;
  role: string;
  responsibilities: string;
  status: MCTeamAgentStatus;
  avatarUrl: string;
  taskHistory: string[]; // task ids
  projectId: string;
  createdAt: number;
  updatedAt: number;
}
