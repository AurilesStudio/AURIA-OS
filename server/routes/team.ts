import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";

const TABLE = "mc_team_agents";
const VALID_STATUS = ["active", "idle", "offline"] as const;

const team = new Hono();

// List agents (optional query: status, projectId)
team.get("/", async (c) => {
  let query = supabase.from(TABLE).select("*");

  const status = c.req.query("status");
  if (status) query = query.eq("status", status);

  const projectId = c.req.query("projectId");
  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query.order("updated_at", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// Get by id
team.get("/:id", async (c) => {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", c.req.param("id")).single();
  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// Create
team.post("/", async (c) => {
  const body = await c.req.json();

  if (!body.name) return c.json({ error: "name is required" }, 400);
  if (!body.role) return c.json({ error: "role is required" }, 400);
  if (body.status && !VALID_STATUS.includes(body.status))
    return c.json({ error: `status must be one of: ${VALID_STATUS.join(", ")}` }, 400);

  const now = Date.now();
  const row = {
    id: body.id ?? crypto.randomUUID(),
    name: body.name,
    role: body.role,
    responsibilities: body.responsibilities ?? "",
    status: body.status ?? "idle",
    avatar_url: body.avatar_url ?? "",
    task_history: body.task_history ?? [],
    project_id: body.project_id ?? "",
    created_at: body.created_at ?? now,
    updated_at: now,
  };

  const { data, error } = await supabase.from(TABLE).insert(row).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// Update
team.patch("/:id", async (c) => {
  const body = await c.req.json();

  if (body.status && !VALID_STATUS.includes(body.status))
    return c.json({ error: `status must be one of: ${VALID_STATUS.join(", ")}` }, 400);

  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...body, updated_at: Date.now() })
    .eq("id", c.req.param("id"))
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// Delete
team.delete("/:id", async (c) => {
  const { error } = await supabase.from(TABLE).delete().eq("id", c.req.param("id"));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ deleted: true });
});

export default team;
