import type { MiddlewareHandler } from "hono";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 100;

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of store) {
    if (now > entry.resetAt) store.delete(ip);
  }
}, 5 * 60_000);

export const rateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const ip = c.req.header("x-real-ip") ?? c.req.header("x-forwarded-for") ?? "unknown";
  const now = Date.now();

  let entry = store.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(ip, entry);
  }

  entry.count++;
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);

  c.header("X-RateLimit-Limit", String(MAX_REQUESTS));
  c.header("X-RateLimit-Remaining", String(remaining));
  c.header("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

  if (entry.count > MAX_REQUESTS) {
    return c.json({ error: "Too many requests" }, 429);
  }

  return next();
};
