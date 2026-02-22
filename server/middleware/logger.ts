import type { MiddlewareHandler } from "hono";

export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${c.req.method} ${c.req.path} ${c.res.status} ${duration}ms`);
};
