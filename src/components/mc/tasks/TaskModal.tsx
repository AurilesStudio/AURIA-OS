import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import type { MCTask, MCTaskStatus, MCTaskPriority } from "@/types/mission-control";

const STATUS_OPTIONS: { value: MCTaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
];

const PRIORITY_OPTIONS: { value: MCTaskPriority; label: string }[] = [
  { value: "none", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

interface TaskModalProps {
  open: boolean;
  task: MCTask | null; // null = create mode
  defaultStatus?: MCTaskStatus;
  onClose: () => void;
}

export function TaskModal({ open, task, defaultStatus, onClose }: TaskModalProps) {
  const addMCTask = useStore((s) => s.addMCTask);
  const updateMCTask = useStore((s) => s.updateMCTask);
  const removeMCTask = useStore((s) => s.removeMCTask);
  const avatars = useStore((s) => s.avatars);
  const activeProjectId = useStore((s) => s.activeProjectId);

  const isEdit = task !== null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<MCTaskStatus>(defaultStatus ?? "backlog");
  const [priority, setPriority] = useState<MCTaskPriority>("none");
  const [assigneeId, setAssigneeId] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset form when task/open changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId);
      setLabels([...task.labels]);
    } else {
      setTitle("");
      setDescription("");
      setStatus(defaultStatus ?? "backlog");
      setPriority("none");
      setAssigneeId("");
      setLabels([]);
    }
    setLabelInput("");
    setConfirmDelete(false);
  }, [task, open, defaultStatus]);

  const handleSave = () => {
    if (!title.trim()) return;

    if (isEdit) {
      updateMCTask(task.id, {
        title: title.trim(),
        description,
        status,
        priority,
        assigneeId,
        labels,
      });
    } else {
      addMCTask({
        title: title.trim(),
        description,
        status,
        priority,
        assigneeId,
        labels,
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
    removeMCTask(task.id);
    onClose();
  };

  const addLabel = () => {
    const val = labelInput.trim();
    if (val && !labels.includes(val)) {
      setLabels([...labels, val]);
    }
    setLabelInput("");
  };

  const removeLabel = (label: string) => {
    setLabels(labels.filter((l) => l !== label));
  };

  const selectClass =
    "rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-white/20";

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
                  {isEdit ? "Edit Task" : "New Task"}
                </h2>
                <button
                  onClick={onClose}
                  className="text-text-muted transition-colors hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Title */}
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-text-muted">Title</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task title..."
                    className="rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
                  />
                </label>

                {/* Description */}
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-text-muted">Description</span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the task..."
                    rows={3}
                    className="resize-none rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
                  />
                </label>

                {/* Status + Priority row */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Status</span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as MCTaskStatus)}
                      className={selectClass}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Priority</span>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as MCTaskPriority)}
                      className={selectClass}
                    >
                      {PRIORITY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Assignee */}
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-text-muted">Assignee</span>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Unassigned</option>
                    {avatars.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Labels */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-text-muted">Labels</span>
                  {labels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {labels.map((label) => (
                        <span
                          key={label}
                          className="flex items-center gap-1 rounded bg-white/8 px-2 py-0.5 text-[10px] text-text-muted"
                        >
                          {label}
                          <button
                            onClick={() => removeLabel(label)}
                            className="text-text-muted/60 hover:text-text-primary"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addLabel();
                        }
                      }}
                      placeholder="Add label..."
                      className="flex-1 rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
                    />
                    <button
                      onClick={addLabel}
                      className="rounded border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-text-muted transition-colors hover:bg-white/10 hover:text-text-primary"
                    >
                      +
                    </button>
                  </div>
                </div>

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
                    disabled={!title.trim()}
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
