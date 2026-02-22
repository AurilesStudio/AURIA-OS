import { GitPullRequest, ExternalLink } from "lucide-react";
import type { GHPullRequest } from "@/lib/githubClient";

interface Props {
  prs: GHPullRequest[];
}

export function GithubPRList({ prs }: Props) {
  return (
    <div className="p-4">
      <span className="text-[10px] uppercase text-text-muted tracking-wider">Pull Requests</span>

      {prs.length === 0 ? (
        <p className="py-8 text-center text-xs text-text-muted">No pull requests</p>
      ) : (
        <div className="mt-3 flex flex-col gap-1">
          {prs.map((pr) => (
            <div
              key={pr.id}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors"
            >
              <GitPullRequest className={`h-4 w-4 shrink-0 ${pr.state === "open" ? "text-emerald-400" : "text-purple-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-text-primary truncate">{pr.title}</span>
                  <span className="text-[10px] text-text-muted">#{pr.number}</span>
                  {pr.draft && (
                    <span className="rounded-full bg-gray-500/20 px-1.5 py-0.5 text-[9px] text-gray-400 border border-gray-500/30">Draft</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-muted">
                  <span>{pr.head.ref} → {pr.base.ref}</span>
                  <span>by {pr.user.login}</span>
                  {pr.requested_reviewers.length > 0 && (
                    <span>{pr.requested_reviewers.length} reviewer(s)</span>
                  )}
                </div>
              </div>
              <a
                href={pr.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-[#58a6ff] transition-colors"
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
