import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";
import { rateLimitMiddleware } from "../middleware/rateLimit.js";

// ── Auth middleware ──────────────────────────────────────────────────────────

describe("authMiddleware", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.use("/api/*", authMiddleware);
    app.get("/api/health", (c) => c.json({ status: "ok" }));
    app.get("/api/mc/tasks", (c) => c.json({ tasks: [] }));
    vi.stubEnv("GATEWAY_TOKEN", "test-token");
  });

  it("skips auth for /api/health", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
  });

  it("returns 401 when Authorization header is missing", async () => {
    const res = await app.request("/api/mc/tasks");
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Missing Authorization header");
  });

  it("returns 403 when token is invalid", async () => {
    const res = await app.request("/api/mc/tasks", {
      headers: { Authorization: "Bearer wrong-token" },
    });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("Invalid token");
  });

  it("passes with valid token", async () => {
    const res = await app.request("/api/mc/tasks", {
      headers: { Authorization: "Bearer test-token" },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tasks).toEqual([]);
  });

  it("returns 500 when GATEWAY_TOKEN is not set", async () => {
    vi.stubEnv("GATEWAY_TOKEN", "");
    const res = await app.request("/api/mc/tasks", {
      headers: { Authorization: "Bearer something" },
    });
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Server misconfigured");
  });
});

// ── Rate limit middleware ────────────────────────────────────────────────────

describe("rateLimitMiddleware", () => {
  it("sets rate limit headers", async () => {
    const app = new Hono();
    app.use("*", rateLimitMiddleware);
    app.get("/test", (c) => c.json({ ok: true }));

    const res = await app.request("/test", {
      headers: { "x-real-ip": "rate-limit-test-1" },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("100");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("99");
    expect(res.headers.get("X-RateLimit-Reset")).toBeTruthy();
  });

  it("returns 429 after exceeding limit", async () => {
    const app = new Hono();
    app.use("*", rateLimitMiddleware);
    app.get("/test", (c) => c.json({ ok: true }));

    const ip = `rate-limit-429-${Date.now()}`;

    // Send 101 requests to exceed the 100-request limit
    for (let i = 0; i < 101; i++) {
      await app.request("/test", {
        headers: { "x-real-ip": ip },
      });
    }

    const res = await app.request("/test", {
      headers: { "x-real-ip": ip },
    });

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe("Too many requests");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("decrements remaining count on each request", async () => {
    const app = new Hono();
    app.use("*", rateLimitMiddleware);
    app.get("/test", (c) => c.json({ ok: true }));

    const ip = `rate-limit-dec-${Date.now()}`;

    const res1 = await app.request("/test", {
      headers: { "x-real-ip": ip },
    });
    expect(res1.headers.get("X-RateLimit-Remaining")).toBe("99");

    const res2 = await app.request("/test", {
      headers: { "x-real-ip": ip },
    });
    expect(res2.headers.get("X-RateLimit-Remaining")).toBe("98");
  });
});
