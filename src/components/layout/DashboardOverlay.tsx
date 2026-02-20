import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, MessageSquare, Users, Coins, Settings, TrendingUp, Bell, Grid3X3, Move } from "lucide-react";
import { TokenGaugesPanel } from "@/components/monitoring/TokenGaugesPanel";
import { ActivityStream } from "@/components/activity/ActivityStream";
import { OmniPrompt } from "@/components/command/OmniPrompt";
import { QuickActions } from "@/components/command/QuickActions";
import { ApiKeysSettings } from "@/components/settings/ApiKeysSettings";
import { CameraToolbar } from "@/components/camera/CameraToolbar";
import { TradingPanel } from "@/components/trading/TradingPanel";
import { useStore } from "@/store/useStore";

type PanelId = "home" | "chat" | "agents" | "alerts" | "trading" | "settings" | null;

const sidebarItems = [
  { id: "home" as const, icon: Home },
  { id: "chat" as const, icon: MessageSquare },
  { id: "agents" as const, icon: Users },
  { id: "alerts" as const, icon: Coins },
  { id: "trading" as const, icon: TrendingUp },
  { id: "settings" as const, icon: Settings },
] as const;

function SettingsPanel() {
  const opportunityAlertsEnabled = useStore((s) => s.opportunityAlertsEnabled);
  const setOpportunityAlertsEnabled = useStore((s) => s.setOpportunityAlertsEnabled);
  const gridOverlayEnabled = useStore((s) => s.gridOverlayEnabled);
  const setGridOverlayEnabled = useStore((s) => s.setGridOverlayEnabled);
  const editMode = useStore((s) => s.editMode);
  const setEditMode = useStore((s) => s.setEditMode);

  return (
    <div className="overlay-glass rounded-lg p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Settings
      </h3>
      <ApiKeysSettings />

      {/* Toggles */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Notifications
        </h4>
        <label className="flex items-center justify-between gap-2 cursor-pointer group">
          <span className="flex items-center gap-1.5 text-xs text-text-muted group-hover:text-text-primary transition-colors">
            <Bell className="h-3 w-3" />
            Opportunity Alerts
          </span>
          <button
            onClick={() => setOpportunityAlertsEnabled(!opportunityAlertsEnabled)}
            className="relative h-5 w-9 rounded-full transition-colors"
            style={{
              backgroundColor: opportunityAlertsEnabled ? "#f59e0b" : "rgba(255,255,255,0.1)",
            }}
          >
            <span
              className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform"
              style={{
                transform: opportunityAlertsEnabled ? "translateX(16px)" : "translateX(0)",
              }}
            />
          </button>
        </label>
      </div>

      {/* Scene */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Scene
        </h4>
        <label className="flex items-center justify-between gap-2 cursor-pointer group">
          <span className="flex items-center gap-1.5 text-xs text-text-muted group-hover:text-text-primary transition-colors">
            <Grid3X3 className="h-3 w-3" />
            Grid Overlay
          </span>
          <button
            onClick={() => setGridOverlayEnabled(!gridOverlayEnabled)}
            className="relative h-5 w-9 rounded-full transition-colors"
            style={{
              backgroundColor: gridOverlayEnabled ? "#a855f7" : "rgba(255,255,255,0.1)",
            }}
          >
            <span
              className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform"
              style={{
                transform: gridOverlayEnabled ? "translateX(16px)" : "translateX(0)",
              }}
            />
          </button>
        </label>
        <label className="flex items-center justify-between gap-2 cursor-pointer group">
          <span className="flex items-center gap-1.5 text-xs text-text-muted group-hover:text-text-primary transition-colors">
            <Move className="h-3 w-3" />
            Edit Mode
          </span>
          <button
            onClick={() => setEditMode(!editMode)}
            className="relative h-5 w-9 rounded-full transition-colors"
            style={{
              backgroundColor: editMode ? "#f59e0b" : "rgba(255,255,255,0.1)",
            }}
          >
            <span
              className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform"
              style={{
                transform: editMode ? "translateX(16px)" : "translateX(0)",
              }}
            />
          </button>
        </label>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5">
        <p className="text-[10px] text-text-muted">AURIA-OS v0.1.0</p>
      </div>
    </div>
  );
}

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
        {panelId === "settings" && <SettingsPanel />}
      </div>
    </motion.div>
  );
}

export function DashboardOverlay() {
  const [activePanel, setActivePanel] = useState<PanelId>(null);
  const fpvActive = useStore((s) => s.auriaFpvActive);

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

      {/* FPV HUD indicator */}
      {fpvActive && (
        <div className="pointer-events-none fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="rounded-lg border border-[#00ffcc]/30 bg-black/60 px-4 py-2 backdrop-blur-sm">
            <span className="text-xs font-medium tracking-wide" style={{ color: "#00ffcc" }}>
              AURIA POV
            </span>
            <span className="ml-3 text-[10px] text-text-muted">
              ZQSD move &middot; Arrows look &middot; ESC exit
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
