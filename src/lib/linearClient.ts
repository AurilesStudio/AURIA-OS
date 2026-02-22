import type { MCTaskStatus, MCTaskPriority } from "@/types/mission-control";
import { useStore } from "@/store/useStore";

const LINEAR_API = "https://api.linear.app/graphql";

function getApiKey(): string {
  const storeKey = useStore.getState().integrationKeys.linear;
  if (storeKey) return storeKey;
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

export interface LinearProject {
  id: string;
  name: string;
  description: string;
  state: string;
  progress: number;
  startDate: string | null;
  targetDate: string | null;
  teams: { nodes: { id: string; name: string }[] };
}

export interface LinearCycle {
  id: string;
  number: number;
  name: string | null;
  startsAt: string;
  endsAt: string;
  progress: number;
  completedScopeCount: number;
  scopeCount: number;
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

// ── Projects & Cycles ────────────────────────────────────────

const PROJECTS_QUERY = `
  query {
    projects(first: 50) {
      nodes {
        id name description state progress
        startDate targetDate
        teams { nodes { id name } }
      }
    }
  }
`;

const CYCLES_QUERY = `
  query Cycles($teamId: String!) {
    team(id: $teamId) {
      cycles(first: 20, orderBy: createdAt) {
        nodes {
          id number name startsAt endsAt
          progress completedScopeCount scopeCount
        }
      }
    }
  }
`;

const CREATE_ISSUE_MUTATION = `
  mutation CreateIssue($input: IssueCreateInput!) {
    issueCreate(input: $input) {
      issue { id identifier title }
    }
  }
`;

const UPDATE_ISSUE_MUTATION = `
  mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
    issueUpdate(id: $id, input: $input) {
      issue { id identifier title }
    }
  }
`;

export async function fetchLinearProjects(): Promise<LinearProject[]> {
  const res = await gql(PROJECTS_QUERY);
  return res.projects.nodes;
}

export async function fetchLinearCycles(teamId: string): Promise<LinearCycle[]> {
  const res = await gql(CYCLES_QUERY, { teamId });
  return res.team.cycles.nodes;
}

export async function createLinearIssue(input: {
  title: string;
  description?: string;
  teamId: string;
  priority?: number;
  stateId?: string;
}): Promise<{ id: string; identifier: string; title: string }> {
  const res = await gql(CREATE_ISSUE_MUTATION, { input });
  return res.issueCreate.issue;
}

export async function updateLinearIssue(
  id: string,
  input: { title?: string; description?: string; priority?: number; stateId?: string },
): Promise<{ id: string; identifier: string; title: string }> {
  const res = await gql(UPDATE_ISSUE_MUTATION, { id, input });
  return res.issueUpdate.issue;
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
