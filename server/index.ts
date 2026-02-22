import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { authMiddleware } from "./middleware/auth.js";
import { rateLimitMiddleware } from "./middleware/rateLimit.js";
import { loggerMiddleware } from "./middleware/logger.js";

import health from "./routes/health.js";
import tasks from "./routes/tasks.js";
import calendar from "./routes/calendar.js";
import content from "./routes/content.js";
import memories from "./routes/memories.js";
import team from "./routes/team.js";
import monitoring from "./routes/monitoring.js";

const app = new Hono();

// Global middleware
app.use("*", cors());
app.use("*", loggerMiddleware);
app.use("/api/*", rateLimitMiddleware);
app.use("/api/*", authMiddleware);

// Routes
app.route("/api/health", health);
app.route("/api/mc/tasks", tasks);
app.route("/api/mc/calendar", calendar);
app.route("/api/mc/content", content);
app.route("/api/mc/memories", memories);
app.route("/api/mc/team", team);
app.route("/api/monitoring", monitoring);

const port = Number(process.env.PORT) || 3001;

serve({ fetch: app.fetch, port }, () => {
  console.log(`[auria-api] Server running on http://localhost:${port}`);
});
