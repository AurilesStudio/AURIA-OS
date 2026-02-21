import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import type { MCContentItem, MCContentStage } from "@/types/mission-control";

const STAGE_OPTIONS: { value: MCContentStage; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
];

const PLATFORM_OPTIONS = ["X", "Instagram", "LinkedIn", "TikTok", "YouTube", "Blog"];

interface ContentModalProps {
  open: boolean;
  item: MCContentItem | null; // null = create mode
  defaultStage?: MCContentStage;
  onClose: () => void;
}

/** Convert epoch ms to date input value */
function toDateInput(epoch: number | null): string {
  if (!epoch) return "";
  const d = new Date(epoch);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ContentModal({ open, item, defaultStage, onClose }: ContentModalProps) {
  const addItem = useStore((s) => s.addMCContentItem);
  const updateItem = useStore((s) => s.updateMCContentItem);
  const removeItem = useStore((s) => s.removeMCContentItem);
  const activeProjectId = useStore((s) => s.activeProjectId);

  const isEdit = item !== null;

  const [title, setTitle] = useState("");
  const [stage, setStage] = useState<MCContentStage>(defaultStage ?? "idea");
  const [platform, setPlatform] = useState("X");
  const [script, setScript] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Character limits per platform
  const charLimits: Record<string, number> = {
    X: 280,
    Instagram: 2200,
    LinkedIn: 3000,
    TikTok: 2200,
    YouTube: 5000,
    Blog: 50000,
  };
  const charLimit = charLimits[platform] ?? 5000;
  const charCount = script.length;
  const charOver = charCount > charLimit;

  // Reset form when item/open changes
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setStage(item.stage);
      setPlatform(item.platform);
      setScript(item.script);
      setScheduledDate(toDateInput(item.scheduledDate));
    } else {
      setTitle("");
      setStage(defaultStage ?? "idea");
      setPlatform("X");
      setScript("");
      setScheduledDate("");
    }
    setConfirmDelete(false);
  }, [item, open, defaultStage]);

  const handleSave = () => {
    if (!title.trim()) return;

    const schedMs = scheduledDate ? new Date(scheduledDate).getTime() : null;

    if (isEdit) {
      updateItem(item.id, {
        title: title.trim(),
        stage,
        platform,
        script,
        scheduledDate: schedMs,
      });
    } else {
      addItem({
        title: title.trim(),
        stage,
        platform,
        script,
        mediaUrls: [],
        scheduledDate: schedMs,
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
    removeItem(item.id);
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
                  {isEdit ? "Edit Content" : "New Content"}
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
                    placeholder="Content title..."
                    className={inputClass}
                  />
                </label>

                {/* Stage + Platform row */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Stage</span>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value as MCContentStage)}
                      className={selectClass}
                    >
                      {STAGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Platform</span>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className={selectClass}
                    >
                      {PLATFORM_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Script editor */}
                <label className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-text-muted">Script</span>
                    <span
                      className={`text-[10px] ${charOver ? "font-bold text-red-400" : "text-text-muted"}`}
                    >
                      {charCount}/{charLimit}
                    </span>
                  </div>
                  <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Write your content script..."
                    rows={6}
                    className={`resize-none font-mono ${inputClass}`}
                  />
                </label>

                {/* Scheduled date */}
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-text-muted">Scheduled Date</span>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
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
