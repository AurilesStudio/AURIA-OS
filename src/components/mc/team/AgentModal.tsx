import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import type { MCTeamAgent, MCTeamAgentStatus } from "@/types/mission-control";

const STATUS_OPTIONS: { value: MCTeamAgentStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "idle", label: "Idle" },
  { value: "offline", label: "Offline" },
];

interface AgentModalProps {
  open: boolean;
  agent: MCTeamAgent | null; // null = create mode
  onClose: () => void;
}

export function AgentModal({ open, agent, onClose }: AgentModalProps) {
  const addAgent = useStore((s) => s.addMCTeamAgent);
  const updateAgent = useStore((s) => s.updateMCTeamAgent);
  const removeAgent = useStore((s) => s.removeMCTeamAgent);
  const activeProjectId = useStore((s) => s.activeProjectId);

  const isEdit = agent !== null;

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [status, setStatus] = useState<MCTeamAgentStatus>("idle");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setRole(agent.role);
      setResponsibilities(agent.responsibilities);
      setStatus(agent.status);
      setAvatarUrl(agent.avatarUrl);
    } else {
      setName("");
      setRole("");
      setResponsibilities("");
      setStatus("idle");
      setAvatarUrl("");
    }
    setConfirmDelete(false);
  }, [agent, open]);

  const handleSave = () => {
    if (!name.trim()) return;

    if (isEdit) {
      updateAgent(agent.id, {
        name: name.trim(),
        role,
        responsibilities,
        status,
        avatarUrl,
      });
    } else {
      addAgent({
        name: name.trim(),
        role,
        responsibilities,
        status,
        avatarUrl,
        taskHistory: [],
        projectId: activeProjectId,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!isEdit) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    removeAgent(agent.id);
    onClose();
  };

  const selectClass =
    "rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-white/20";
  const inputClass =
    "rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed left-1/2 top-1/2 z-50 w-[560px] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="overlay-glass rounded-xl border border-white/10 p-6">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-bold text-text-primary">
                  {isEdit ? "Edit Agent" : "New Agent"}
                </h2>
                <button
                  onClick={onClose}
                  className="text-text-muted transition-colors hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Name */}
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-text-muted">Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Agent name..."
                    className={inputClass}
                  />
                </label>

                {/* Role + Status row */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Role</span>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Dev Agent, Content Writer..."
                      className={inputClass}
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Status</span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as MCTeamAgentStatus)}
                      className={selectClass}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Responsibilities */}
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-text-muted">Responsibilities</span>
                  <textarea
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    placeholder="Describe what this agent is responsible for..."
                    rows={4}
                    className={`resize-none ${inputClass}`}
                  />
                </label>

                {/* Avatar URL */}
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-text-muted">Avatar URL</span>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </label>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {isEdit && (
                    <button
                      onClick={handleDelete}
                      className={`flex items-center gap-1.5 rounded px-3 py-2 text-xs font-semibold transition-colors ${
                        confirmDelete
                          ? "bg-red-500/20 text-red-400"
                          : "text-red-400/60 hover:text-red-400"
                      }`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {confirmDelete ? "Confirm Delete" : "Delete"}
                    </button>
                  )}

                  <div className="flex-1" />

                  <button
                    onClick={onClose}
                    className="rounded px-4 py-2 text-xs text-text-muted transition-colors hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!name.trim()}
                    className="rounded bg-mc-accent px-4 py-2 text-xs font-bold text-bg-base transition-colors hover:bg-mc-accent/80 disabled:opacity-30"
                  >
                    {isEdit ? "Save" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
