import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Cpu, Clock, ArrowRightLeft, Eye, EyeOff,
  Trash2, KeyRound, Settings, Activity, Box, Play,
  FileText, Zap, Wrench,
} from "lucide-react";
import { useAvatar } from "@/hooks/useAvatar";
import { useStore } from "@/store/useStore";
import {
  AVATAR_PROVIDER_LABELS,
  ROLE_SUGGESTIONS,
  SKILLS,
} from "@/types";
import type { LLMProvider } from "@/types";
import { formatTime } from "@/lib/utils";

type Tab = "settings" | "activity";

export function AvatarInfoPanel() {
  const { selectedAvatar, select } = useAvatar();
  const activeProjectId = useStore((s) => s.activeProjectId);
  const rooms = useStore((s) => s.rooms);
  const projectRooms = rooms.filter((r) => r.projectId === activeProjectId);
  const moveAvatarToRoom = useStore((s) => s.moveAvatarToRoom);
  const updateAvatar = useStore((s) => s.updateAvatar);
  const removeAvatar = useStore((s) => s.removeAvatar);
  const appearances = useStore((s) => s.appearances);
  const setAvatarGenerationConsoleOpen = useStore((s) => s.setAvatarGenerationConsoleOpen);
  const availableClipNames = useStore((s) => s.availableClipNames);
  const setAvatarActiveClip = useStore((s) => s.setAvatarActiveClip);
  const toggleAvatarSkill = useStore((s) => s.toggleAvatarSkill);

  const [tab, setTab] = useState<Tab>("settings");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [provider, setProvider] = useState<LLMProvider>("auria");

  // Sync local form state when selected avatar changes
  useEffect(() => {
    if (selectedAvatar) {
      setName(selectedAvatar.name);
      setRole(selectedAvatar.role);
      setApiKey(selectedAvatar.apiKey);
      setSystemPrompt(selectedAvatar.systemPrompt);
      setProvider(selectedAvatar.provider);
      setShowKey(false);
      setTab("settings");
    }
  }, [selectedAvatar?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!selectedAvatar) return null;

  const hasChanges =
    name !== selectedAvatar.name ||
    role !== selectedAvatar.role ||
    apiKey !== selectedAvatar.apiKey ||
    systemPrompt !== selectedAvatar.systemPrompt ||
    provider !== selectedAvatar.provider;

  const handleSave = () => {
    updateAvatar(selectedAvatar.id, { name, role, apiKey, systemPrompt, provider });
  };

  const handleCancel = () => {
    setName(selectedAvatar.name);
    setRole(selectedAvatar.role);
    setApiKey(selectedAvatar.apiKey);
    setSystemPrompt(selectedAvatar.systemPrompt);
    setProvider(selectedAvatar.provider);
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
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-4">
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

                  {/* Role (free input with suggestions) */}
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Role / Mission</span>
                    <input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      list="role-suggestions"
                      placeholder="Ex: CTO / Lead Dev"
                      className="rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
                    />
                    <datalist id="role-suggestions">
                      {ROLE_SUGGESTIONS.map((r) => (
                        <option key={r} value={r} />
                      ))}
                    </datalist>
                  </label>

                  {/* Provider */}
                  <label className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-[10px] uppercase text-text-muted">
                      <Zap className="h-2.5 w-2.5" />
                      LLM Provider
                    </span>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value as LLMProvider)}
                      className="rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-white/20"
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

                  {/* System Prompt */}
                  <label className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-[10px] uppercase text-text-muted">
                      <FileText className="h-2.5 w-2.5" />
                      System Prompt
                    </span>
                    <textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="Instructions for the LLM agent..."
                      rows={4}
                      className="resize-y rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
                    />
                  </label>

                  {/* Skills */}
                  <div className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-1 text-[10px] uppercase text-text-muted">
                      <Wrench className="h-2.5 w-2.5" />
                      Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SKILLS.map((skill) => {
                        const active = selectedAvatar.skillIds?.includes(skill.id);
                        return (
                          <button
                            key={skill.id}
                            onClick={() => toggleAvatarSkill(selectedAvatar.id, skill.id)}
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] transition-colors"
                            style={
                              active
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
                              className="inline-flex items-center justify-center rounded px-1 text-[8px] font-bold leading-tight text-white"
                              style={{ backgroundColor: skill.color }}
                            >
                              {skill.icon}
                            </span>
                            {skill.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

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

                  {/* Status + Level */}
                  <div className="flex items-center gap-3">
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
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase text-text-muted">Level</span>
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          backgroundColor: `${selectedAvatar.color}20`,
                          color: selectedAvatar.color,
                          border: `1px solid ${selectedAvatar.color}40`,
                        }}
                      >
                        {selectedAvatar.level}
                      </span>
                    </div>
                  </div>
                  {/* Level progress bar */}
                  <div className="flex flex-col gap-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${selectedAvatar.level}%`,
                          backgroundColor: selectedAvatar.color,
                          boxShadow: `0 0 6px ${selectedAvatar.color}80`,
                        }}
                      />
                    </div>
                  </div>

                  {/* ── Appearance Picker ──────── */}
                  <div className="flex flex-col gap-2 rounded border border-white/5 bg-bg-base/30 p-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] uppercase text-text-muted">
                        <Box className="h-2.5 w-2.5" />
                        Appearance
                      </span>
                      <button
                        onClick={() => setAvatarGenerationConsoleOpen(true)}
                        className="text-[10px] text-text-muted transition-colors hover:text-text-primary"
                      >
                        Open Studio
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {/* Default (procedural) option */}
                      <button
                        onClick={() => updateAvatar(selectedAvatar.id, { modelUrl: "" })}
                        className={`flex flex-col items-center gap-1 rounded border px-1.5 py-2 text-center transition-colors ${
                          !selectedAvatar.modelUrl
                            ? "border-white/20 bg-white/5"
                            : "border-white/5 hover:border-white/15"
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center">
                          <Cpu className="h-4 w-4 text-text-muted" />
                        </div>
                        <span className="text-[9px] text-text-muted">Default</span>
                      </button>

                      {/* Library entries */}
                      {appearances.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => updateAvatar(selectedAvatar.id, { modelUrl: app.modelUrl })}
                          className={`flex flex-col items-center gap-1 rounded border px-1.5 py-2 text-center transition-colors ${
                            selectedAvatar.modelUrl === app.modelUrl
                              ? "border-white/20 bg-white/5"
                              : "border-white/5 hover:border-white/15"
                          }`}
                        >
                          {app.thumbnailUrl ? (
                            <img
                              src={app.thumbnailUrl}
                              alt={app.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center">
                              <Box className="h-4 w-4 text-text-muted" />
                            </div>
                          )}
                          <span className="text-[9px] text-text-muted truncate w-full">
                            {app.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    {appearances.length === 0 && (
                      <p className="text-center text-[10px] text-text-muted">
                        No appearances. Open Studio to generate.
                      </p>
                    )}
                  </div>

                  {/* Animation clips (only for GLB avatars) */}
                  {selectedAvatar.modelUrl && availableClipNames.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="flex items-center gap-1 text-[10px] uppercase text-text-muted">
                        <Play className="h-2.5 w-2.5" />
                        Animation
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {availableClipNames.map((clipName) => (
                          <button
                            key={clipName}
                            onClick={() => setAvatarActiveClip(selectedAvatar.id, clipName)}
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] transition-colors"
                            style={{
                              backgroundColor:
                                selectedAvatar.activeClip === clipName
                                  ? `${selectedAvatar.color}20`
                                  : "rgba(255,255,255,0.03)",
                              border:
                                selectedAvatar.activeClip === clipName
                                  ? `1px solid ${selectedAvatar.color}60`
                                  : "1px solid rgba(255,255,255,0.08)",
                              color:
                                selectedAvatar.activeClip === clipName
                                  ? selectedAvatar.color
                                  : "#999",
                            }}
                          >
                            <Play
                              className="h-2.5 w-2.5"
                              style={{
                                fill:
                                  selectedAvatar.activeClip === clipName
                                    ? selectedAvatar.color
                                    : "transparent",
                              }}
                            />
                            {clipName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Room */}
                  <label className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-[10px] uppercase text-text-muted">
                      <ArrowRightLeft className="h-2.5 w-2.5" />
                      Room
                    </span>
                    <select
                      value={selectedAvatar.roomId}
                      onChange={(e) => moveAvatarToRoom(selectedAvatar.id, e.target.value)}
                      className="rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-white/20"
                    >
                      {projectRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.label}
                        </option>
                      ))}
                    </select>
                  </label>

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
