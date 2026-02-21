import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { TaskBoardHeader } from "../tasks/TaskBoardHeader";
import { TaskFilters, EMPTY_FILTERS, type TaskFilterState } from "../tasks/TaskFilters";
import { KanbanBoard } from "../tasks/KanbanBoard";
import { TaskModal } from "../tasks/TaskModal";

export function MCTasksModule() {
  const tasks = useStore((s) => s.mcTasks);
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilterState>(EMPTY_FILTERS);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.labels.some((l) => l.toLowerCase().includes(q)),
      );
    }

    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }

    if (filters.assigneeId === "__unassigned__") {
      result = result.filter((t) => !t.assigneeId);
    } else if (filters.assigneeId) {
      result = result.filter((t) => t.assigneeId === filters.assigneeId);
    }

    if (filters.label) {
      result = result.filter((t) => t.labels.includes(filters.label));
    }

    return result;
  }, [tasks, filters]);

  const hasFilters =
    filters.search || filters.priority || filters.assigneeId || filters.label;

  return (
    <div className="flex h-full flex-col">
      <TaskBoardHeader onNewTask={() => setCreateOpen(true)} />
      <TaskFilters
        filters={filters}
        onChange={setFilters}
        resultCount={filteredTasks.length}
      />
      <KanbanBoard filteredTasks={hasFilters ? filteredTasks : undefined} />

      <TaskModal
        open={createOpen}
        task={null}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
