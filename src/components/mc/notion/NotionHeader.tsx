import { StickyNote, ArrowLeft, RefreshCw, Search } from "lucide-react";
import { useState, useEffect } from "react";
import type { NotionDatabase } from "@/lib/notionClient";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  onRefresh: () => void;
  loading: boolean;
  selectedDb?: NotionDatabase | null;
  onBack?: () => void;
}

export function NotionHeader({ search, onSearch, onRefresh, loading, selectedDb, onBack }: Props) {
  const [input, setInput] = useState(search);

  useEffect(() => { setInput(search); }, [search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(input);
  };

  return (
    <div className="flex items-center gap-3 border-b border-white/5 px-6 py-3">
      {selectedDb && onBack ? (
        <button onClick={onBack} className="text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
      ) : (
        <StickyNote className="h-5 w-5 text-[#e0e0e0]" />
      )}

      <div className="flex-1 min-w-0">
        {selectedDb ? (
          <span className="text-sm font-semibold text-text-primary truncate">
            {selectedDb.title.map((t) => t.plain_text).join("") || "Untitled Database"}
          </span>
        ) : (
          <span className="text-sm font-semibold text-text-primary">Notion</span>
        )}
      </div>

      {!selectedDb && (
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-text-muted" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search Notion..."
            className="w-44 rounded-md border border-white/10 bg-bg-base/50 pl-7 pr-2 py-1 text-xs text-text-primary placeholder:text-text-muted/40 outline-none focus:border-[#e0e0e0]/50"
          />
        </form>
      )}

      <button
        onClick={onRefresh}
        className="rounded-md p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
