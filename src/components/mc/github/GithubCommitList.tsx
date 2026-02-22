import { GitCommit, ExternalLink } from "lucide-react";
import type { GHCommit } from "@/lib/githubClient";

interface Props {
  commits: GHCommit[];
}

export function GithubCommitList({ commits }: Props) {
  return (
    <div className="p-4">
      <span className="text-[10px] uppercase text-text-muted tracking-wider">Commits</span>

      {commits.length === 0 ? (
        <p className="py-8 text-center text-xs text-text-muted">No commits</p>
      ) : (
        <div className="mt-3 flex flex-col">
          {commits.map((c, i) => (
            <div key={c.sha} className="flex items-start gap-3 py-3">
              {/* Timeline line */}
              <div className="flex flex-col items-center gap-1 pt-0.5">
                <GitCommit className="h-3.5 w-3.5 text-[#58a6ff] shrink-0" />
                {i < commits.length - 1 && <div className="w-px flex-1 bg-white/5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-primary truncate">{c.commit.message.split("\n")[0]}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-muted">
                  <code className="rounded bg-white/5 px-1 py-0.5 font-mono">{c.sha.slice(0, 7)}</code>
                  <span>{c.commit.author.name}</span>
                  <span>{new Date(c.commit.author.date).toLocaleDateString()}</span>
                </div>
              </div>
              <a
                href={c.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 text-text-muted hover:text-[#58a6ff] transition-colors"
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
