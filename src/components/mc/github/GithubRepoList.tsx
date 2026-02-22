import { Star, AlertCircle, GitFork } from "lucide-react";
import type { GHRepo } from "@/lib/githubClient";

interface Props {
  repos: GHRepo[];
  onSelect: (repo: GHRepo) => void;
  loading: boolean;
}

const langColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572a5",
  Rust: "#dea584",
  Go: "#00add8",
  Java: "#b07219",
  Ruby: "#701516",
  CSS: "#563d7c",
  HTML: "#e34c26",
};

export function GithubRepoList({ repos, onSelect, loading }: Props) {
  if (loading && repos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-5 w-5 border-2 border-[#58a6ff]/30 border-t-[#58a6ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {repos.map((repo) => (
          <button
            key={repo.id}
            onClick={() => onSelect(repo)}
            className="flex flex-col gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-4 text-left hover:border-[#58a6ff]/30 hover:bg-[#58a6ff]/[0.03] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium text-text-primary truncate">{repo.name}</span>
              {repo.private && (
                <span className="shrink-0 rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] text-text-muted">Private</span>
              )}
              {repo.fork && <GitFork className="h-3 w-3 text-text-muted shrink-0" />}
            </div>

            {repo.description && (
              <p className="text-xs text-text-muted line-clamp-2">{repo.description}</p>
            )}

            <div className="flex items-center gap-3 text-[10px] text-text-muted">
              {repo.language && (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: langColors[repo.language] ?? "#888" }} />
                  {repo.language}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" /> {repo.stargazers_count}
              </span>
              <span className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {repo.open_issues_count}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
