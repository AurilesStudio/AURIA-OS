import { ExternalLink } from "lucide-react";
import type { NotionPage } from "@/lib/notionClient";
import { getNotionPageTitle } from "@/lib/notionClient";

interface Props {
  pages: NotionPage[];
}

export function NotionPageList({ pages }: Props) {
  return (
    <div className="p-4">
      <span className="text-[10px] uppercase text-text-muted tracking-wider">Pages</span>

      {pages.length === 0 ? (
        <p className="py-8 text-center text-xs text-text-muted">Search to find pages</p>
      ) : (
        <div className="mt-3 flex flex-col gap-1">
          {pages.map((page) => {
            const title = getNotionPageTitle(page);
            const emoji = page.icon?.emoji;

            return (
              <div
                key={page.id}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors"
              >
                <span className="text-base shrink-0">{emoji ?? "\ud83d\udcc4"}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-text-primary truncate block">{title}</span>
                  <span className="text-[10px] text-text-muted">
                    Edited {new Date(page.last_edited_time).toLocaleDateString()}
                  </span>
                </div>
                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-[#e0e0e0] transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
