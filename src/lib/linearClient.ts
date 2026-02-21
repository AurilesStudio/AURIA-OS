import type { MCTaskStatus, MCTaskPriority } from "@/types/mission-control";

const LINEAR_API = "https://api.linear.app/graphql";

function getApiKey(): string {
  return import.meta.env.VITE_LINEAR_API_KEY ?? "";
}

export function isLinearConfigured(): boolean {
  return getApiKey().length > 0;
}

/** Raw shape from Linear GraphQL */
export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  priority: number; // 0=None, 1=Urgent, 2=High, 3=Normal, 4=Low
  state: { name: string; type: string };
  assignee: { name: string } | null;
  labels: { nodes: { name: string }[] };
  createdAt: string;
  updatedAt: string;
}

const ISSUES_QUERY = `
  query Issues($teamId: String, $first: Int) {
    issues(
      filter: { team: { id: { eq: $teamId } } }
      first: $first
      orderBy: updatedAt
    ) {
      nodes {
        id
        identifier
        title
        description
        priority
        state { name type }
        assignee { name }
        labels { nodes { name } }
        createdAt
        updatedAt
      }
    }
  }
`;

const TEAMS_QUERY = `
  query { teams { nodes { id name } } }
`;

export interface LinearTeam {
  id: string;
  name: string;
}

export async function fetchLinearTeams(): Promise<LinearTeam[]> {
  const res = await gql(TEAMS_QUERY);
  return res.teams.nodes;
}

export async function fetchLinearIssues(
  teamId?: string,
  first = 50,
): Promise<LinearIssue[]> {
  const res = await gql(ISSUES_QUERY, { teamId: teamId ?? null, first });
  return res.issues.nodes;
}

// ── Mapping helpers ──────────────────────────────────────────

const STATE_TYPE_MAP: Record<string, MCTaskStatus> = {
  backlog: "backlog",
  unstarted: "todo",
  started: "in_progress",
  completed: "done",
  cancelled: "cancelled",
  canceled: "cancelled",
};

export function mapLinearStatus(stateType: string): MCTaskStatus {
  return STATE_TYPE_MAP[stateType] ?? "backlog";
}

const PRIORITY_MAP: Record<number, MCTaskPriority> = {
  0: "none",
  1: "urgent",
  2: "high",
  3: "medium",
  4: "low",
};

export function mapLinearPriority(priority: number): MCTaskPriority {
  return PRIORITY_MAP[priority] ?? "none";
}

// ── GraphQL helper ───────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function gql(query: string, variables?: Record<string, unknown>): Promise<any> {
  const key = getApiKey();
  if (!key) throw new Error("Linear API key not configured");

  const res = await fetch(LINEAR_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: key,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Linear API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
}
