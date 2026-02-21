import { Plus, Search, X } from "lucide-react";
import type { MCMemoryCategory } from "@/types/mission-control";

const CATEGORY_FILTERS: { value: MCMemoryCategory | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "decision", label: "Decision" },
  { value: "learning", label: "Learning" },
  { value: "context", label: "Context" },
  { value: "reference", label: "Reference" },
];

interface MemoryHeaderProps {
  count: number;
  search: string;
  onSearchChange: (val: string) => void;
  categoryFilter: MCMemoryCategory | "";
  onCategoryFilter: (cat: MCMemoryCategory | "") => void;
  onNewMemory: () => void;
}

export function MemoryHeader({
  count,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilter,
  onNewMemory,
}: MemoryHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/5 px-6 py-3">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">
          {count} memor{count !== 1 ? "ies" : "y"}
        </span>
        <button
          onClick={onNewMemory}
          className="flex items-center gap-1.5 rounded bg-mc-accent/15 px-3 py-1.5 text-xs font-semibold text-mc-accent transition-colors hover:bg-mc-accent/25"
        >
          <Plus className="h-3.5 w-3.5" />
          New Memory
        </button>
      </div>

      {/* Search + category filters row */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-text-muted/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search memories..."
            className="w-full rounded border border-white/10 bg-bg-base/50 py-1.5 pl-8 pr-8 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted/40 hover:text-text-primary"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => onCategoryFilter(f.value)}
              className={`rounded px-2.5 py-1 text-[10px] font-medium transition-colors ${
                categoryFilter === f.value
                  ? "bg-white/10 text-text-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
