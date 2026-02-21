import { Draggable } from "@hello-pangea/dnd";
import type { MCTask } from "@/types/mission-control";
import { useStore } from "@/store/useStore";

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#3b82f6",
};

interface TaskCardProps {
  task: MCTask;
  index: number;
  onEdit: (task: MCTask) => void;
}

export function TaskCard({ task, index, onEdit }: TaskCardProps) {
  const avatars = useStore((s) => s.avatars);
  const assignee = task.assigneeId
    ? avatars.find((a) => a.id === task.assigneeId)
    : null;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(task)}
          className={`overlay-glass cursor-pointer rounded-lg border px-3 py-2.5 transition-colors hover:border-white/15 ${
            snapshot.isDragging
              ? "border-white/20 shadow-lg shadow-black/40"
              : "border-white/5"
          }`}
        >
          {/* Title */}
          <p className="line-clamp-2 text-xs font-medium text-text-primary">
            {task.title}
          </p>

          {/* Meta row */}
          <div className="mt-2 flex items-center gap-2">
            {/* Priority dot */}
            {task.priority !== "none" && (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                title={task.priority}
              />
            )}

            {/* Assignee */}
            <span className="truncate text-[10px] text-text-muted">
              {assignee ? assignee.name : "Unassigned"}
            </span>
          </div>

          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {task.labels.map((label) => (
                <span
                  key={label}
                  className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-text-muted"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
