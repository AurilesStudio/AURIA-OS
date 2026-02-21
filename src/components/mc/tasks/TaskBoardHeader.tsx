import { Plus } from "lucide-react";
import { useStore } from "@/store/useStore";

interface TaskBoardHeaderProps {
  onNewTask: () => void;
}

export function TaskBoardHeader({ onNewTask }: TaskBoardHeaderProps) {
  const count = useStore((s) => s.mcTasks.length);

  return (
    <div className="flex items-center justify-between border-b border-white/5 px-6 py-3">
      <span className="text-xs text-text-muted">
        {count} task{count !== 1 ? "s" : ""}
      </span>
      <button
        onClick={onNewTask}
        className="flex items-center gap-1.5 rounded bg-mc-accent/15 px-3 py-1.5 text-xs font-semibold text-mc-accent transition-colors hover:bg-mc-accent/25"
      >
        <Plus className="h-3.5 w-3.5" />
        New Task
      </button>
    </div>
  );
}
