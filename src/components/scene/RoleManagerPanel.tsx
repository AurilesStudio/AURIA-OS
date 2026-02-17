import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Shield } from "lucide-react";
import { useStore } from "@/store/useStore";
import { SKILLS } from "@/types";

export function RoleManagerPanel() {
  const [open, setOpen] = useState(false);
  const roles = useStore((s) => s.roles);
  const addRole = useStore((s) => s.addRole);
  const updateRole = useStore((s) => s.updateRole);
  const removeRole = useStore((s) => s.removeRole);

  const [newRoleName, setNewRoleName] = useState("");

  const handleAddRole = () => {
    const name = newRoleName.trim() || `Role ${roles.length + 1}`;
    addRole({ name, skillIds: [], systemPrompt: "" });
    setNewRoleName("");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="overlay-glass flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-text-muted transition-colors hover:text-text-primary"
      >
        <Shield className="h-3.5 w-3.5" />
        Roles ({roles.length})
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 w-80"
          >
            <div className="overlay-glass rounded-lg border border-white/10 p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-neon-red" />
                  <span className="text-xs font-bold text-text-primary">Role Manager</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-text-muted transition-colors hover:text-text-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Role list */}
              <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
                {roles.map((role) => (
                  <RoleCard
                    key={role.id}
                    name={role.name}
                    skillIds={role.skillIds}
                    systemPrompt={role.systemPrompt}
                    onUpdateName={(name) => updateRole(role.id, { name })}
                    onToggleSkill={(skillId) => {
                      const has = role.skillIds.includes(skillId);
                      updateRole(role.id, {
                        skillIds: has
                          ? role.skillIds.filter((s) => s !== skillId)
                          : [...role.skillIds, skillId],
                      });
                    }}
                    onUpdatePrompt={(systemPrompt) => updateRole(role.id, { systemPrompt })}
                    onRemove={() => removeRole(role.id)}
                  />
                ))}
              </div>

              {/* Add role */}
              <div className="mt-2 flex gap-1.5">
                <input
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddRole();
                  }}
                  placeholder="New role name..."
                  className="min-w-0 flex-1 rounded border border-white/10 bg-bg-base/50 px-2 py-1 text-xs text-text-primary outline-none placeholder:text-text-muted/50"
                />
                <button
                  onClick={handleAddRole}
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

function RoleCard({
  name,
  skillIds,
  systemPrompt,
  onUpdateName,
  onToggleSkill,
  onUpdatePrompt,
  onRemove,
}: {
  name: string;
  skillIds: string[];
  systemPrompt: string;
  onUpdateName: (name: string) => void;
  onToggleSkill: (skillId: string) => void;
  onUpdatePrompt: (prompt: string) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded border border-white/5 bg-bg-base/30">
      {/* Header row */}
      <div className="flex items-center gap-2 px-2 py-1.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="min-w-0 flex-1 text-left"
        >
          <span className="text-[11px] font-medium text-text-primary">{name}</span>
          <span className="ml-2 text-[9px] text-text-muted">
            {skillIds.length} skill{skillIds.length !== 1 ? "s" : ""}
          </span>
        </button>
        <button
          onClick={onRemove}
          className="rounded p-1 text-text-muted transition-colors hover:bg-neon-red/10 hover:text-neon-red"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="border-t border-white/5 px-2 py-2">
          {/* Name */}
          <label className="mb-2 flex flex-col gap-1">
            <span className="text-[9px] uppercase text-text-muted">Name</span>
            <input
              value={name}
              onChange={(e) => onUpdateName(e.target.value)}
              className="rounded border border-white/10 bg-bg-base/50 px-2 py-1 text-[10px] text-text-primary outline-none focus:border-white/20"
            />
          </label>

          {/* Skills */}
          <div className="mb-2 flex flex-col gap-1">
            <span className="text-[9px] uppercase text-text-muted">Skills</span>
            <div className="flex flex-wrap gap-1">
              {SKILLS.map((skill) => {
                const active = skillIds.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    onClick={() => onToggleSkill(skill.id)}
                    className="rounded px-1.5 py-0.5 text-[9px] font-bold leading-tight transition-colors"
                    style={
                      active
                        ? { backgroundColor: skill.color, color: "#fff" }
                        : {
                            backgroundColor: "transparent",
                            border: `1px solid ${skill.color}44`,
                            color: `${skill.color}88`,
                          }
                    }
                    title={skill.name}
                  >
                    {skill.icon}
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Prompt */}
          <label className="flex flex-col gap-1">
            <span className="text-[9px] uppercase text-text-muted">System Prompt</span>
            <textarea
              value={systemPrompt}
              onChange={(e) => onUpdatePrompt(e.target.value)}
              placeholder="Instructions for agents with this role..."
              rows={3}
              className="resize-y rounded border border-white/10 bg-bg-base/50 px-2 py-1 text-[10px] text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
            />
          </label>
        </div>
      )}
    </div>
  );
}
