import { Github, ArrowLeft, RefreshCw, Search } from "lucide-react";
import type { GHUser, GHRepo } from "@/lib/githubClient";

interface Props {
  user: GHUser | null;
  selectedRepo: GHRepo | null;
  onBack: () => void;
  search: string;
  onSearch: (v: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function GithubHeader({ user, selectedRepo, onBack, search, onSearch, onRefresh, loading }: Props) {
  return (
    <div className="flex items-center gap-3 border-b border-white/5 px-6 py-3">
      {selectedRepo ? (
        <button onClick={onBack} className="text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
      ) : (
        <Github className="h-5 w-5 text-[#58a6ff]" />
      )}

      <div className="flex-1 min-w-0">
        {selectedRepo ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">{selectedRepo.owner.login} /</span>
            <span className="text-sm font-semibold text-text-primary truncate">{selectedRepo.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">GitHub</span>
            {user && <span className="text-xs text-text-muted">@{user.login}</span>}
          </div>
        )}
      </div>

      {!selectedRepo && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search repos..."
            className="w-40 rounded-md border border-white/10 bg-bg-base/50 pl-7 pr-2 py-1 text-xs text-text-primary placeholder:text-text-muted/40 outline-none focus:border-[#58a6ff]/50"
          />
        </div>
      )}

      <button
        onClick={onRefresh}
        className="rounded-md p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
      </button>

      <div className={`h-2 w-2 rounded-full ${user ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-gray-500"}`} />
    </div>
  );
}
