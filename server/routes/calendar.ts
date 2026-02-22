import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";

const TABLE = "mc_calendar_events";
const VALID_TYPE = ["task", "meeting", "deployment", "reminder", "milestone"] as const;
const VALID_STATUS = ["scheduled", "in_progress", "completed", "cancelled"] as const;

const calendar = new Hono();

// List events (optional query: type, status, projectId)
calendar.get("/", async (c) => {
  let query = supabase.from(TABLE).select("*");

  const type = c.req.query("type");
  if (type) query = query.eq("type", type);

  const status = c.req.query("status");
  if (status) query = query.eq("status", status);

  const projectId = c.req.query("projectId");
  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query.order("start_date", { ascending: true });
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// Get by id
calendar.get("/:id", async (c) => {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", c.req.param("id")).single();
  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// Create
calendar.post("/", async (c) => {
  const body = await c.req.json();

  if (!body.title) return c.json({ error: "title is required" }, 400);
  if (!body.type) return c.json({ error: "type is required" }, 400);
  if (!body.start_date) return c.json({ error: "start_date is required" }, 400);
  if (!body.end_date) return c.json({ error: "end_date is required" }, 400);

  if (!VALID_TYPE.includes(body.type))
    return c.json({ error: `type must be one of: ${VALID_TYPE.join(", ")}` }, 400);
  if (body.status && !VALID_STATUS.includes(body.status))
    return c.json({ error: `status must be one of: ${VALID_STATUS.join(", ")}` }, 400);

  const row = {
    id: body.id ?? crypto.randomUUID(),
    title: body.title,
    type: body.type,
    start_date: body.start_date,
    end_date: body.end_date,
    status: body.status ?? "scheduled",
    execution_result: body.execution_result ?? "",
    project_id: body.project_id ?? "",
    created_at: body.created_at ?? Date.now(),
  };

  const { data, error } = await supabase.from(TABLE).insert(row).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// Update
calendar.patch("/:id", async (c) => {
  const body = await c.req.json();

  if (body.type && !VALID_TYPE.includes(body.type))
    return c.json({ error: `type must be one of: ${VALID_TYPE.join(", ")}` }, 400);
  if (body.status && !VALID_STATUS.includes(body.status))
    return c.json({ error: `status must be one of: ${VALID_STATUS.join(", ")}` }, 400);

  const { data, error } = await supabase
    .from(TABLE)
    .update(body)
    .eq("id", c.req.param("id"))
    .select()
    .single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// Delete
calendar.delete("/:id", async (c) => {
  const { error } = await supabase.from(TABLE).delete().eq("id", c.req.param("id"));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ deleted: true });
});

export default calendar;
