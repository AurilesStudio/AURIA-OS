import { useState, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useStore } from "@/store/useStore";
import type { MCTask, MCTaskStatus } from "@/types/mission-control";
import { KanbanColumn, type ColumnConfig } from "./KanbanColumn";
import { TaskModal } from "./TaskModal";

const COLUMNS: ColumnConfig[] = [
  { status: "backlog", label: "Backlog", color: "#6b7280" },
  { status: "todo", label: "To Do", color: "#6366f1" },
  { status: "in_progress", label: "In Progress", color: "#f59e0b" },
  { status: "done", label: "Done", color: "#10b981" },
  { status: "cancelled", label: "Cancelled", color: "#ff003c" },
];

export function KanbanBoard() {
  const tasks = useStore((s) => s.mcTasks);
  const updateMCTask = useStore((s) => s.updateMCTask);

  const [editingTask, setEditingTask] = useState<MCTask | null>(null);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, draggableId } = result;
      if (!destination) return;
      const newStatus = destination.droppableId as MCTaskStatus;
      updateMCTask(draggableId, { status: newStatus });
    },
    [updateMCTask],
  );

  const tasksByStatus = (status: MCTaskStatus) =>
    tasks.filter((t) => t.status === status);

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex h-full gap-3 overflow-x-auto px-4 py-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              config={col}
              tasks={tasksByStatus(col.status)}
              onEditTask={setEditingTask}
            />
          ))}
        </div>
      </DragDropContext>

      <TaskModal
        open={editingTask !== null}
        task={editingTask}
        onClose={() => setEditingTask(null)}
      />
    </>
  );
}
