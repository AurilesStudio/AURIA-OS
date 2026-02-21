import { CheckSquare } from "lucide-react";
import { useStore } from "@/store/useStore";

export function MCTasksModule() {
  const count = useStore((s) => s.mcTasks.length);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <CheckSquare className="h-12 w-12 text-text-muted/30" />
      <h2 className="text-lg font-semibold text-text-primary">Tasks</h2>
      <p className="text-sm text-text-muted">
        {count > 0 ? `${count} task${count > 1 ? "s" : ""}` : "No tasks yet"}
      </p>
      <p className="max-w-sm text-center text-xs text-text-muted/60">
        Track and manage your team's tasks, priorities, and workflows.
      </p>
    </div>
  );
}
