import { useMemo } from "react";
import { Search, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import type { MCTaskPriority } from "@/types/mission-control";

const PRIORITY_OPTIONS: { value: MCTaskPriority | ""; label: string }[] = [
  { value: "", label: "All priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "none", label: "None" },
];

export interface TaskFilterState {
  search: string;
  priority: MCTaskPriority | "";
  assigneeId: string; // "" = all
  label: string; // "" = all
}

export const EMPTY_FILTERS: TaskFilterState = {
  search: "",
  priority: "",
  assigneeId: "",
  label: "",
};

interface TaskFiltersProps {
  filters: TaskFilterState;
  onChange: (filters: TaskFilterState) => void;
  resultCount: number;
}

export function TaskFilters({ filters, onChange, resultCount }: TaskFiltersProps) {
  const avatars = useStore((s) => s.avatars);
  const tasks = useStore((s) => s.mcTasks);

  // Collect unique labels from all tasks
  const allLabels = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => t.labels.forEach((l) => set.add(l)));
    return Array.from(set).sort();
  }, [tasks]);

  const hasFilters =
    filters.search || filters.priority || filters.assigneeId || filters.label;

  const selectClass =
    "rounded border border-white/10 bg-bg-base/50 px-2 py-1 text-[11px] text-text-primary outline-none focus:border-white/20";

  return (
    <div className="flex items-center gap-2 border-b border-white/5 px-6 py-2">
      {/* Search */}
      <div className="relative flex-1 max-w-[220px]">
        <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-text-muted/50" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search tasks..."
          className="w-full rounded border border-white/10 bg-bg-base/50 py-1 pl-7 pr-2 text-[11px] text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
        />
      </div>

      {/* Priority */}
      <select
        value={filters.priority}
        onChange={(e) =>
          onChange({ ...filters, priority: e.target.value as MCTaskPriority | "" })
        }
        className={selectClass}
      >
        {PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Assignee */}
      <select
        value={filters.assigneeId}
        onChange={(e) => onChange({ ...filters, assigneeId: e.target.value })}
        className={selectClass}
      >
        <option value="">All assignees</option>
        <option value="__unassigned__">Unassigned</option>
        {avatars.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      {/* Label */}
      {allLabels.length > 0 && (
        <select
          value={filters.label}
          onChange={(e) => onChange({ ...filters, label: e.target.value })}
          className={selectClass}
        >
          <option value="">All labels</option>
          {allLabels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      )}

      {/* Result count + Reset */}
      {hasFilters && (
        <>
          <span className="text-[10px] text-text-muted">
            {resultCount} result{resultCount !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => onChange(EMPTY_FILTERS)}
            className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-text-muted transition-colors hover:text-text-primary"
          >
            <X className="h-3 w-3" />
            Reset
          </button>
        </>
      )}
    </div>
  );
}
