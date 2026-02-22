import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createLinearIssue } from "@/lib/linearClient";

interface Props {
  teamId: string;
  onClose: () => void;
  onCreated: () => void;
}

export function LinearIssueModal({ teamId, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createLinearIssue({
        title: title.trim(),
        description: description.trim() || undefined,
        teamId,
        priority: priority || undefined,
      });
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create issue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-[560px] max-h-[80vh] overflow-y-auto overlay-glass rounded-2xl border border-white/10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-3">
            <h2 className="text-sm font-semibold text-text-primary">New Issue</h2>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase text-text-muted">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Issue title..."
                className="w-full rounded-md border border-white/10 bg-bg-base/50 px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/40 outline-none focus:border-[#818cf8]/50"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase text-text-muted">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue..."
                rows={6}
                className="w-full rounded-md border border-white/10 bg-bg-base/50 px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/40 outline-none focus:border-[#818cf8]/50 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase text-text-muted">Priority</label>
              <div className="flex gap-2">
                {[
                  { value: 0, label: "None", color: "bg-gray-500" },
                  { value: 1, label: "Urgent", color: "bg-red-500" },
                  { value: 2, label: "High", color: "bg-orange-500" },
                  { value: 3, label: "Medium", color: "bg-yellow-500" },
                  { value: 4, label: "Low", color: "bg-blue-400" },
                ].map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] transition-colors ${
                      priority === p.value
                        ? "bg-[#818cf8]/15 text-[#818cf8] border border-[#818cf8]/30"
                        : "bg-white/5 text-text-muted border border-transparent hover:bg-white/10"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${p.color}`} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">{error}</div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-white/5 px-6 py-3">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || submitting}
              className="rounded-lg bg-[#818cf8]/15 px-4 py-2 text-xs font-medium text-[#818cf8] hover:bg-[#818cf8]/25 transition-colors disabled:opacity-40"
            >
              {submitting ? "Creating..." : "Create Issue"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
