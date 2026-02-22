import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/store/useStore";
import {
  isLinearConfigured,
  fetchLinearTeams,
  fetchLinearIssues,
  fetchLinearProjects,
  fetchLinearCycles,
} from "@/lib/linearClient";
import type { LinearTeam, LinearIssue, LinearProject, LinearCycle } from "@/lib/linearClient";
import { LinearHeader } from "../linear/LinearHeader";
import { LinearIssueList } from "../linear/LinearIssueList";
import { LinearProjectList } from "../linear/LinearProjectList";
import { LinearCycleList } from "../linear/LinearCycleList";
import { LinearIssueModal } from "../linear/LinearIssueModal";
import { Settings } from "lucide-react";

type Tab = "issues" | "projects" | "cycles";

export function MCLinearModule() {
  const setModule = useStore((s) => s.setMCActiveModule);

  const [teams, setTeams] = useState<LinearTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<LinearTeam | null>(null);
  const [issues, setIssues] = useState<LinearIssue[]>([]);
  const [projects, setProjects] = useState<LinearProject[]>([]);
  const [cycles, setCycles] = useState<LinearCycle[]>([]);
  const [tab, setTab] = useState<Tab>("issues");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issueModal, setIssueModal] = useState(false);
  const [search, setSearch] = useState("");

  const configured = isLinearConfigured();

  const loadTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const t = await fetchLinearTeams();
      setTeams(t);
      if (t.length > 0 && !selectedTeam) setSelectedTeam(t[0] ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, [selectedTeam]);

  const loadData = useCallback(async () => {
    if (!selectedTeam) return;
    setLoading(true);
    setError(null);
    try {
      const [i, p, c] = await Promise.all([
        fetchLinearIssues(selectedTeam.id),
        fetchLinearProjects(),
        fetchLinearCycles(selectedTeam.id),
      ]);
      setIssues(i);
      setProjects(p);
      setCycles(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (configured) loadTeams();
  }, [configured, loadTeams]);

  useEffect(() => {
    if (selectedTeam) loadData();
  }, [selectedTeam, loadData]);

  if (!configured) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-text-muted">
        <Settings className="h-10 w-10 text-[#818cf8]/40" />
        <p className="text-sm">Configure your Linear API key in Settings to get started.</p>
        <button
          onClick={() => setModule("office")}
          className="rounded-lg bg-[#818cf8]/15 px-4 py-2 text-xs font-medium text-[#818cf8] hover:bg-[#818cf8]/25 transition-colors"
        >
          Open Settings
        </button>
      </div>
    );
  }

  const filteredIssues = search
    ? issues.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()) || i.identifier.toLowerCase().includes(search.toLowerCase()))
    : issues;

  return (
    <div className="flex h-full flex-col">
      <LinearHeader
        teams={teams}
        selectedTeam={selectedTeam}
        onSelectTeam={setSelectedTeam}
        search={search}
        onSearch={setSearch}
        onRefresh={loadData}
        loading={loading}
      />

      {error && (
        <div className="mx-6 mt-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5 px-6">
        {(["issues", "projects", "cycles"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-xs font-medium capitalize transition-colors border-b-2 ${
              tab === t
                ? "border-[#818cf8] text-[#818cf8]"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            {t}
            <span className="ml-1.5 text-[10px] text-text-muted">
              {t === "issues" ? filteredIssues.length : t === "projects" ? projects.length : cycles.length}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "issues" && (
          <LinearIssueList
            issues={filteredIssues}
            onNewIssue={() => setIssueModal(true)}
          />
        )}
        {tab === "projects" && <LinearProjectList projects={projects} />}
        {tab === "cycles" && <LinearCycleList cycles={cycles} />}
      </div>

      {issueModal && selectedTeam && (
        <LinearIssueModal
          teamId={selectedTeam.id}
          onClose={() => setIssueModal(false)}
          onCreated={() => { setIssueModal(false); loadData(); }}
        />
      )}
    </div>
  );
}
