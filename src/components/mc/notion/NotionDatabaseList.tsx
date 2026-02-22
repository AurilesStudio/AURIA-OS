import { Database, ExternalLink, Plus } from "lucide-react";
import type { NotionDatabase } from "@/lib/notionClient";

interface Props {
  databases: NotionDatabase[];
  onSelect: (db: NotionDatabase) => void;
  onCreatePage: (db: NotionDatabase) => void;
}

export function NotionDatabaseList({ databases, onSelect, onCreatePage }: Props) {
  return (
    <div className="p-4">
      <span className="text-[10px] uppercase text-text-muted tracking-wider">Databases</span>

      {databases.length === 0 ? (
        <p className="py-8 text-center text-xs text-text-muted">Search to find databases</p>
      ) : (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {databases.map((db) => {
            const title = db.title.map((t) => t.plain_text).join("") || "Untitled";
            const emoji = db.icon?.emoji;
            const propCount = Object.keys(db.properties).length;

            return (
              <div
                key={db.id}
                className="flex flex-col gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-4 hover:border-[#e0e0e0]/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{emoji ?? "\ud83d\udcca"}</span>
                  <span className="text-sm font-medium text-text-primary truncate flex-1">{title}</span>
                  <a
                    href={db.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted hover:text-[#e0e0e0] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-text-muted">
                  <Database className="h-3 w-3" />
                  <span>{propCount} properties</span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => onSelect(db)}
                    className="flex-1 rounded-md bg-white/5 px-3 py-1.5 text-xs text-text-primary hover:bg-white/10 transition-colors"
                  >
                    View Data
                  </button>
                  <button
                    onClick={() => onCreatePage(db)}
                    className="flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-xs text-[#e0e0e0] hover:bg-white/15 transition-colors"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
