import { Droppable } from "@hello-pangea/dnd";
import type { MCTask, MCTaskStatus } from "@/types/mission-control";
import { TaskCard } from "./TaskCard";

interface ColumnConfig {
  status: MCTaskStatus;
  label: string;
  color: string;
}

interface KanbanColumnProps {
  config: ColumnConfig;
  tasks: MCTask[];
  onEditTask: (task: MCTask) => void;
}

export function KanbanColumn({ config, tasks, onEditTask }: KanbanColumnProps) {
  return (
    <Droppable droppableId={config.status}>
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
              {tasks.length}
            </span>
          </div>

          {/* Cards */}
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 space-y-2 overflow-y-auto px-1 pb-4"
          >
            {tasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                onEdit={onEditTask}
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
