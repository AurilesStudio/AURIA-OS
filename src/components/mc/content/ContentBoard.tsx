import { useState, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useStore } from "@/store/useStore";
import type { MCContentItem, MCContentStage } from "@/types/mission-control";
import { ContentColumn, type ColumnConfig } from "./ContentColumn";
import { ContentModal } from "./ContentModal";

const COLUMNS: ColumnConfig[] = [
  { stage: "idea", label: "Idea", color: "#a78bfa" },
  { stage: "draft", label: "Draft", color: "#6366f1" },
  { stage: "review", label: "Review", color: "#f59e0b" },
  { stage: "scheduled", label: "Scheduled", color: "#3b82f6" },
  { stage: "published", label: "Published", color: "#10b981" },
];

interface ContentBoardProps {
  filteredItems?: MCContentItem[];
}

export function ContentBoard({ filteredItems }: ContentBoardProps) {
  const allItems = useStore((s) => s.mcContentPipeline);
  const updateItem = useStore((s) => s.updateMCContentItem);

  const items = filteredItems ?? allItems;

  const [editingItem, setEditingItem] = useState<MCContentItem | null>(null);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, draggableId } = result;
      if (!destination) return;
      const newStage = destination.droppableId as MCContentStage;
      updateItem(draggableId, { stage: newStage });
    },
    [updateItem],
  );

  const itemsByStage = (stage: MCContentStage) =>
    items.filter((item) => item.stage === stage);

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex h-full gap-3 overflow-x-auto px-4 py-4">
          {COLUMNS.map((col) => (
            <ContentColumn
              key={col.stage}
              config={col}
              items={itemsByStage(col.stage)}
              onEditItem={setEditingItem}
            />
          ))}
        </div>
      </DragDropContext>

      <ContentModal
        open={editingItem !== null}
        item={editingItem}
        onClose={() => setEditingItem(null)}
      />
    </>
  );
}

export { COLUMNS as CONTENT_COLUMNS };
