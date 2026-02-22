import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";
import { metrics } from "../lib/metrics.js";

const monitoring = new Hono();

monitoring.get("/", async (c) => {
  // ── System info ──────────────────────────────────────────────
  const mem = process.memoryUsage();
  const system = {
    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
    heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
  };

  // ── Service checks ──────────────────────────────────────────
  // AURIA API — if we got here, it's alive
  const apiService = { name: "AURIA API", status: "connected" as const, latency: 0 };

  // Supabase — ping with a lightweight query
  let supabaseService: { name: string; status: "connected" | "error"; latency: number; error?: string };
  try {
    const start = Date.now();
    const { error } = await supabase.from("mc_tasks").select("id").limit(1);
    const latency = Date.now() - start;
    supabaseService = error
      ? { name: "Supabase", status: "error", latency, error: error.message }
      : { name: "Supabase", status: "connected", latency };
  } catch (err) {
    supabaseService = {
      name: "Supabase",
      status: "error",
      latency: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }

  return c.json({
    system,
    services: [apiService, supabaseService],
    metrics: metrics.getMetrics(),
    logs: metrics.getLogs(),
  });
});

export default monitoring;
