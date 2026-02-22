import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";

const TABLE = "mc_tasks";
const VALID_STATUS = ["backlog", "todo", "in_progress", "done", "cancelled"] as const;
const VALID_PRIORITY = ["none", "low", "medium", "high", "urgent"] as const;

const tasks = new Hono();

// List tasks (optional query: status, projectId)
tasks.get("/", async (c) => {
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
tasks.get("/:id", async (c) => {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", c.req.param("id")).single();
  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// Create
tasks.post("/", async (c) => {
  const body = await c.req.json();

  if (!body.title) return c.json({ error: "title is required" }, 400);
  if (body.status && !VALID_STATUS.includes(body.status))
    return c.json({ error: `status must be one of: ${VALID_STATUS.join(", ")}` }, 400);
  if (body.priority && !VALID_PRIORITY.includes(body.priority))
    return c.json({ error: `priority must be one of: ${VALID_PRIORITY.join(", ")}` }, 400);

  const now = Date.now();
  const row = {
    id: body.id ?? crypto.randomUUID(),
    title: body.title,
    description: body.description ?? "",
    status: body.status ?? "backlog",
    priority: body.priority ?? "none",
    assignee_id: body.assignee_id ?? "",
    labels: body.labels ?? [],
    project_id: body.project_id ?? "",
    created_at: body.created_at ?? now,
    updated_at: now,
  };

  const { data, error } = await supabase.from(TABLE).insert(row).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// Update
tasks.patch("/:id", async (c) => {
  const body = await c.req.json();

  if (body.status && !VALID_STATUS.includes(body.status))
    return c.json({ error: `status must be one of: ${VALID_STATUS.join(", ")}` }, 400);
  if (body.priority && !VALID_PRIORITY.includes(body.priority))
    return c.json({ error: `priority must be one of: ${VALID_PRIORITY.join(", ")}` }, 400);

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
tasks.delete("/:id", async (c) => {
  const { error } = await supabase.from(TABLE).delete().eq("id", c.req.param("id"));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ deleted: true });
});

export default tasks;
