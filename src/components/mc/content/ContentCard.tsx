import { Draggable } from "@hello-pangea/dnd";
import type { MCContentItem } from "@/types/mission-control";

const PLATFORM_COLORS: Record<string, string> = {
  x: "#000000",
  twitter: "#000000",
  instagram: "#e1306c",
  linkedin: "#0a66c2",
  tiktok: "#ff0050",
  youtube: "#ff0000",
  blog: "#6366f1",
};

interface ContentCardProps {
  item: MCContentItem;
  index: number;
  onEdit: (item: MCContentItem) => void;
}

export function ContentCard({ item, index, onEdit }: ContentCardProps) {
  const platformColor = PLATFORM_COLORS[item.platform.toLowerCase()] ?? "#6b7280";
  const scheduledLabel = item.scheduledDate
    ? new Date(item.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(item)}
          className={`overlay-glass cursor-pointer rounded-lg border px-3 py-2.5 transition-colors hover:border-white/15 ${
            snapshot.isDragging
              ? "border-white/20 shadow-lg shadow-black/40"
              : "border-white/5"
          }`}
        >
          {/* Title */}
          <p className="line-clamp-2 text-xs font-medium text-text-primary">
            {item.title}
          </p>

          {/* Script preview */}
          {item.script && (
            <p className="mt-1 line-clamp-1 text-[10px] text-text-muted/60">
              {item.script}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-2 flex items-center gap-2">
            {/* Platform badge */}
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: platformColor }}
            >
              {item.platform}
            </span>

            {/* Scheduled date */}
            {scheduledLabel && (
              <span className="ml-auto text-[10px] text-text-muted">
                {scheduledLabel}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

export { PLATFORM_COLORS };
