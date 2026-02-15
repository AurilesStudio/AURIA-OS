import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderKanban, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { useStore } from "@/store/useStore";

export function ProjectSelector() {
  const workspaceProjects = useStore((s) => s.workspaceProjects);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const setActiveProjectId = useStore((s) => s.setActiveProjectId);
  const addProject = useStore((s) => s.addProject);
  const renameProject = useStore((s) => s.renameProject);
  const removeProject = useStore((s) => s.removeProject);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newName, setNewName] = useState("");

  const activeProject = workspaceProjects.find((p) => p.id === activeProjectId);

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const confirmRename = () => {
    if (editingId && editValue.trim()) {
      renameProject(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    addProject(name);
    setNewName("");
  };

  const handleSwitch = (id: string) => {
    setActiveProjectId(id);
  };

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="overlay-glass flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-text-muted transition-colors hover:text-text-primary"
      >
        <FolderKanban className="h-3.5 w-3.5" />
        {activeProject?.name ?? "Project"}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-10 left-0 w-64"
          >
            <div className="overlay-glass rounded-lg border border-white/10 p-3">
              <div className="mb-2 text-[10px] font-bold uppercase text-text-muted">
                Projects
              </div>

              {/* Project list */}
              <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                {workspaceProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`flex items-center gap-1.5 rounded border px-2 py-1.5 transition-colors cursor-pointer ${
                      project.id === activeProjectId
                        ? "border-white/20 bg-white/5"
                        : "border-white/5 bg-bg-base/30 hover:border-white/10"
                    }`}
                    onClick={() => {
                      if (editingId !== project.id) handleSwitch(project.id);
                    }}
                  >
                    {/* Active indicator */}
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        project.id === activeProjectId ? "bg-neon-cyan" : "bg-white/20"
                      }`}
                    />

                    {editingId === project.id ? (
                      <>
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmRename();
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="min-w-0 flex-1 bg-transparent text-xs text-text-primary outline-none"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); confirmRename(); }}
                          className="text-status-success hover:brightness-125"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                          className="text-text-muted hover:text-text-primary"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 truncate text-xs text-text-primary">
                          {project.name}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); startRename(project.id, project.name); }}
                          className="text-text-muted hover:text-text-primary"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        {workspaceProjects.length > 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeProject(project.id); }}
                            className="text-text-muted hover:text-neon-red"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add project */}
              <div className="mt-2 flex gap-1.5">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                  }}
                  placeholder="New project..."
                  className="min-w-0 flex-1 rounded border border-white/10 bg-bg-base/50 px-2 py-1 text-xs text-text-primary outline-none placeholder:text-text-muted/50"
                />
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-1 rounded border border-white/10 bg-bg-base/50 px-2 py-1 text-xs text-text-muted transition-colors hover:text-text-primary"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
