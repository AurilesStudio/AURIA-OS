import type { MiddlewareHandler } from "hono";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  // Skip auth for health endpoint
  if (c.req.path === "/api/health") {
    return next();
  }

  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ error: "Missing Authorization header" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  const gatewayToken = process.env.GATEWAY_TOKEN;

  if (!gatewayToken) {
    console.error("[auth] GATEWAY_TOKEN not set in environment");
    return c.json({ error: "Server misconfigured" }, 500);
  }

  if (token !== gatewayToken) {
    return c.json({ error: "Invalid token" }, 403);
  }

  return next();
};
