import { Droppable } from "@hello-pangea/dnd";
import type { MCContentItem, MCContentStage } from "@/types/mission-control";
import { ContentCard } from "./ContentCard";

interface ColumnConfig {
  stage: MCContentStage;
  label: string;
  color: string;
}

interface ContentColumnProps {
  config: ColumnConfig;
  items: MCContentItem[];
  onEditItem: (item: MCContentItem) => void;
}

export function ContentColumn({ config, items, onEditItem }: ContentColumnProps) {
  return (
    <Droppable droppableId={config.stage}>
      {(provided) => (
        <div className="flex w-64 min-w-[256px] shrink-0 flex-col">
          {/* Header */}
          <div className="mb-2 flex items-center gap-2 px-3 py-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <span className="text-xs font-semibold text-text-primary">
              {config.label}
            </span>
            <span className="ml-auto rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-text-muted">
              {items.length}
            </span>
          </div>

          {/* Cards */}
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 space-y-2 overflow-y-auto px-1 pb-4"
          >
            {items.map((item, i) => (
              <ContentCard
                key={item.id}
                item={item}
                index={i}
                onEdit={onEditItem}
              />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}

export type { ColumnConfig };
