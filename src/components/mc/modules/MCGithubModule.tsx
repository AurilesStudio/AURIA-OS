import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { isGithubConfigured, fetchGHUser, fetchGHRepos, fetchGHIssues, fetchGHPullRequests, fetchGHCommits } from "@/lib/githubClient";
import type { GHUser, GHRepo, GHIssue, GHPullRequest, GHCommit } from "@/lib/githubClient";
import { GithubHeader } from "../github/GithubHeader";
import { GithubRepoList } from "../github/GithubRepoList";
import { GithubIssueList } from "../github/GithubIssueList";
import { GithubPRList } from "../github/GithubPRList";
import { GithubCommitList } from "../github/GithubCommitList";
import { GithubIssueModal } from "../github/GithubIssueModal";
import { Settings } from "lucide-react";

type Tab = "repos" | "issues" | "prs" | "commits";

export function MCGithubModule() {
  const keys = useStore((s) => s.integrationKeys);
  const setModule = useStore((s) => s.setMCActiveModule);
  const token = keys.github ?? "";

  const [user, setUser] = useState<GHUser | null>(null);
  const [repos, setRepos] = useState<GHRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GHRepo | null>(null);
  const [issues, setIssues] = useState<GHIssue[]>([]);
  const [prs, setPrs] = useState<GHPullRequest[]>([]);
  const [commits, setCommits] = useState<GHCommit[]>([]);
  const [tab, setTab] = useState<Tab>("repos");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issueModal, setIssueModal] = useState(false);
  const [search, setSearch] = useState("");

  const configured = isGithubConfigured(keys);

  const loadRepos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [u, r] = await Promise.all([fetchGHUser(token), fetchGHRepos(token, { per_page: 50 })]);
      setUser(u);
      setRepos(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadRepoDetails = useCallback(async (repo: GHRepo) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [i, p, c] = await Promise.all([
        fetchGHIssues(token, repo.owner.login, repo.name),
        fetchGHPullRequests(token, repo.owner.login, repo.name),
        fetchGHCommits(token, repo.owner.login, repo.name),
      ]);
      setIssues(i);
      setPrs(p);
      setCommits(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (configured) loadRepos();
  }, [configured, loadRepos]);

  useEffect(() => {
    if (selectedRepo) {
      loadRepoDetails(selectedRepo);
      setTab("issues");
    }
  }, [selectedRepo, loadRepoDetails]);

  if (!configured) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-text-muted">
        <Settings className="h-10 w-10 text-[#58a6ff]/40" />
        <p className="text-sm">Configure your GitHub API key in Settings to get started.</p>
        <button
          onClick={() => setModule("office")}
          className="rounded-lg bg-[#58a6ff]/15 px-4 py-2 text-xs font-medium text-[#58a6ff] hover:bg-[#58a6ff]/25 transition-colors"
        >
          Open Settings
        </button>
      </div>
    );
  }

  const filteredRepos = search
    ? repos.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : repos;

  return (
    <div className="flex h-full flex-col">
      <GithubHeader
        user={user}
        selectedRepo={selectedRepo}
        onBack={() => { setSelectedRepo(null); setTab("repos"); }}
        search={search}
        onSearch={setSearch}
        onRefresh={() => selectedRepo ? loadRepoDetails(selectedRepo) : loadRepos()}
        loading={loading}
      />

      {error && (
        <div className="mx-6 mt-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {!selectedRepo ? (
        <GithubRepoList repos={filteredRepos} onSelect={setSelectedRepo} loading={loading} />
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 border-b border-white/5 px-6">
            {(["issues", "prs", "commits"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-2 text-xs font-medium capitalize transition-colors border-b-2 ${
                  tab === t
                    ? "border-[#58a6ff] text-[#58a6ff]"
                    : "border-transparent text-text-muted hover:text-text-primary"
                }`}
              >
                {t === "prs" ? "Pull Requests" : t}
                <span className="ml-1.5 text-[10px] text-text-muted">
                  {t === "issues" ? issues.length : t === "prs" ? prs.length : commits.length}
                </span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === "issues" && (
              <GithubIssueList
                issues={issues}
                onNewIssue={() => setIssueModal(true)}
              />
            )}
            {tab === "prs" && <GithubPRList prs={prs} />}
            {tab === "commits" && <GithubCommitList commits={commits} />}
          </div>
        </>
      )}

      {issueModal && selectedRepo && (
        <GithubIssueModal
          token={token}
          owner={selectedRepo.owner.login}
          repo={selectedRepo.name}
          onClose={() => setIssueModal(false)}
          onCreated={() => { setIssueModal(false); loadRepoDetails(selectedRepo); }}
        />
      )}
    </div>
  );
}
