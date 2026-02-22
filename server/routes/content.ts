import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";

const TABLE = "mc_content_pipeline";
const VALID_STAGE = ["idea", "draft", "review", "scheduled", "published"] as const;

const content = new Hono();

// List content (optional query: stage, platform, projectId)
content.get("/", async (c) => {
  let query = supabase.from(TABLE).select("*");

  const stage = c.req.query("stage");
  if (stage) query = query.eq("stage", stage);

  const platform = c.req.query("platform");
  if (platform) query = query.eq("platform", platform);

  const projectId = c.req.query("projectId");
  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// Get by id
content.get("/:id", async (c) => {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", c.req.param("id")).single();
  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// Create
content.post("/", async (c) => {
  const body = await c.req.json();

  if (!body.title) return c.json({ error: "title is required" }, 400);
  if (body.stage && !VALID_STAGE.includes(body.stage))
    return c.json({ error: `stage must be one of: ${VALID_STAGE.join(", ")}` }, 400);

  const row = {
    id: body.id ?? crypto.randomUUID(),
    title: body.title,
    stage: body.stage ?? "idea",
    platform: body.platform ?? "",
    script: body.script ?? "",
    media_urls: body.media_urls ?? [],
    scheduled_date: body.scheduled_date ?? null,
    project_id: body.project_id ?? "",
    created_at: body.created_at ?? Date.now(),
  };

  const { data, error } = await supabase.from(TABLE).insert(row).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// Update
content.patch("/:id", async (c) => {
  const body = await c.req.json();

  if (body.stage && !VALID_STAGE.includes(body.stage))
    return c.json({ error: `stage must be one of: ${VALID_STAGE.join(", ")}` }, 400);

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
content.delete("/:id", async (c) => {
  const { error } = await supabase.from(TABLE).delete().eq("id", c.req.param("id"));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ deleted: true });
});

export default content;
