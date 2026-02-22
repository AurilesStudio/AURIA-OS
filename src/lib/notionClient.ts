// ── Notion API Client (via proxy) ───────────────────────────

const PROXY_BASE = "/api/proxy/notion";

// ── Types ────────────────────────────────────────────────────

export interface NotionPage {
  id: string;
  object: "page";
  icon: { type: string; emoji?: string } | null;
  url: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, NotionProperty>;
  parent: { type: string; database_id?: string; page_id?: string; workspace?: boolean };
}

export interface NotionProperty {
  id: string;
  type: string;
  title?: { plain_text: string }[];
  rich_text?: { plain_text: string }[];
  [key: string]: unknown;
}

export interface NotionDatabase {
  id: string;
  object: "database";
  title: { plain_text: string }[];
  icon: { type: string; emoji?: string } | null;
  url: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, { id: string; type: string; name: string }>;
}

export interface NotionSearchResult {
  results: (NotionPage | NotionDatabase)[];
  has_more: boolean;
  next_cursor: string | null;
}

export interface NotionQueryResult {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

// ── Helpers ──────────────────────────────────────────────────

function notionHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    "X-Notion-Token": token,
  };
}

async function notionFetch<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PROXY_BASE}${path}`, {
    ...init,
    headers: { ...notionHeaders(token), ...init?.headers },
  });
  if (!res.ok) throw new Error(`Notion API error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ── API Functions ────────────────────────────────────────────

export function searchNotion(
  token: string,
  query: string,
  opts?: { filter?: { property: string; value: string }; page_size?: number; start_cursor?: string },
): Promise<NotionSearchResult> {
  return notionFetch(token, "/v1/search", {
    method: "POST",
    body: JSON.stringify({
      query,
      page_size: opts?.page_size ?? 20,
      ...(opts?.filter ? { filter: { property: opts.filter.property, value: opts.filter.value } } : {}),
      ...(opts?.start_cursor ? { start_cursor: opts.start_cursor } : {}),
    }),
  });
}

export function fetchNotionPage(token: string, pageId: string): Promise<NotionPage> {
  return notionFetch(token, `/v1/pages/${pageId}`);
}

export function fetchNotionDatabase(token: string, dbId: string): Promise<NotionDatabase> {
  return notionFetch(token, `/v1/databases/${dbId}`);
}

export function queryNotionDatabase(
  token: string,
  dbId: string,
  opts?: { filter?: Record<string, unknown>; sorts?: Record<string, unknown>[]; page_size?: number; start_cursor?: string },
): Promise<NotionQueryResult> {
  return notionFetch(token, `/v1/databases/${dbId}/query`, {
    method: "POST",
    body: JSON.stringify({
      page_size: opts?.page_size ?? 50,
      ...(opts?.filter ? { filter: opts.filter } : {}),
      ...(opts?.sorts ? { sorts: opts.sorts } : {}),
      ...(opts?.start_cursor ? { start_cursor: opts.start_cursor } : {}),
    }),
  });
}

export function createNotionPage(
  token: string,
  parent: { database_id: string } | { page_id: string },
  properties: Record<string, unknown>,
): Promise<NotionPage> {
  return notionFetch(token, "/v1/pages", {
    method: "POST",
    body: JSON.stringify({ parent, properties }),
  });
}

export function isNotionConfigured(keys: Record<string, string>): boolean {
  return !!keys.notion;
}

/** Extract a human-readable title from a Notion page */
export function getNotionPageTitle(page: NotionPage): string {
  for (const prop of Object.values(page.properties)) {
    if (prop.type === "title" && prop.title?.length) {
      return prop.title.map((t) => t.plain_text).join("");
    }
  }
  return "Untitled";
}
