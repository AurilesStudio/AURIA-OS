import type { MCMemory, MCMemoryCategory } from "@/types/mission-control";

const CATEGORY_CONFIG: Record<MCMemoryCategory, { label: string; color: string }> = {
  decision: { label: "Decision", color: "#6366f1" },
  learning: { label: "Learning", color: "#10b981" },
  context: { label: "Context", color: "#f59e0b" },
  reference: { label: "Reference", color: "#3b82f6" },
};

interface MemoryCardProps {
  memory: MCMemory;
  onClick: () => void;
}

export function MemoryCard({ memory, onClick }: MemoryCardProps) {
  const cat = CATEGORY_CONFIG[memory.category];
  const date = new Date(memory.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <button
      onClick={onClick}
      className="overlay-glass w-full cursor-pointer rounded-lg border border-white/5 px-4 py-3 text-left transition-colors hover:border-white/15"
    >
      {/* Header row */}
      <div className="mb-1.5 flex items-center gap-2">
        {/* Category badge */}
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
          style={{ backgroundColor: cat.color }}
        >
          {cat.label}
        </span>

        {/* Source */}
        {memory.source && (
          <span className="truncate text-[10px] text-text-muted/60">
            {memory.source}
          </span>
        )}

        {/* Date */}
        <span className="ml-auto shrink-0 text-[10px] text-text-muted/60">
          {date}
        </span>
      </div>

      {/* Title */}
      <p className="line-clamp-1 text-xs font-medium text-text-primary">
        {memory.title}
      </p>

      {/* Content preview */}
      {memory.content && (
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-muted/70">
          {memory.content}
        </p>
      )}
    </button>
  );
}

export { CATEGORY_CONFIG };
