import { Hono } from "hono";
import { supabase } from "../lib/supabase.js";

const TABLE = "mc_memories";
const VALID_CATEGORY = ["decision", "learning", "context", "reference"] as const;

const memories = new Hono();

// List memories (optional query: category, projectId)
memories.get("/", async (c) => {
  let query = supabase.from(TABLE).select("*");

  const category = c.req.query("category");
  if (category) query = query.eq("category", category);

  const projectId = c.req.query("projectId");
  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// Get by id
memories.get("/:id", async (c) => {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", c.req.param("id")).single();
  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// Create
memories.post("/", async (c) => {
  const body = await c.req.json();

  if (!body.title) return c.json({ error: "title is required" }, 400);
  if (!body.content) return c.json({ error: "content is required" }, 400);
  if (!body.category) return c.json({ error: "category is required" }, 400);

  if (!VALID_CATEGORY.includes(body.category))
    return c.json({ error: `category must be one of: ${VALID_CATEGORY.join(", ")}` }, 400);

  const row = {
    id: body.id ?? crypto.randomUUID(),
    title: body.title,
    content: body.content,
    category: body.category,
    source: body.source ?? "",
    project_id: body.project_id ?? "",
    created_at: body.created_at ?? Date.now(),
  };

  const { data, error } = await supabase.from(TABLE).insert(row).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// Update
memories.patch("/:id", async (c) => {
  const body = await c.req.json();

  if (body.category && !VALID_CATEGORY.includes(body.category))
    return c.json({ error: `category must be one of: ${VALID_CATEGORY.join(", ")}` }, 400);

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
memories.delete("/:id", async (c) => {
  const { error } = await supabase.from(TABLE).delete().eq("id", c.req.param("id"));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ deleted: true });
});

export default memories;
