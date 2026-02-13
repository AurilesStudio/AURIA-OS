import { motion, AnimatePresence } from "framer-motion";
import { X, Wrench } from "lucide-react";
import { useStore } from "@/store/useStore";
import { SKILLS } from "@/types";

export function SkillsAssignmentPanel() {
  const open = useStore((s) => s.skillsPanelOpen);
  const setOpen = useStore((s) => s.setSkillsPanelOpen);
  const rooms = useStore((s) => s.rooms);
  const toggleRoomSkill = useStore((s) => s.toggleRoomSkill);

  // Only show skills that are installed (assigned to at least 1 room)
  const installedSkills = SKILLS.filter((skill) =>
    rooms.some((r) => r.skillIds?.includes(skill.id)),
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed left-1/2 top-1/2 z-50 w-[480px] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="overlay-glass flex flex-col rounded-xl border border-white/10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <Wrench className="h-4 w-4 text-neon-purple" />
                  <div>
                    <h2 className="text-sm font-bold text-text-primary">
                      Skills Toolbox
                    </h2>
                    <p className="text-[10px] text-text-muted">
                      {installedSkills.length} skill{installedSkills.length !== 1 ? "s" : ""} installed
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-text-muted transition-colors hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Installed skills with room toggles */}
              <div className="flex max-h-[400px] flex-col gap-3 overflow-y-auto px-5 py-4">
                {installedSkills.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                    <Wrench className="h-8 w-8 text-text-muted/20" />
                    <p className="text-[11px] text-text-muted">
                      No skills installed yet.
                    </p>
                    <p className="text-[10px] text-text-muted/60">
                      Use the Room Manager to install skills on a room first.
                    </p>
                  </div>
                ) : (
                  installedSkills.map((skill) => {
                    const assignedRoomIds = new Set(
                      rooms
                        .filter((r) => r.skillIds?.includes(skill.id))
                        .map((r) => r.id),
                    );

                    return (
                      <div key={skill.id} className="rounded-lg border border-white/5 bg-bg-base/30">
                        {/* Skill header */}
                        <div className="flex items-center gap-2.5 px-3 py-2">
                          <span
                            className="inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold leading-tight text-white"
                            style={{ backgroundColor: skill.color }}
                          >
                            {skill.icon}
                          </span>
                          <span className="text-xs font-semibold text-text-primary">
                            {skill.name}
                          </span>
                          <span className="ml-auto text-[9px] text-text-muted">
                            {assignedRoomIds.size} room{assignedRoomIds.size !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Room toggles */}
                        <div className="border-t border-white/5 px-3 py-2">
                          <div className="flex flex-wrap gap-1.5">
                            {rooms.map((room) => {
                              const assigned = assignedRoomIds.has(room.id);
                              return (
                                <button
                                  key={room.id}
                                  onClick={() => toggleRoomSkill(room.id, skill.id)}
                                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] transition-colors"
                                  style={
                                    assigned
                                      ? {
                                          backgroundColor: `${skill.color}20`,
                                          border: `1px solid ${skill.color}55`,
                                          color: skill.color,
                                        }
                                      : {
                                          backgroundColor: "transparent",
                                          border: "1px solid rgba(255,255,255,0.08)",
                                          color: "rgba(255,255,255,0.35)",
                                        }
                                  }
                                >
                                  <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: room.borderColor }}
                                  />
                                  {room.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
