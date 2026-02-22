import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";

// ── Mock supabase before importing routes ────────────────────────────────────

const mockChain = () => {
  const chain: Record<string, any> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    single: vi.fn().mockResolvedValue({ data: { id: "1" }, error: null }),
  };
  // select/insert/update/delete all return chain
  for (const key of Object.keys(chain)) {
    if (typeof chain[key] === "function" && key !== "order" && key !== "single") {
      chain[key].mockReturnValue(chain);
    }
  }
  // order resolves
  chain.order.mockResolvedValue({ data: [], error: null });
  // single resolves
  chain.single.mockResolvedValue({ data: { id: "1", title: "Test" }, error: null });
  return chain;
};

let currentChain = mockChain();

vi.mock("../lib/supabase.js", () => ({
  supabase: {
    from: vi.fn(() => currentChain),
  },
}));

import health from "../routes/health.js";
import tasks from "../routes/tasks.js";
import calendar from "../routes/calendar.js";
import content from "../routes/content.js";
import memories from "../routes/memories.js";
import team from "../routes/team.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

function createApp(prefix: string, route: Hono) {
  const app = new Hono();
  app.route(prefix, route);
  return app;
}

function jsonPost(app: Hono, path: string, body: unknown) {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function jsonPatch(app: Hono, path: string, body: unknown) {
  return app.request(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Health route ─────────────────────────────────────────────────────────────

describe("GET /api/health", () => {
  it("returns status ok", async () => {
    const app = createApp("/api/health", health);
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("uptime");
  });
});

// ── Tasks routes ─────────────────────────────────────────────────────────────

describe("tasks routes", () => {
  let app: Hono;

  beforeEach(() => {
    currentChain = mockChain();
    app = createApp("/api/mc/tasks", tasks);
  });

  it("GET / returns list", async () => {
    const res = await app.request("/api/mc/tasks");
    expect(res.status).toBe(200);
  });

  it("POST / requires title", async () => {
    const res = await jsonPost(app, "/api/mc/tasks", {});
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("title is required");
  });

  it("POST / rejects invalid status", async () => {
    const res = await jsonPost(app, "/api/mc/tasks", { title: "T", status: "nope" });
    expect(res.status).toBe(400);
  });

  it("POST / rejects invalid priority", async () => {
    const res = await jsonPost(app, "/api/mc/tasks", { title: "T", priority: "nope" });
    expect(res.status).toBe(400);
  });

  it("POST / returns 201 on success", async () => {
    currentChain.single.mockResolvedValueOnce({ data: { id: "1", title: "T" }, error: null });
    const res = await jsonPost(app, "/api/mc/tasks", { title: "New task" });
    expect(res.status).toBe(201);
  });

  it("GET /:id returns a task", async () => {
    const res = await app.request("/api/mc/tasks/1");
    expect(res.status).toBe(200);
  });

  it("PATCH /:id rejects invalid status", async () => {
    const res = await jsonPatch(app, "/api/mc/tasks/1", { status: "bad" });
    expect(res.status).toBe(400);
  });

  it("DELETE /:id returns success", async () => {
    currentChain.delete.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const res = await app.request("/api/mc/tasks/1", { method: "DELETE" });
    expect(res.status).toBe(200);
  });
});

// ── Calendar routes ──────────────────────────────────────────────────────────

describe("calendar routes", () => {
  let app: Hono;

  beforeEach(() => {
    currentChain = mockChain();
    app = createApp("/api/mc/calendar", calendar);
  });

  it("GET / returns list", async () => {
    const res = await app.request("/api/mc/calendar");
    expect(res.status).toBe(200);
  });

  it("POST / requires title", async () => {
    const res = await jsonPost(app, "/api/mc/calendar", {});
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("title is required");
  });

  it("POST / requires type", async () => {
    const res = await jsonPost(app, "/api/mc/calendar", { title: "T" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("type is required");
  });

  it("POST / requires start_date and end_date", async () => {
    const res = await jsonPost(app, "/api/mc/calendar", { title: "T", type: "meeting" });
    expect(res.status).toBe(400);
  });

  it("POST / rejects invalid type", async () => {
    const res = await jsonPost(app, "/api/mc/calendar", {
      title: "T", type: "nope", start_date: 1, end_date: 2,
    });
    expect(res.status).toBe(400);
  });

  it("POST / returns 201 on success", async () => {
    currentChain.single.mockResolvedValueOnce({ data: { id: "1" }, error: null });
    const res = await jsonPost(app, "/api/mc/calendar", {
      title: "Sprint", type: "meeting", start_date: 1000, end_date: 2000,
    });
    expect(res.status).toBe(201);
  });

  it("PATCH /:id rejects invalid type", async () => {
    const res = await jsonPatch(app, "/api/mc/calendar/1", { type: "nope" });
    expect(res.status).toBe(400);
  });

  it("PATCH /:id rejects invalid status", async () => {
    const res = await jsonPatch(app, "/api/mc/calendar/1", { status: "nope" });
    expect(res.status).toBe(400);
  });
});

// ── Content routes ───────────────────────────────────────────────────────────

describe("content routes", () => {
  let app: Hono;

  beforeEach(() => {
    currentChain = mockChain();
    app = createApp("/api/mc/content", content);
  });

  it("GET / returns list", async () => {
    const res = await app.request("/api/mc/content");
    expect(res.status).toBe(200);
  });

  it("POST / requires title", async () => {
    const res = await jsonPost(app, "/api/mc/content", {});
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("title is required");
  });

  it("POST / rejects invalid stage", async () => {
    const res = await jsonPost(app, "/api/mc/content", { title: "T", stage: "nope" });
    expect(res.status).toBe(400);
  });

  it("POST / returns 201 on success", async () => {
    currentChain.single.mockResolvedValueOnce({ data: { id: "1" }, error: null });
    const res = await jsonPost(app, "/api/mc/content", { title: "Thread" });
    expect(res.status).toBe(201);
  });

  it("PATCH /:id rejects invalid stage", async () => {
    const res = await jsonPatch(app, "/api/mc/content/1", { stage: "nope" });
    expect(res.status).toBe(400);
  });
});

// ── Memories routes ──────────────────────────────────────────────────────────

describe("memories routes", () => {
  let app: Hono;

  beforeEach(() => {
    currentChain = mockChain();
    app = createApp("/api/mc/memories", memories);
  });

  it("GET / returns list", async () => {
    const res = await app.request("/api/mc/memories");
    expect(res.status).toBe(200);
  });

  it("POST / requires title", async () => {
    const res = await jsonPost(app, "/api/mc/memories", {});
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("title is required");
  });

  it("POST / requires content", async () => {
    const res = await jsonPost(app, "/api/mc/memories", { title: "T" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("content is required");
  });

  it("POST / requires category", async () => {
    const res = await jsonPost(app, "/api/mc/memories", { title: "T", content: "C" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("category is required");
  });

  it("POST / rejects invalid category", async () => {
    const res = await jsonPost(app, "/api/mc/memories", {
      title: "T", content: "C", category: "nope",
    });
    expect(res.status).toBe(400);
  });

  it("POST / returns 201 on success", async () => {
    currentChain.single.mockResolvedValueOnce({ data: { id: "1" }, error: null });
    const res = await jsonPost(app, "/api/mc/memories", {
      title: "Auth", content: "Use JWT", category: "decision",
    });
    expect(res.status).toBe(201);
  });

  it("PATCH /:id rejects invalid category", async () => {
    const res = await jsonPatch(app, "/api/mc/memories/1", { category: "nope" });
    expect(res.status).toBe(400);
  });
});

// ── Team routes ──────────────────────────────────────────────────────────────

describe("team routes", () => {
  let app: Hono;

  beforeEach(() => {
    currentChain = mockChain();
    app = createApp("/api/mc/team", team);
  });

  it("GET / returns list", async () => {
    const res = await app.request("/api/mc/team");
    expect(res.status).toBe(200);
  });

  it("POST / requires name", async () => {
    const res = await jsonPost(app, "/api/mc/team", {});
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("name is required");
  });

  it("POST / requires role", async () => {
    const res = await jsonPost(app, "/api/mc/team", { name: "Agent" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("role is required");
  });

  it("POST / rejects invalid status", async () => {
    const res = await jsonPost(app, "/api/mc/team", { name: "A", role: "R", status: "nope" });
    expect(res.status).toBe(400);
  });

  it("POST / returns 201 on success", async () => {
    currentChain.single.mockResolvedValueOnce({ data: { id: "1" }, error: null });
    const res = await jsonPost(app, "/api/mc/team", { name: "Agent", role: "Dev" });
    expect(res.status).toBe(201);
  });

  it("PATCH /:id rejects invalid status", async () => {
    const res = await jsonPatch(app, "/api/mc/team/1", { status: "nope" });
    expect(res.status).toBe(400);
  });

  it("DELETE /:id returns success", async () => {
    currentChain.delete.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const res = await app.request("/api/mc/team/1", { method: "DELETE" });
    expect(res.status).toBe(200);
  });
});
