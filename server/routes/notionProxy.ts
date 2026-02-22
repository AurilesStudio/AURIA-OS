import { Hono } from "hono";

const NOTION_API = "https://api.notion.com";

const notionProxy = new Hono();

notionProxy.all("/*", async (c) => {
  const notionToken = c.req.header("X-Notion-Token");
  if (!notionToken) {
    return c.json({ error: "Missing X-Notion-Token header" }, 401);
  }

  // Build target URL: strip the proxy prefix, keep the rest
  const url = new URL(c.req.url);
  const targetPath = url.pathname.replace("/api/proxy/notion", "");
  const targetUrl = `${NOTION_API}${targetPath}${url.search}`;

  const body = ["GET", "HEAD"].includes(c.req.method)
    ? undefined
    : await c.req.text();

  const res = await fetch(targetUrl, {
    method: c.req.method,
    headers: {
      Authorization: `Bearer ${notionToken}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body,
  });

  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
  });
});

export default notionProxy;
