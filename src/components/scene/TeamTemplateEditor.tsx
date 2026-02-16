import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useStore } from "@/store/useStore";
import {
  CHARACTER_CATALOG,
  AVATAR_PROVIDER_LABELS,
  ROLE_SUGGESTIONS,
} from "@/types";
import type { LLMProvider, TeamSlot } from "@/types";

interface TeamTemplateEditorProps {
  open: boolean;
  onClose: () => void;
  templateId: string | null;
}

function emptySlot(roomId: string): TeamSlot {
  return {
    roomId,
    characterId: CHARACTER_CATALOG[0]?.id ?? "",
    provider: "claude" as LLMProvider,
    roleTitle: "",
    systemPrompt: "",
  };
}

export function TeamTemplateEditor({ open, onClose, templateId }: TeamTemplateEditorProps) {
  const rooms = useStore((s) => s.rooms);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const projectRooms = rooms.filter((r) => r.projectId === activeProjectId);
  const teamTemplates = useStore((s) => s.teamTemplates);
  const addTeamTemplate = useStore((s) => s.addTeamTemplate);
  const updateTeamTemplate = useStore((s) => s.updateTeamTemplate);

  const [name, setName] = useState("");
  const [slots, setSlots] = useState<TeamSlot[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Init form state
  useEffect(() => {
    if (!open) return;
    if (templateId) {
      const tpl = teamTemplates.find((t) => t.id === templateId);
      if (tpl) {
        setName(tpl.name);
        setSlots(tpl.slots.map((s) => ({ ...s })));
        return;
      }
    }
    // New template: one slot per project room
    setName("");
    setSlots(projectRooms.map((r) => emptySlot(r.id)));
  }, [open, templateId]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateSlot = (idx: number, data: Partial<TeamSlot>) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, ...data } : s)));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (templateId) {
      updateTeamTemplate(templateId, { name: name.trim(), slots });
    } else {
      addTeamTemplate({ name: name.trim(), slots });
    }
    onClose();
  };

  const roomLabel = (roomId: string) =>
    projectRooms.find((r) => r.id === roomId)?.label ?? roomId;

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
            className="fixed left-1/2 top-1/2 z-50 w-[720px] max-h-[85vh] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="overlay-glass flex flex-col rounded-xl border border-white/10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                <div>
                  <h2 className="text-sm font-bold text-text-primary">
                    {templateId ? "Edit Template" : "New Team Template"}
                  </h2>
                  <p className="text-[10px] text-text-muted">
                    Configure one agent per room
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-text-muted transition-colors hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Template Name */}
              <div className="border-b border-white/5 px-6 py-3">
                <label className="flex items-center gap-3">
                  <span className="text-[10px] uppercase text-text-muted whitespace-nowrap">
                    Template Name
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Dream Team"
                    className="min-w-0 flex-1 rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
                  />
                </label>
              </div>

              {/* Slots */}
              <div className="flex-1 overflow-y-auto px-6 py-3">
                <div className="flex flex-col gap-1.5">
                  {slots.map((slot, idx) => {
                    const isExpanded = expandedIdx === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded border border-white/5 bg-bg-base/30"
                      >
                        {/* Slot header row */}
                        <button
                          onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                          className="flex w-full items-center gap-3 px-3 py-2"
                        >
                          <span className="w-40 truncate text-left text-[11px] font-medium text-text-primary">
                            {roomLabel(slot.roomId)}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {CHARACTER_CATALOG.find((c) => c.id === slot.characterId)?.name ?? "—"}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {AVATAR_PROVIDER_LABELS[slot.provider]}
                          </span>
                          <span className="flex-1 truncate text-right text-[10px] text-text-muted">
                            {slot.roleTitle || "No role"}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3 text-text-muted" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-text-muted" />
                          )}
                        </button>

                        {/* Expanded editor */}
                        {isExpanded && (
                          <div className="border-t border-white/5 px-3 py-3">
                            <div className="grid grid-cols-3 gap-3">
                              {/* Character */}
                              <label className="flex flex-col gap-1">
                                <span className="text-[9px] uppercase text-text-muted">Character</span>
                                <select
                                  value={slot.characterId}
                                  onChange={(e) => updateSlot(idx, { characterId: e.target.value })}
                                  className="rounded border border-white/10 bg-bg-base/50 px-2 py-1.5 text-[10px] text-text-primary outline-none focus:border-white/20"
                                >
                                  {CHARACTER_CATALOG.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              {/* Provider */}
                              <label className="flex flex-col gap-1">
                                <span className="text-[9px] uppercase text-text-muted">Provider</span>
                                <select
                                  value={slot.provider}
                                  onChange={(e) => updateSlot(idx, { provider: e.target.value as LLMProvider })}
                                  className="rounded border border-white/10 bg-bg-base/50 px-2 py-1.5 text-[10px] text-text-primary outline-none focus:border-white/20"
                                >
                                  {(Object.entries(AVATAR_PROVIDER_LABELS) as [LLMProvider, string][]).map(
                                    ([key, label]) => (
                                      <option key={key} value={key}>
                                        {label}
                                      </option>
                                    ),
                                  )}
                                </select>
                              </label>

                              {/* Role */}
                              <label className="flex flex-col gap-1">
                                <span className="text-[9px] uppercase text-text-muted">Role</span>
                                <input
                                  value={slot.roleTitle}
                                  onChange={(e) => updateSlot(idx, { roleTitle: e.target.value })}
                                  list={`tpl-role-${idx}`}
                                  placeholder="Ex: CTO"
                                  className="rounded border border-white/10 bg-bg-base/50 px-2 py-1.5 text-[10px] text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
                                />
                                <datalist id={`tpl-role-${idx}`}>
                                  {ROLE_SUGGESTIONS.map((r) => (
                                    <option key={r} value={r} />
                                  ))}
                                </datalist>
                              </label>
                            </div>

                            {/* System Prompt */}
                            <label className="mt-2 flex flex-col gap-1">
                              <span className="text-[9px] uppercase text-text-muted">System Prompt</span>
                              <textarea
                                value={slot.systemPrompt}
                                onChange={(e) => updateSlot(idx, { systemPrompt: e.target.value })}
                                placeholder="Instructions for the LLM agent..."
                                rows={3}
                                className="resize-y rounded border border-white/10 bg-bg-base/50 px-2 py-1.5 text-[10px] text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-white/5 px-6 py-3">
                <button
                  onClick={onClose}
                  className="rounded border border-white/10 px-4 py-1.5 text-[10px] font-bold uppercase text-text-muted transition-colors hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!name.trim()}
                  className="rounded bg-neon-red px-4 py-1.5 text-[10px] font-bold uppercase text-white transition-colors hover:bg-neon-red/90 disabled:opacity-30"
                >
                  {templateId ? "Update" : "Create"} Template
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
