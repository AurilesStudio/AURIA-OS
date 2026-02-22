import { Plus } from "lucide-react";
import type { LinearIssue } from "@/lib/linearClient";

interface Props {
  issues: LinearIssue[];
  onNewIssue: () => void;
}

const priorityDots: Record<number, { color: string; label: string }> = {
  0: { color: "bg-gray-500", label: "None" },
  1: { color: "bg-red-500", label: "Urgent" },
  2: { color: "bg-orange-500", label: "High" },
  3: { color: "bg-yellow-500", label: "Medium" },
  4: { color: "bg-blue-400", label: "Low" },
};

const stateColors: Record<string, string> = {
  backlog: "bg-gray-500",
  unstarted: "bg-gray-400",
  started: "bg-amber-400",
  completed: "bg-emerald-400",
  cancelled: "bg-red-400",
  canceled: "bg-red-400",
};

export function LinearIssueList({ issues, onNewIssue }: Props) {
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] uppercase text-text-muted tracking-wider">Issues</span>
        <button
          onClick={onNewIssue}
          className="flex items-center gap-1 rounded-md bg-[#818cf8]/15 px-3 py-1.5 text-xs font-medium text-[#818cf8] hover:bg-[#818cf8]/25 transition-colors"
        >
          <Plus className="h-3 w-3" /> New Issue
        </button>
      </div>

      {issues.length === 0 ? (
        <p className="py-8 text-center text-xs text-text-muted">No issues found</p>
      ) : (
        <div className="flex flex-col gap-1">
          {issues.map((issue) => {
            const prio = priorityDots[issue.priority] ?? priorityDots[0]!;
            const stateColor = stateColors[issue.state.type] ?? "bg-gray-500";
            return (
              <div
                key={issue.id}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors"
              >
                <span className={`h-2 w-2 rounded-full shrink-0 ${stateColor}`} title={issue.state.name} />
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${prio.color}`} title={prio.label} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted font-mono">{issue.identifier}</span>
                    <span className="text-xs font-medium text-text-primary truncate">{issue.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {issue.labels.nodes.slice(0, 3).map((l) => (
                      <span key={l.name} className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] text-text-muted">
                        {l.name}
                      </span>
                    ))}
                    {issue.assignee && (
                      <span className="text-[10px] text-text-muted">{issue.assignee.name}</span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-text-muted">
                  {issue.state.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
