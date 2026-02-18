import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, MessageSquare, Users, Coins, Settings, TrendingUp } from "lucide-react";
import { TokenGaugesPanel } from "@/components/monitoring/TokenGaugesPanel";
import { ActivityStream } from "@/components/activity/ActivityStream";
import { OmniPrompt } from "@/components/command/OmniPrompt";
import { QuickActions } from "@/components/command/QuickActions";
import { ApiKeysSettings } from "@/components/settings/ApiKeysSettings";
import { CameraToolbar } from "@/components/camera/CameraToolbar";
import { TradingPanel } from "@/components/trading/TradingPanel";

type PanelId = "home" | "chat" | "agents" | "alerts" | "trading" | "settings" | null;

const sidebarItems = [
  { id: "home" as const, icon: Home },
  { id: "chat" as const, icon: MessageSquare },
  { id: "agents" as const, icon: Users },
  { id: "alerts" as const, icon: Coins },
  { id: "trading" as const, icon: TrendingUp },
  { id: "settings" as const, icon: Settings },
] as const;

function SidebarPanel({ panelId }: { panelId: PanelId }) {
  if (!panelId) return null;

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto ml-2 overflow-y-auto ${panelId === "alerts" ? "w-96" : panelId === "settings" || panelId === "trading" ? "w-80" : "w-72"}`}
    >
      <div className="flex flex-col gap-3">
        {panelId === "home" && (
          <>
            <div className="overlay-glass rounded-lg"><OmniPrompt /></div>
            <div className="overlay-glass rounded-lg"><QuickActions /></div>
          </>
        )}
        {panelId === "chat" && (
          <div className="overlay-glass max-h-[70vh] overflow-hidden rounded-lg">
            <ActivityStream />
          </div>
        )}
        {panelId === "agents" && (
          <div className="overlay-glass rounded-lg p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Agents
            </h3>
            <p className="text-xs text-text-muted">
              Click an avatar in the scene to select it.
            </p>
          </div>
        )}
        {panelId === "alerts" && (
          <div className="overlay-glass rounded-lg">
            <TokenGaugesPanel />
          </div>
        )}
        {panelId === "trading" && (
          <div className="overlay-glass rounded-lg p-4">
            <TradingPanel />
          </div>
        )}
        {panelId === "settings" && (
          <div className="overlay-glass rounded-lg p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Settings
            </h3>
            <ApiKeysSettings />
            <div className="mt-4 pt-3 border-t border-white/5">
              <p className="text-[10px] text-text-muted">AURIA-OS v0.1.0</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function DashboardOverlay() {
  const [activePanel, setActivePanel] = useState<PanelId>(null);

  const toggle = (id: PanelId) => {
    setActivePanel((prev) => (prev === id ? null : id));
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex">
      {/* Thin icon sidebar */}
      <div className="pointer-events-auto flex flex-col items-center gap-1 px-2 py-4">
        <div className="flex flex-col gap-1 rounded-xl bg-bg-surface/80 p-1.5 backdrop-blur-sm border border-white/5">
          {sidebarItems.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                activePanel === id
                  ? "bg-white/10 text-text-primary"
                  : "text-text-muted hover:bg-white/5 hover:text-text-primary"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Expandable panel */}
      <AnimatePresence>
        {activePanel && (
          <SidebarPanel
            key={activePanel}
            panelId={activePanel}
          />
        )}
      </AnimatePresence>

      {/* Camera presets — bottom right */}
      <div className="pointer-events-none fixed bottom-4 right-4">
        <CameraToolbar />
      </div>
    </div>
  );
}
