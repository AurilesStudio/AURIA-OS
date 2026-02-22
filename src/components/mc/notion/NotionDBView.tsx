import { useState, useEffect, useCallback } from "react";
import { queryNotionDatabase } from "@/lib/notionClient";
import type { NotionDatabase, NotionPage } from "@/lib/notionClient";

interface Props {
  token: string;
  database: NotionDatabase;
}

export function NotionDBView({ token, database }: Props) {
  const [rows, setRows] = useState<NotionPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  const load = useCallback(async (startCursor?: string) => {
    setLoading(true);
    try {
      const res = await queryNotionDatabase(token, database.id, {
        page_size: 50,
        start_cursor: startCursor ?? undefined,
      });
      setRows((prev) => startCursor ? [...prev, ...res.results] : res.results);
      setHasMore(res.has_more);
      setCursor(res.next_cursor);
    } catch {
      // Error already shown by parent
    } finally {
      setLoading(false);
    }
  }, [token, database.id]);

  useEffect(() => { load(); }, [load]);

  const propNames = Object.keys(database.properties).slice(0, 6);

  const getCellValue = (page: NotionPage, propName: string): string => {
    const prop = page.properties[propName];
    if (!prop) return "";
    if (prop.type === "title") return prop.title?.map((t) => t.plain_text).join("") ?? "";
    if (prop.type === "rich_text") return prop.rich_text?.map((t) => t.plain_text).join("") ?? "";
    if (prop.type === "number") return String((prop as { number?: number }).number ?? "");
    if (prop.type === "select") return ((prop as { select?: { name: string } }).select?.name) ?? "";
    if (prop.type === "multi_select") return ((prop as { multi_select?: { name: string }[] }).multi_select ?? []).map((s) => s.name).join(", ");
    if (prop.type === "date") return ((prop as { date?: { start: string } }).date?.start) ?? "";
    if (prop.type === "checkbox") return (prop as { checkbox?: boolean }).checkbox ? "\u2713" : "";
    if (prop.type === "url") return ((prop as { url?: string }).url) ?? "";
    if (prop.type === "status") return ((prop as { status?: { name: string } }).status?.name) ?? "";
    return "";
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      {loading && rows.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-5 w-5 border-2 border-[#e0e0e0]/30 border-t-[#e0e0e0] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-white/5">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  {propNames.map((name) => (
                    <th key={name} className="px-3 py-2 text-left text-[10px] uppercase text-text-muted font-medium">
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    {propNames.map((name) => (
                      <td key={name} className="px-3 py-2 text-text-primary truncate max-w-[200px]">
                        {getCellValue(row, name)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => cursor && load(cursor)}
                disabled={loading}
                className="rounded-lg bg-white/5 px-4 py-2 text-xs text-text-muted hover:bg-white/10 transition-colors disabled:opacity-40"
              >
                {loading ? "Loading..." : "Load more"}
              </button>
            </div>
          )}

          {rows.length === 0 && !loading && (
            <p className="py-8 text-center text-xs text-text-muted">No rows in this database</p>
          )}
        </>
      )}
    </div>
  );
}
