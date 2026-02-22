import { useState, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { isNotionConfigured, searchNotion } from "@/lib/notionClient";
import type { NotionPage, NotionDatabase, NotionSearchResult } from "@/lib/notionClient";
import { NotionHeader } from "../notion/NotionHeader";
import { NotionPageList } from "../notion/NotionPageList";
import { NotionDatabaseList } from "../notion/NotionDatabaseList";
import { NotionDBView } from "../notion/NotionDBView";
import { NotionPageModal } from "../notion/NotionPageModal";
import { Settings } from "lucide-react";

type Tab = "pages" | "databases";

export function MCNotionModule() {
  const keys = useStore((s) => s.integrationKeys);
  const setModule = useStore((s) => s.setMCActiveModule);
  const token = keys.notion ?? "";

  const [pages, setPages] = useState<NotionPage[]>([]);
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [tab, setTab] = useState<Tab>("pages");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDb, setSelectedDb] = useState<NotionDatabase | null>(null);
  const [createModal, setCreateModal] = useState(false);

  const configured = isNotionConfigured(keys);

  const doSearch = useCallback(async (query: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res: NotionSearchResult = await searchNotion(token, query, { page_size: 50 });
      const p: NotionPage[] = [];
      const d: NotionDatabase[] = [];
      for (const item of res.results) {
        if (item.object === "page") p.push(item as NotionPage);
        else if (item.object === "database") d.push(item as NotionDatabase);
      }
      setPages(p);
      setDatabases(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to search");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
    doSearch(q);
  }, [doSearch]);

  if (!configured) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-text-muted">
        <Settings className="h-10 w-10 text-[#e0e0e0]/40" />
        <p className="text-sm">Configure your Notion API key in Settings to get started.</p>
        <p className="text-xs text-text-muted/60">Notion integration requires the API server to be running.</p>
        <button
          onClick={() => setModule("office")}
          className="rounded-lg bg-white/10 px-4 py-2 text-xs font-medium text-[#e0e0e0] hover:bg-white/15 transition-colors"
        >
          Open Settings
        </button>
      </div>
    );
  }

  if (selectedDb) {
    return (
      <div className="flex h-full flex-col">
        <NotionHeader
          search={search}
          onSearch={handleSearch}
          onRefresh={() => doSearch(search)}
          loading={loading}
          selectedDb={selectedDb}
          onBack={() => setSelectedDb(null)}
        />
        {error && (
          <div className="mx-6 mt-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs text-red-400">{error}</div>
        )}
        <NotionDBView token={token} database={selectedDb} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <NotionHeader
        search={search}
        onSearch={handleSearch}
        onRefresh={() => doSearch(search)}
        loading={loading}
      />

      {error && (
        <div className="mx-6 mt-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs text-red-400">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5 px-6">
        {(["pages", "databases"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-xs font-medium capitalize transition-colors border-b-2 ${
              tab === t
                ? "border-[#e0e0e0] text-[#e0e0e0]"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            {t}
            <span className="ml-1.5 text-[10px] text-text-muted">
              {t === "pages" ? pages.length : databases.length}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "pages" && <NotionPageList pages={pages} />}
        {tab === "databases" && (
          <NotionDatabaseList
            databases={databases}
            onSelect={setSelectedDb}
            onCreatePage={(db) => { setSelectedDb(db); setCreateModal(true); }}
          />
        )}
      </div>

      {createModal && selectedDb && (
        <NotionPageModal
          token={token}
          database={selectedDb}
          onClose={() => { setCreateModal(false); setSelectedDb(null); }}
          onCreated={() => { setCreateModal(false); doSearch(search); }}
        />
      )}
    </div>
  );
}
