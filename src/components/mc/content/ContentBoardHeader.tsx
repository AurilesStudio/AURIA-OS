import { Plus } from "lucide-react";
import { useStore } from "@/store/useStore";

const PLATFORM_FILTERS = ["All", "X", "Instagram", "LinkedIn", "TikTok", "YouTube", "Blog"];

interface ContentBoardHeaderProps {
  onNewContent: () => void;
  platformFilter: string;
  onPlatformFilter: (platform: string) => void;
}

export function ContentBoardHeader({
  onNewContent,
  platformFilter,
  onPlatformFilter,
}: ContentBoardHeaderProps) {
  const count = useStore((s) => s.mcContentPipeline.length);

  return (
    <div className="flex items-center justify-between border-b border-white/5 px-6 py-3">
      {/* Left — counter */}
      <span className="text-xs text-text-muted">
        {count} item{count !== 1 ? "s" : ""}
      </span>

      {/* Center — platform filter pills */}
      <div className="flex items-center gap-1">
        {PLATFORM_FILTERS.map((p) => (
          <button
            key={p}
            onClick={() => onPlatformFilter(p === "All" ? "" : p)}
            className={`rounded px-2.5 py-1 text-[10px] font-medium transition-colors ${
              (p === "All" && !platformFilter) || p === platformFilter
                ? "bg-white/10 text-text-primary"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Right — new content */}
      <button
        onClick={onNewContent}
        className="flex items-center gap-1.5 rounded bg-mc-accent/15 px-3 py-1.5 text-xs font-semibold text-mc-accent transition-colors hover:bg-mc-accent/25"
      >
        <Plus className="h-3.5 w-3.5" />
        New Content
      </button>
    </div>
  );
}
