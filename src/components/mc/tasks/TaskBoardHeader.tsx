import { Plus, Download } from "lucide-react";
import { useStore } from "@/store/useStore";
import { isLinearConfigured } from "@/lib/linearClient";

interface TaskBoardHeaderProps {
  onNewTask: () => void;
  onImportLinear?: () => void;
}

export function TaskBoardHeader({ onNewTask, onImportLinear }: TaskBoardHeaderProps) {
  const count = useStore((s) => s.mcTasks.length);
  const linearAvailable = isLinearConfigured();

  return (
    <div className="flex items-center justify-between border-b border-white/5 px-6 py-3">
      <span className="text-xs text-text-muted">
        {count} task{count !== 1 ? "s" : ""}
      </span>
      <div className="flex items-center gap-2">
        {linearAvailable && onImportLinear && (
          <button
            onClick={onImportLinear}
            className="flex items-center gap-1.5 rounded border border-white/10 px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-white/20 hover:text-text-primary"
          >
            <Download className="h-3.5 w-3.5" />
            Import Linear
          </button>
        )}
        <button
          onClick={onNewTask}
          className="flex items-center gap-1.5 rounded bg-mc-accent/15 px-3 py-1.5 text-xs font-semibold text-mc-accent transition-colors hover:bg-mc-accent/25"
        >
          <Plus className="h-3.5 w-3.5" />
          New Task
        </button>
      </div>
    </div>
  );
}
