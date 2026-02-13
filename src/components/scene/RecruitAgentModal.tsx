import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus } from "lucide-react";
import { useStore } from "@/store/useStore";
import { AGENT_TEMPLATES } from "@/types";
import type { LLMProvider } from "@/types";

interface RecruitAgentModalProps {
  open: boolean;
  onClose: () => void;
}

/** Procedural mini-avatar preview (static, no animation) */
function MiniAvatar({ color }: { color: string }) {
  return (
    <div className="relative mx-auto mb-2 h-20 w-16">
      {/* Simple CSS avatar silhouette */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        {/* Body */}
        <div
          className="mx-auto h-6 w-7 rounded-sm"
          style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}60` }}
        />
        {/* Head */}
        <div
          className="mx-auto -mt-8 h-7 w-7 rounded-sm"
          style={{ backgroundColor: "#c8956c" }}
        />
        {/* Hair */}
        <div
          className="mx-auto -mt-8 h-2 w-8 rounded-sm"
          style={{ backgroundColor: color }}
        />
        {/* Legs */}
        <div className="mx-auto mt-6 flex gap-0.5">
          <div className="h-4 w-2.5 rounded-sm bg-[#1a1a2e]" />
          <div className="h-4 w-2.5 rounded-sm bg-[#1a1a2e]" />
        </div>
      </div>
    </div>
  );
}

export function RecruitAgentModal({ open, onClose }: RecruitAgentModalProps) {
  const addAvatar = useStore((s) => s.addAvatar);

  const handleRecruit = (provider: LLMProvider) => {
    addAvatar(provider);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed left-1/2 top-1/2 z-50 w-[420px] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="overlay-glass rounded-xl border border-white/10 p-6">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <UserPlus className="h-5 w-5 text-neon-red" />
                  <div>
                    <h2 className="text-sm font-bold text-text-primary">Recruit Agent</h2>
                    <p className="text-[10px] text-text-muted">Select an AI to join your team</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-text-muted transition-colors hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Agent grid */}
              <div className="grid grid-cols-3 gap-3">
                {AGENT_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.provider}
                    onClick={() => handleRecruit(tpl.provider)}
                    className="group flex flex-col items-center rounded-lg border border-white/5 bg-bg-base/40 px-3 py-4 transition-all hover:border-white/15 hover:bg-bg-base/60"
                  >
                    <MiniAvatar color={tpl.color} />
                    <span
                      className="mt-1 text-xs font-semibold"
                      style={{ color: tpl.color }}
                    >
                      {tpl.defaultName}
                    </span>
                    <span className="mt-0.5 text-[9px] text-text-muted">
                      {tpl.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
