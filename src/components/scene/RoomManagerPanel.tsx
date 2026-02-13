import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Check, X, LayoutGrid } from "lucide-react";
import { useStore } from "@/store/useStore";
import { SKILLS } from "@/types";

export function RoomManagerPanel() {
  const rooms = useStore((s) => s.rooms);
  const addRoom = useStore((s) => s.addRoom);
  const renameRoom = useStore((s) => s.renameRoom);
  const removeRoom = useStore((s) => s.removeRoom);
  const toggleRoomSkill = useStore((s) => s.toggleRoomSkill);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newRoomName, setNewRoomName] = useState("");

  const startRename = (roomId: string, currentLabel: string) => {
    setEditingId(roomId);
    setEditValue(currentLabel);
  };

  const confirmRename = () => {
    if (editingId && editValue.trim()) {
      renameRoom(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleAdd = () => {
    const name = newRoomName.trim() || `Room ${rooms.length + 1}`;
    addRoom(name);
    setNewRoomName("");
  };

  return (
    <div className="fixed left-4 bottom-4 z-30">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="overlay-glass flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-text-muted transition-colors hover:text-text-primary"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Rooms ({rooms.length})
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
                Rooms
              </div>

              {/* Room list */}
              <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="rounded border border-white/5 bg-bg-base/30 px-2 py-1.5"
                  >
                    <div className="flex items-center gap-1.5">
                      {/* Color dot */}
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: room.borderColor }}
                      />

                      {editingId === room.id ? (
                        <>
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") confirmRename();
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="min-w-0 flex-1 bg-transparent text-xs text-text-primary outline-none"
                          />
                          <button
                            onClick={confirmRename}
                            className="text-status-success hover:brightness-125"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-text-muted hover:text-text-primary"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="min-w-0 flex-1 truncate text-xs text-text-primary">
                            {room.label}
                          </span>
                          <button
                            onClick={() => startRename(room.id, room.label)}
                            className="text-text-muted hover:text-text-primary"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          {rooms.length > 1 && (
                            <button
                              onClick={() => removeRoom(room.id)}
                              className="text-text-muted hover:text-neon-red"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Skill badges */}
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {SKILLS.map((skill) => {
                        const active = room.skillIds?.includes(skill.id);
                        return (
                          <button
                            key={skill.id}
                            onClick={() => toggleRoomSkill(room.id, skill.id)}
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
                ))}
              </div>

              {/* Add room */}
              <div className="mt-2 flex gap-1.5">
                <input
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                  }}
                  placeholder="New room name..."
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
