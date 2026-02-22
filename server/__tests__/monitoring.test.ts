import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { metrics } from "../lib/metrics.js";

// ── Mock supabase ──────────────────────────────────────────────────────────

const mockChain: Record<string, any> = {
  select: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue({ data: [{ id: "1" }], error: null }),
};
mockChain.select.mockReturnValue(mockChain);

vi.mock("../lib/supabase.js", () => ({
  supabase: {
    from: vi.fn(() => mockChain),
  },
}));

import monitoring from "../routes/monitoring.js";

// ── Helpers ────────────────────────────────────────────────────────────────

function createApp() {
  const app = new Hono();
  app.route("/api/monitoring", monitoring);
  return app;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("GET /api/monitoring", () => {
  let app: Hono;

  beforeEach(() => {
    metrics.reset();
    mockChain.limit.mockResolvedValue({ data: [{ id: "1" }], error: null });
    app = createApp();
  });

  it("returns 200 with monitoring data", async () => {
    const res = await app.request("/api/monitoring");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("system");
    expect(body).toHaveProperty("services");
    expect(body).toHaveProperty("metrics");
    expect(body).toHaveProperty("logs");
  });

  it("returns system info with expected fields", async () => {
    const res = await app.request("/api/monitoring");
    const { system } = await res.json();
    expect(system).toHaveProperty("uptime");
    expect(system).toHaveProperty("nodeVersion");
    expect(system).toHaveProperty("platform");
    expect(system).toHaveProperty("heapUsedMB");
    expect(system).toHaveProperty("heapTotalMB");
    expect(typeof system.uptime).toBe("number");
  });

  it("returns two services (API + Supabase)", async () => {
    const res = await app.request("/api/monitoring");
    const { services } = await res.json();
    expect(services).toHaveLength(2);
    expect(services[0].name).toBe("AURIA API");
    expect(services[0].status).toBe("connected");
    expect(services[1].name).toBe("Supabase");
  });

  it("reports Supabase as connected when query succeeds", async () => {
    const res = await app.request("/api/monitoring");
    const { services } = await res.json();
    const supa = services.find((s: any) => s.name === "Supabase");
    expect(supa.status).toBe("connected");
  });

  it("reports Supabase as error when query fails", async () => {
    mockChain.limit.mockResolvedValueOnce({ data: null, error: { message: "DB down" } });
    const res = await app.request("/api/monitoring");
    const { services } = await res.json();
    const supa = services.find((s: any) => s.name === "Supabase");
    expect(supa.status).toBe("error");
    expect(supa.error).toBe("DB down");
  });

  it("returns metrics reflecting recorded entries", async () => {
    metrics.record({ timestamp: new Date().toISOString(), method: "GET", path: "/test", status: 200, duration: 50 });
    metrics.record({ timestamp: new Date().toISOString(), method: "GET", path: "/test", status: 500, duration: 100 });
    const res = await app.request("/api/monitoring");
    const body = await res.json();
    expect(body.metrics.totalRequests).toBe(2);
    expect(body.metrics.errorCount5xx).toBe(1);
    expect(body.metrics.avgResponseTime).toBe(75);
  });

  it("returns logs from metrics collector", async () => {
    metrics.record({ timestamp: "2025-01-01T00:00:00Z", method: "POST", path: "/api/mc/tasks", status: 201, duration: 30 });
    const res = await app.request("/api/monitoring");
    const { logs } = await res.json();
    expect(logs).toHaveLength(1);
    expect(logs[0].method).toBe("POST");
    expect(logs[0].path).toBe("/api/mc/tasks");
  });
});
