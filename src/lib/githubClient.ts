// ── GitHub REST API Client ──────────────────────────────────

const GH_API = "https://api.github.com";

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

// ── Types ────────────────────────────────────────────────────

export interface GHUser {
  login: string;
  avatar_url: string;
  name: string | null;
  public_repos: number;
}

export interface GHRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  open_issues_count: number;
  fork: boolean;
  private: boolean;
  updated_at: string;
  owner: { login: string; avatar_url: string };
}

export interface GHIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  html_url: string;
  labels: { name: string; color: string }[];
  assignee: { login: string; avatar_url: string } | null;
  created_at: string;
  updated_at: string;
  user: { login: string; avatar_url: string };
}

export interface GHPullRequest {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  html_url: string;
  draft: boolean;
  created_at: string;
  updated_at: string;
  user: { login: string; avatar_url: string };
  requested_reviewers: { login: string }[];
  head: { ref: string };
  base: { ref: string };
}

export interface GHCommit {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
  html_url: string;
  author: { login: string; avatar_url: string } | null;
}

// ── Fetch helpers ────────────────────────────────────────────

async function ghFetch<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${GH_API}${path}`, {
    ...init,
    headers: { ...headers(token), ...init?.headers },
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export function fetchGHUser(token: string): Promise<GHUser> {
  return ghFetch(token, "/user");
}

export function fetchGHRepos(
  token: string,
  opts?: { sort?: string; per_page?: number },
): Promise<GHRepo[]> {
  const params = new URLSearchParams({
    sort: opts?.sort ?? "updated",
    per_page: String(opts?.per_page ?? 30),
  });
  return ghFetch(token, `/user/repos?${params}`);
}

export function fetchGHIssues(
  token: string,
  owner: string,
  repo: string,
  opts?: { state?: string; per_page?: number },
): Promise<GHIssue[]> {
  const params = new URLSearchParams({
    state: opts?.state ?? "open",
    per_page: String(opts?.per_page ?? 30),
  });
  return ghFetch(token, `/repos/${owner}/${repo}/issues?${params}`);
}

export function fetchGHPullRequests(
  token: string,
  owner: string,
  repo: string,
  opts?: { state?: string; per_page?: number },
): Promise<GHPullRequest[]> {
  const params = new URLSearchParams({
    state: opts?.state ?? "open",
    per_page: String(opts?.per_page ?? 30),
  });
  return ghFetch(token, `/repos/${owner}/${repo}/pulls?${params}`);
}

export function fetchGHCommits(
  token: string,
  owner: string,
  repo: string,
  opts?: { per_page?: number },
): Promise<GHCommit[]> {
  const params = new URLSearchParams({
    per_page: String(opts?.per_page ?? 20),
  });
  return ghFetch(token, `/repos/${owner}/${repo}/commits?${params}`);
}

export function createGHIssue(
  token: string,
  owner: string,
  repo: string,
  data: { title: string; body?: string; labels?: string[] },
): Promise<GHIssue> {
  return ghFetch(token, `/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function createGHIssueComment(
  token: string,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string,
): Promise<{ id: number; body: string }> {
  return ghFetch(token, `/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
}

export function isGithubConfigured(keys: Record<string, string>): boolean {
  return !!keys.github;
}
