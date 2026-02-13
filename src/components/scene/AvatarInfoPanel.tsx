import { motion, AnimatePresence } from "framer-motion";
import { X, Cpu, Clock } from "lucide-react";
import { useAvatar } from "@/hooks/useAvatar";
import { AVATAR_PROVIDER_LABELS } from "@/types";
import { formatTime } from "@/lib/utils";

export function AvatarInfoPanel() {
  const { selectedAvatar, select } = useAvatar();

  return (
    <AnimatePresence>
      {selectedAvatar && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-4 top-20 z-30 w-72"
        >
          <div className="overlay-glass rounded-lg border border-white/10 p-4">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <h3
                className="text-sm font-bold"
                style={{
                  color: selectedAvatar.color,
                  textShadow: `0 0 8px ${selectedAvatar.color}`,
                }}
              >
                {selectedAvatar.name}
              </h3>
              <button
                onClick={() => select(null)}
                className="text-text-muted transition-colors hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Provider */}
            <div className="mb-3 flex items-center gap-2 text-xs text-text-muted">
              <Cpu className="h-3 w-3" />
              <span>{AVATAR_PROVIDER_LABELS[selectedAvatar.provider]}</span>
            </div>

            {/* Status */}
            <div className="mb-3">
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

            {/* Current Action */}
            {selectedAvatar.currentAction && (
              <div className="mb-3 rounded border border-white/5 bg-bg-base/50 p-2">
                <div className="mb-1 text-[10px] uppercase text-text-muted">
                  Current Task
                </div>
                <div className="text-xs text-text-primary">
                  {selectedAvatar.currentAction.prompt}
                </div>
              </div>
            )}

            {/* History */}
            {selectedAvatar.history.length > 0 && (
              <div>
                <div className="mb-1 text-[10px] uppercase text-text-muted">
                  History
                </div>
                <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
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
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
