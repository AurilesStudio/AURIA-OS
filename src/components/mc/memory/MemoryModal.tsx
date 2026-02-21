import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import type { MCMemory, MCMemoryCategory } from "@/types/mission-control";

const CATEGORY_OPTIONS: { value: MCMemoryCategory; label: string }[] = [
  { value: "decision", label: "Decision" },
  { value: "learning", label: "Learning" },
  { value: "context", label: "Context" },
  { value: "reference", label: "Reference" },
];

interface MemoryModalProps {
  open: boolean;
  memory: MCMemory | null; // null = create mode
  onClose: () => void;
}

export function MemoryModal({ open, memory, onClose }: MemoryModalProps) {
  const addMemory = useStore((s) => s.addMCMemory);
  const updateMemory = useStore((s) => s.updateMCMemory);
  const removeMemory = useStore((s) => s.removeMCMemory);
  const activeProjectId = useStore((s) => s.activeProjectId);

  const isEdit = memory !== null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<MCMemoryCategory>("context");
  const [source, setSource] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (memory) {
      setTitle(memory.title);
      setContent(memory.content);
      setCategory(memory.category);
      setSource(memory.source);
    } else {
      setTitle("");
      setContent("");
      setCategory("context");
      setSource("");
    }
    setConfirmDelete(false);
  }, [memory, open]);

  const handleSave = () => {
    if (!title.trim()) return;

    if (isEdit) {
      updateMemory(memory.id, {
        title: title.trim(),
        content,
        category,
        source,
      });
    } else {
      addMemory({
        title: title.trim(),
        content,
        category,
        source,
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
    removeMemory(memory.id);
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
                  {isEdit ? "Edit Memory" : "New Memory"}
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
                    placeholder="Memory title..."
                    className={inputClass}
                  />
                </label>

                {/* Category + Source row */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Category</span>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as MCMemoryCategory)}
                      className={selectClass}
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Source</span>
                    <input
                      type="text"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="e.g. conversation, file, import..."
                      className={inputClass}
                    />
                  </label>
                </div>

                {/* Content (markdown) */}
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-text-muted">Content</span>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write the memory content (markdown supported)..."
                    rows={10}
                    className={`resize-none font-mono ${inputClass}`}
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
