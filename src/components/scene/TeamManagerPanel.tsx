import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Save, Rocket, Plus, Trash2, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import { TeamTemplateEditor } from "./TeamTemplateEditor";

export function TeamManagerPanel() {
  const [open, setOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [saveName, setSaveName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  const activeProjectId = useStore((s) => s.activeProjectId);
  const teamTemplates = useStore((s) => s.teamTemplates);
  const deployTeamToProject = useStore((s) => s.deployTeamToProject);
  const saveProjectTeamAsTemplate = useStore((s) => s.saveProjectTeamAsTemplate);
  const removeTeamTemplate = useStore((s) => s.removeTeamTemplate);

  const handleSaveTeam = () => {
    if (!saveName.trim()) return;
    saveProjectTeamAsTemplate(activeProjectId, saveName.trim());
    setSaveName("");
    setShowSaveInput(false);
  };

  const handleDeploy = (templateId: string) => {
    deployTeamToProject(templateId, activeProjectId);
    setOpen(false);
  };

  const handleNewTemplate = () => {
    setEditingTemplateId(null);
    setEditorOpen(true);
  };

  const handleEditTemplate = (templateId: string) => {
    setEditingTemplateId(templateId);
    setEditorOpen(true);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="overlay-glass flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-text-muted transition-colors hover:text-text-primary"
        >
          <Users className="h-3.5 w-3.5" />
          Team
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 w-72"
            >
              <div className="overlay-glass rounded-lg border border-white/10 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-neon-red" />
                    <span className="text-xs font-bold text-text-primary">Team Manager</span>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-text-muted transition-colors hover:text-text-primary"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Save current team */}
                {!showSaveInput ? (
                  <button
                    onClick={() => setShowSaveInput(true)}
                    className="mb-2 flex w-full items-center gap-2 rounded border border-white/5 bg-bg-base/30 px-2.5 py-2 text-[10px] text-text-muted transition-colors hover:border-white/10 hover:text-text-primary"
                  >
                    <Save className="h-3 w-3" />
                    Save current team as template
                  </button>
                ) : (
                  <div className="mb-2 flex gap-1">
                    <input
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveTeam()}
                      placeholder="Template name..."
                      autoFocus
                      className="min-w-0 flex-1 rounded border border-white/10 bg-bg-base/50 px-2 py-1.5 text-[10px] text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
                    />
                    <button
                      onClick={handleSaveTeam}
                      disabled={!saveName.trim()}
                      className="rounded bg-neon-red/80 px-2 py-1 text-[10px] font-bold text-white transition-colors hover:bg-neon-red disabled:opacity-30"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setShowSaveInput(false); setSaveName(""); }}
                      className="rounded border border-white/10 px-2 py-1 text-[10px] text-text-muted transition-colors hover:text-text-primary"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* New template button */}
                <button
                  onClick={handleNewTemplate}
                  className="mb-3 flex w-full items-center gap-2 rounded border border-dashed border-white/10 bg-bg-base/20 px-2.5 py-2 text-[10px] text-text-muted transition-colors hover:border-white/20 hover:text-text-primary"
                >
                  <Plus className="h-3 w-3" />
                  Create new template
                </button>

                {/* Templates list */}
                {teamTemplates.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] uppercase text-text-muted">Saved Templates</span>
                    {teamTemplates.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="flex items-center gap-2 rounded border border-white/5 bg-bg-base/30 px-2.5 py-2"
                      >
                        <button
                          onClick={() => handleEditTemplate(tpl.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="truncate text-[11px] font-medium text-text-primary">
                            {tpl.name}
                          </div>
                          <div className="text-[9px] text-text-muted">
                            {tpl.slots.length} agent{tpl.slots.length !== 1 ? "s" : ""}
                          </div>
                        </button>
                        <button
                          onClick={() => handleDeploy(tpl.id)}
                          title="Deploy to current project"
                          className="rounded bg-status-success/20 p-1.5 text-status-success transition-colors hover:bg-status-success/30"
                        >
                          <Rocket className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeTeamTemplate(tpl.id)}
                          title="Delete template"
                          className="rounded p-1.5 text-text-muted transition-colors hover:bg-neon-red/10 hover:text-neon-red"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-2 text-center text-[10px] text-text-muted">
                    No templates yet
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Team Template Editor Modal */}
      <TeamTemplateEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        templateId={editingTemplateId}
      />
    </>
  );
}
