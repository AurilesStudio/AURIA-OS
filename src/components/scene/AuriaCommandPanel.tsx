import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Radio, Cpu, ChevronDown } from "lucide-react";
import { useStore } from "@/store/useStore";
import { formatTime } from "@/lib/utils";

export function AuriaCommandPanel() {
  const open = useStore((s) => s.commandCenterOpen);
  const setOpen = useStore((s) => s.setCommandCenterOpen);
  const messages = useStore((s) => s.auriaMessages);
  const sendMessage = useStore((s) => s.sendAuriaMessage);
  const avatars = useStore((s) => s.avatars);

  const [input, setInput] = useState("");
  const [targetAgent, setTargetAgent] = useState<string | undefined>(undefined);
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage(text, targetAgent);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedAgent = targetAgent
    ? avatars.find((a) => a.id === targetAgent)
    : null;

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
            className="fixed left-1/2 top-1/2 z-50 w-[520px] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="overlay-glass flex flex-col rounded-xl border border-white/10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <Radio className="h-4 w-4 text-neon-red" />
                  <div>
                    <h2 className="text-sm font-bold text-text-primary">
                      AURIA Command Center
                    </h2>
                    <p className="text-[10px] text-text-muted">
                      {avatars.length} agent{avatars.length !== 1 ? "s" : ""} online
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

              {/* Agent status bar */}
              <div className="flex gap-2 border-b border-white/5 px-5 py-2">
                {avatars.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-1 rounded-full px-2 py-0.5"
                    style={{
                      backgroundColor: `${a.color}15`,
                      border: `1px solid ${a.color}30`,
                    }}
                  >
                    <div
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          a.status === "working"
                            ? "#facc15"
                            : a.status === "error"
                              ? "#ff3c3c"
                              : "#10b981",
                      }}
                    />
                    <span
                      className="text-[9px] font-semibold"
                      style={{ color: a.color }}
                    >
                      {a.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Messages */}
              <div className="flex h-64 flex-col gap-2 overflow-y-auto px-5 py-3">
                {messages.length === 0 && (
                  <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
                    <Radio className="h-6 w-6 text-text-muted/30" />
                    <p className="text-[11px] text-text-muted">
                      Send a command to AURIA or target a specific agent.
                    </p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        msg.role === "user"
                          ? "bg-white/5 text-text-primary"
                          : "border border-neon-red/20 bg-neon-red/5 text-text-primary"
                      }`}
                    >
                      {msg.role === "auria" && (
                        <div className="mb-0.5 flex items-center gap-1">
                          <Radio className="h-2.5 w-2.5 text-neon-red" />
                          <span className="text-[9px] font-bold uppercase text-neon-red">
                            AURIA
                          </span>
                        </div>
                      )}
                      {msg.role === "user" && msg.targetAgent && (
                        <div className="mb-0.5 text-[9px] text-text-muted">
                          @{avatars.find((a) => a.id === msg.targetAgent)?.name ?? "agent"}
                        </div>
                      )}
                      <p className="text-[11px] leading-relaxed">{msg.text}</p>
                      <div className="mt-1 text-right text-[8px] text-text-muted/60">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-white/5 px-4 py-3">
                {/* Agent target selector */}
                <div className="relative mb-2">
                  <button
                    onClick={() => setShowAgentPicker(!showAgentPicker)}
                    className="flex items-center gap-1.5 rounded-md border border-white/10 bg-bg-base/50 px-2.5 py-1 text-[10px] transition-colors hover:border-white/20"
                  >
                    <Cpu className="h-2.5 w-2.5 text-text-muted" />
                    {selectedAgent ? (
                      <span style={{ color: selectedAgent.color }}>
                        @{selectedAgent.name}
                      </span>
                    ) : (
                      <span className="text-text-muted">All agents (broadcast)</span>
                    )}
                    <ChevronDown className="h-2.5 w-2.5 text-text-muted" />
                  </button>

                  <AnimatePresence>
                    {showAgentPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute bottom-full left-0 mb-1 w-48 rounded-lg border border-white/10 bg-bg-surface p-1 shadow-xl"
                      >
                        <button
                          onClick={() => {
                            setTargetAgent(undefined);
                            setShowAgentPicker(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[10px] text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
                        >
                          <Radio className="h-2.5 w-2.5" />
                          Broadcast (all agents)
                        </button>
                        {avatars.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => {
                              setTargetAgent(a.id);
                              setShowAgentPicker(false);
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[10px] transition-colors hover:bg-white/5"
                          >
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: a.color }}
                            />
                            <span style={{ color: a.color }}>{a.name}</span>
                            <span className="ml-auto text-[8px] text-text-muted">
                              {a.status}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter command..."
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-bg-base/50 px-3 py-2 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[10px] font-bold uppercase text-white transition-colors disabled:opacity-30"
                    style={{ backgroundColor: input.trim() ? "#ff3c3c" : "#ff3c3c40" }}
                  >
                    <Send className="h-3 w-3" />
                    Send
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
