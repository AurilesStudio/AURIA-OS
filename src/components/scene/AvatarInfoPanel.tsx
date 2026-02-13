import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Cpu, Clock, ArrowRightLeft, Eye, EyeOff,
  Trash2, KeyRound, Settings, Activity,
} from "lucide-react";
import { useAvatar } from "@/hooks/useAvatar";
import { useStore } from "@/store/useStore";
import {
  AVATAR_PROVIDER_LABELS,
  AVATAR_ROLE_LABELS,
} from "@/types";
import type { AvatarRole } from "@/types";
import { formatTime } from "@/lib/utils";

type Tab = "settings" | "activity";

export function AvatarInfoPanel() {
  const { selectedAvatar, select } = useAvatar();
  const rooms = useStore((s) => s.rooms);
  const moveAvatarToRoom = useStore((s) => s.moveAvatarToRoom);
  const updateAvatar = useStore((s) => s.updateAvatar);
  const removeAvatar = useStore((s) => s.removeAvatar);

  const [tab, setTab] = useState<Tab>("settings");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AvatarRole>("dev");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  // Sync local form state when selected avatar changes
  useEffect(() => {
    if (selectedAvatar) {
      setName(selectedAvatar.name);
      setRole(selectedAvatar.role);
      setApiKey(selectedAvatar.apiKey);
      setShowKey(false);
      setTab("settings");
    }
  }, [selectedAvatar?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!selectedAvatar) return null;

  const hasChanges =
    name !== selectedAvatar.name ||
    role !== selectedAvatar.role ||
    apiKey !== selectedAvatar.apiKey;

  const handleSave = () => {
    updateAvatar(selectedAvatar.id, { name, role, apiKey });
  };

  const handleCancel = () => {
    setName(selectedAvatar.name);
    setRole(selectedAvatar.role);
    setApiKey(selectedAvatar.apiKey);
  };

  const handleDelete = () => {
    removeAvatar(selectedAvatar.id);
  };

  return (
    <AnimatePresence>
      {selectedAvatar && (
        <motion.div
          key={selectedAvatar.id}
          initial={{ x: 340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 340, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-4 top-20 z-30 w-80"
        >
          <div className="overlay-glass rounded-lg border border-white/10">
            {/* ── Header ─────────────────────────────── */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" style={{ color: selectedAvatar.color }} />
                <div>
                  <h3
                    className="text-sm font-bold"
                    style={{
                      color: selectedAvatar.color,
                      textShadow: `0 0 8px ${selectedAvatar.color}`,
                    }}
                  >
                    {selectedAvatar.name}
                  </h3>
                  <p className="text-[10px] text-text-muted">
                    {AVATAR_PROVIDER_LABELS[selectedAvatar.provider]}
                  </p>
                </div>
              </div>
              <button
                onClick={() => select(null)}
                className="text-text-muted transition-colors hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── Tabs ───────────────────────────────── */}
            <div className="flex border-b border-white/5">
              <button
                onClick={() => setTab("settings")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase transition-colors ${
                  tab === "settings"
                    ? "text-text-primary border-b-2"
                    : "text-text-muted hover:text-text-primary"
                }`}
                style={tab === "settings" ? { borderColor: selectedAvatar.color } : undefined}
              >
                <Settings className="h-3 w-3" />
                Settings
              </button>
              <button
                onClick={() => setTab("activity")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase transition-colors ${
                  tab === "activity"
                    ? "text-text-primary border-b-2"
                    : "text-text-muted hover:text-text-primary"
                }`}
                style={tab === "activity" ? { borderColor: selectedAvatar.color } : undefined}
              >
                <Activity className="h-3 w-3" />
                Activity
              </button>
            </div>

            {/* ── Tab content ────────────────────────── */}
            <div className="p-4">
              {tab === "settings" ? (
                <div className="flex flex-col gap-3">
                  {/* Name */}
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-white/20"
                    />
                  </label>

                  {/* Role */}
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Role</span>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as AvatarRole)}
                      className="rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-white/20"
                    >
                      {Object.entries(AVATAR_ROLE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* API Key */}
                  <label className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-[10px] uppercase text-text-muted">
                      <KeyRound className="h-2.5 w-2.5" />
                      API Key
                    </span>
                    <div className="flex gap-1">
                      <input
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="min-w-0 flex-1 rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="rounded border border-white/10 bg-bg-base/50 px-2 text-text-muted transition-colors hover:text-text-primary"
                      >
                        {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>
                  </label>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-text-muted">Status</span>
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={{
                        backgroundColor: `${selectedAvatar.color}20`,
                        color: selectedAvatar.color,
                        border: `1px solid ${selectedAvatar.color}40`,
                      }}
                    >
                      {selectedAvatar.status}
                    </span>
                  </div>

                  {/* Move to room */}
                  {rooms.filter((r) => r.id !== selectedAvatar.roomId).length > 0 && (
                    <div>
                      <div className="mb-1.5 flex items-center gap-1 text-[10px] uppercase text-text-muted">
                        <ArrowRightLeft className="h-2.5 w-2.5" />
                        Move to
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {rooms
                          .filter((r) => r.id !== selectedAvatar.roomId)
                          .map((room) => (
                            <button
                              key={room.id}
                              onClick={() => moveAvatarToRoom(selectedAvatar.id, room.id)}
                              className="rounded px-2 py-1 text-[10px] font-medium transition-colors hover:brightness-125"
                              style={{
                                backgroundColor: `${room.borderColor}20`,
                                color: room.borderColor,
                                border: `1px solid ${room.borderColor}40`,
                              }}
                            >
                              {room.label}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Save / Cancel / Delete */}
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges}
                      className="rounded px-3 py-1.5 text-[10px] font-bold uppercase transition-colors disabled:opacity-30"
                      style={{
                        backgroundColor: hasChanges ? selectedAvatar.color : `${selectedAvatar.color}40`,
                        color: "#fff",
                      }}
                    >
                      Save
                    </button>
                    {hasChanges && (
                      <button
                        onClick={handleCancel}
                        className="rounded border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase text-text-muted transition-colors hover:text-text-primary"
                      >
                        Cancel
                      </button>
                    )}
                    <div className="flex-1" />
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1 rounded px-2 py-1.5 text-[10px] text-text-muted transition-colors hover:bg-neon-red/10 hover:text-neon-red"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Activity tab ─────────────────────── */
                <div className="flex flex-col gap-2">
                  {/* Current Action */}
                  {selectedAvatar.currentAction && (
                    <div className="rounded border border-white/5 bg-bg-base/50 p-2">
                      <div className="mb-1 text-[10px] uppercase text-text-muted">
                        Current Task
                      </div>
                      <div className="text-xs text-text-primary">
                        {selectedAvatar.currentAction.prompt}
                      </div>
                    </div>
                  )}

                  {/* History */}
                  {selectedAvatar.history.length > 0 ? (
                    <div>
                      <div className="mb-1 text-[10px] uppercase text-text-muted">
                        History
                      </div>
                      <div className="flex max-h-52 flex-col gap-1 overflow-y-auto">
                        {selectedAvatar.history
                          .slice()
                          .reverse()
                          .map((action) => (
                            <div
                              key={action.id}
                              className="rounded border border-white/5 bg-bg-base/30 p-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-text-primary">
                                  {action.prompt}
                                </span>
                                <span className="flex items-center gap-1 text-[9px] text-text-muted">
                                  <Clock className="h-2.5 w-2.5" />
                                  {formatTime(action.startedAt)}
                                </span>
                              </div>
                              {action.result && (
                                <div className="mt-0.5 text-[10px] text-status-success">
                                  {action.result}
                                </div>
                              )}
                              {action.error && (
                                <div className="mt-0.5 text-[10px] text-neon-red">
                                  {action.error}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <p className="py-4 text-center text-[10px] text-text-muted">
                      No activity yet
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
