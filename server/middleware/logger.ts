import type { MiddlewareHandler } from "hono";
import { metrics } from "../lib/metrics.js";

export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${c.req.method} ${c.req.path} ${c.res.status} ${duration}ms`);

  metrics.record({
    timestamp,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration,
  });
};
