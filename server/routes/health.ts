import { Hono } from "hono";

const startTime = Date.now();

const health = new Hono();

health.get("/", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
});

export default health;
