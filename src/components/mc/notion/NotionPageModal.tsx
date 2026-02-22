import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createNotionPage } from "@/lib/notionClient";
import type { NotionDatabase } from "@/lib/notionClient";

interface Props {
  token: string;
  database: NotionDatabase;
  onClose: () => void;
  onCreated: () => void;
}

export function NotionPageModal({ token, database, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find the title property name
  const titleProp = Object.entries(database.properties).find(([, v]) => v.type === "title");
  const titlePropName = titleProp?.[0] ?? "Name";

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createNotionPage(
        token,
        { database_id: database.id },
        {
          [titlePropName]: {
            title: [{ text: { content: title.trim() } }],
          },
        },
      );
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create page");
    } finally {
      setSubmitting(false);
    }
  };

  const dbTitle = database.title.map((t) => t.plain_text).join("") || "Untitled";

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
            <div>
              <h2 className="text-sm font-semibold text-text-primary">New Page</h2>
              <p className="text-[10px] text-text-muted">in {dbTitle}</p>
            </div>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase text-text-muted">{titlePropName}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Page title..."
                className="w-full rounded-md border border-white/10 bg-bg-base/50 px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/40 outline-none focus:border-[#e0e0e0]/50"
                autoFocus
              />
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
              className="rounded-lg bg-white/10 px-4 py-2 text-xs font-medium text-[#e0e0e0] hover:bg-white/15 transition-colors disabled:opacity-40"
            >
              {submitting ? "Creating..." : "Create Page"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
