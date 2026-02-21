import { useState } from "react";
import { TaskBoardHeader } from "../tasks/TaskBoardHeader";
import { KanbanBoard } from "../tasks/KanbanBoard";
import { TaskModal } from "../tasks/TaskModal";

export function MCTasksModule() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <TaskBoardHeader onNewTask={() => setCreateOpen(true)} />
      <KanbanBoard />

      <TaskModal
        open={createOpen}
        task={null}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
