import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Loader2, AlertCircle } from "lucide-react";
import { useStore } from "@/store/useStore";
import {
  fetchLinearTeams,
  fetchLinearIssues,
  mapLinearStatus,
  mapLinearPriority,
  type LinearIssue,
  type LinearTeam,
} from "@/lib/linearClient";

interface LinearImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function LinearImportModal({ open, onClose }: LinearImportModalProps) {
  const addMCTask = useStore((s) => s.addMCTask);
  const mcTasks = useStore((s) => s.mcTasks);
  const activeProjectId = useStore((s) => s.activeProjectId);

  const [teams, setTeams] = useState<LinearTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [issues, setIssues] = useState<LinearIssue[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imported, setImported] = useState(0);

  // Existing MC task titles for duplicate detection
  const existingTitles = new Set(mcTasks.map((t) => t.title.toLowerCase()));

  // Load teams on open
  useEffect(() => {
    if (!open) return;
    setError("");
    setIssues([]);
    setSelected(new Set());
    setImported(0);

    setLoading(true);
    fetchLinearTeams()
      .then((t) => {
        setTeams(t);
        if (t.length > 0 && !selectedTeamId) setSelectedTeamId(t[0]!.id);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch issues when team changes
  const loadIssues = useCallback(async () => {
    if (!selectedTeamId) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchLinearIssues(selectedTeamId);
      setIssues(data);
      // Auto-select non-duplicates
      const autoSelect = new Set<string>();
      data.forEach((issue) => {
        if (!existingTitles.has(issue.title.toLowerCase())) {
          autoSelect.add(issue.id);
        }
      });
      setSelected(autoSelect);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  }, [selectedTeamId, existingTitles]);

  useEffect(() => {
    if (open && selectedTeamId) loadIssues();
  }, [selectedTeamId, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === issues.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(issues.map((i) => i.id)));
    }
  };

  const handleImport = () => {
    let count = 0;
    issues.forEach((issue) => {
      if (!selected.has(issue.id)) return;
      addMCTask({
        title: `[${issue.identifier}] ${issue.title}`,
        description: issue.description ?? "",
        status: mapLinearStatus(issue.state.type),
        priority: mapLinearPriority(issue.priority),
        assigneeId: "",
        labels: issue.labels.nodes.map((l) => l.name),
        projectId: activeProjectId,
      });
      count++;
    });
    setImported(count);
    setTimeout(onClose, 800);
  };

  const isDuplicate = (issue: LinearIssue) =>
    existingTitles.has(issue.title.toLowerCase()) ||
    existingTitles.has(`[${issue.identifier}] ${issue.title}`.toLowerCase());

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed left-1/2 top-1/2 z-50 w-[600px] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="overlay-glass rounded-xl border border-white/10 p-6">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-status-idle" />
                  <h2 className="text-sm font-bold text-text-primary">Import from Linear</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-text-muted transition-colors hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Team selector */}
              {teams.length > 1 && (
                <div className="mb-3">
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-white/20"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-3 flex items-center gap-2 rounded border border-neon-red/20 bg-neon-red/5 px-3 py-2 text-xs text-neon-red">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {error}
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
                </div>
              )}

              {/* Success */}
              {imported > 0 && (
                <div className="flex items-center justify-center py-12 text-xs text-status-success">
                  Imported {imported} issue{imported !== 1 ? "s" : ""}
                </div>
              )}

              {/* Issues list */}
              {!loading && !error && imported === 0 && issues.length > 0 && (
                <>
                  <div className="mb-2 flex items-center justify-between">
                    <button
                      onClick={toggleAll}
                      className="text-[10px] text-text-muted transition-colors hover:text-text-primary"
                    >
                      {selected.size === issues.length ? "Deselect all" : "Select all"}
                    </button>
                    <span className="text-[10px] text-text-muted">
                      {selected.size} selected
                    </span>
                  </div>

                  <div className="max-h-[360px] space-y-1 overflow-y-auto pr-1">
                    {issues.map((issue) => {
                      const dup = isDuplicate(issue);
                      return (
                        <label
                          key={issue.id}
                          className={`flex cursor-pointer items-center gap-3 rounded border px-3 py-2 transition-colors ${
                            selected.has(issue.id)
                              ? "border-white/15 bg-white/5"
                              : "border-white/5 hover:border-white/10"
                          } ${dup ? "opacity-50" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={selected.has(issue.id)}
                            onChange={() => toggleSelect(issue.id)}
                            className="accent-mc-accent"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-text-muted">
                                {issue.identifier}
                              </span>
                              <span className="truncate text-xs text-text-primary">
                                {issue.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-text-muted">
                                {issue.state.name}
                              </span>
                              {dup && (
                                <span className="text-[10px] text-trading-amber">
                                  (already imported)
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleImport}
                    disabled={selected.size === 0}
                    className="mt-4 w-full rounded bg-status-idle px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-status-idle/80 disabled:opacity-30"
                  >
                    Import {selected.size} issue{selected.size !== 1 ? "s" : ""}
                  </button>
                </>
              )}

              {/* Empty */}
              {!loading && !error && imported === 0 && issues.length === 0 && selectedTeamId && (
                <p className="py-12 text-center text-xs text-text-muted">
                  No issues found in this team.
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
