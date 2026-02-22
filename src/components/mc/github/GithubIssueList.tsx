import { Plus, ExternalLink } from "lucide-react";
import type { GHIssue } from "@/lib/githubClient";

interface Props {
  issues: GHIssue[];
  onNewIssue: () => void;
}

export function GithubIssueList({ issues, onNewIssue }: Props) {
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] uppercase text-text-muted tracking-wider">Issues</span>
        <button
          onClick={onNewIssue}
          className="flex items-center gap-1 rounded-md bg-[#58a6ff]/15 px-3 py-1.5 text-xs font-medium text-[#58a6ff] hover:bg-[#58a6ff]/25 transition-colors"
        >
          <Plus className="h-3 w-3" /> New Issue
        </button>
      </div>

      {issues.length === 0 ? (
        <p className="py-8 text-center text-xs text-text-muted">No issues found</p>
      ) : (
        <div className="flex flex-col gap-1">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors"
            >
              <span className={`h-2 w-2 rounded-full shrink-0 ${issue.state === "open" ? "bg-emerald-400" : "bg-purple-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-text-primary truncate">{issue.title}</span>
                  <span className="text-[10px] text-text-muted">#{issue.number}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {issue.labels.slice(0, 3).map((l) => (
                    <span
                      key={l.name}
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                      style={{ backgroundColor: `#${l.color}22`, color: `#${l.color}`, border: `1px solid #${l.color}44` }}
                    >
                      {l.name}
                    </span>
                  ))}
                  {issue.assignee && (
                    <span className="text-[10px] text-text-muted">{issue.assignee.login}</span>
                  )}
                </div>
              </div>
              <a
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-[#58a6ff] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
