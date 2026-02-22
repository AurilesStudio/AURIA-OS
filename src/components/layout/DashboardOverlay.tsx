import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Grid3X3, Move, Eye, EyeOff, Minus, Plus, ArrowLeftRight, ArrowUpDown } from "lucide-react";
import { ROOM_SIZE, TRADING_ROOM_SIZE, ARENA_ROOM_SIZE } from "@/types";
import { TokenGaugesPanel } from "@/components/monitoring/TokenGaugesPanel";
import { ActivityStream } from "@/components/activity/ActivityStream";
import { OmniPrompt } from "@/components/command/OmniPrompt";
import { QuickActions } from "@/components/command/QuickActions";
import { ApiKeysSettings } from "@/components/settings/ApiKeysSettings";
import { CameraToolbar } from "@/components/camera/CameraToolbar";
import { TradingPanel } from "@/components/trading/TradingPanel";
import { useStore } from "@/store/useStore";

type PanelId = string | null;

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

/** Reusable +/- stepper row */
function Stepper({ label, icon: Icon, value, onStep }: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  onStep: (delta: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3 w-3 text-text-muted" />
      <span className="text-[10px] text-text-muted">{label}</span>
      <button
        onClick={() => onStep(-1)}
        className="flex h-5 w-5 items-center justify-center rounded bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-primary transition-colors"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="min-w-[1.5rem] text-center text-xs font-medium text-text-primary">
        {value}
      </span>
      <button
        onClick={() => onStep(1)}
        className="flex h-5 w-5 items-center justify-center rounded bg-white/5 text-text-muted hover:bg-white/10 hover:text-text-primary transition-colors"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

const FRAME_PAD = 2.8;

/** Compute the auto cell count for a project's bounding box (matches ProjectFrame logic). */
function useAutoGridSize(projectId: string, cellSize: number) {
  const allRooms = useStore((s) => s.rooms);
  const layoutType = useStore((s) => s.workspaceProjects.find((p) => p.id === projectId)?.layoutType);

  return useMemo(() => {
    const rooms = allRooms.filter((r) => r.projectId === projectId);
    if (rooms.length === 0) return { autoCols: 8, autoRows: 8 };
    const isLarge = layoutType === "trading" || layoutType === "project-management";
    const isArena = layoutType === "arena";
    const hw = isArena ? ARENA_ROOM_SIZE.width / 2 : isLarge ? TRADING_ROOM_SIZE.width / 2 : ROOM_SIZE.width / 2;
    const hd = isArena ? ARENA_ROOM_SIZE.depth / 2 : isLarge ? TRADING_ROOM_SIZE.depth / 2 : ROOM_SIZE.depth / 2;

    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const r of rooms) {
      minX = Math.min(minX, r.position[0] - hw);
      maxX = Math.max(maxX, r.position[0] + hw);
      minZ = Math.min(minZ, r.position[2] - hd);
      maxZ = Math.max(maxZ, r.position[2] + hd);
    }
    const x0 = Math.floor((minX - FRAME_PAD) / cellSize) * cellSize;
    const x1 = Math.ceil((maxX + FRAME_PAD) / cellSize) * cellSize;
    const z0 = Math.floor((minZ - FRAME_PAD) / cellSize) * cellSize;
    const z1 = Math.ceil((maxZ + FRAME_PAD) / cellSize) * cellSize;
    return {
      autoCols: Math.round((x1 - x0) / cellSize),
      autoRows: Math.round((z1 - z0) / cellSize),
    };
  }, [allRooms, projectId, layoutType, cellSize]);
}

function EditModeToolbar() {
  const editMode = useStore((s) => s.editMode);
  const setEditMode = useStore((s) => s.setEditMode);
  const gridOverlayEnabled = useStore((s) => s.gridOverlayEnabled);
  const setGridOverlayEnabled = useStore((s) => s.setGridOverlayEnabled);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const activeProject = useStore((s) => s.workspaceProjects.find((p) => p.id === s.activeProjectId));
  const globalCellSize = useStore((s) => s.gridCellSize);
  const setProjectGridCellSize = useStore((s) => s.setProjectGridCellSize);
  const setProjectGridColumns = useStore((s) => s.setProjectGridColumns);
  const setProjectGridRows = useStore((s) => s.setProjectGridRows);
  const cellSize = activeProject?.gridCellSize ?? globalCellSize;
  const { autoCols, autoRows } = useAutoGridSize(activeProjectId, cellSize);
  const cols = activeProject?.gridColumns ?? autoCols;
  const rows = activeProject?.gridRows ?? autoRows;

  if (!editMode) return null;

  const stepCellSize = (delta: number) => {
    const next = Math.max(0.5, Math.min(10, cellSize + delta * 0.5));
    setProjectGridCellSize(activeProjectId, Math.round(next * 10) / 10);
  };

  const stepCols = (delta: number) => {
    const minCols = autoCols;
    setProjectGridColumns(activeProjectId, Math.max(minCols, cols + delta));
  };

  const stepRows = (delta: number) => {
    const minRows = autoRows;
    setProjectGridRows(activeProjectId, Math.max(minRows, rows + delta));
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="pointer-events-auto flex items-center gap-3 rounded-xl border border-amber-500/20 bg-bg-surface/90 px-4 py-2 backdrop-blur-md"
    >
      {/* Edit mode indicator */}
      <div className="flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
          Edit
        </span>
      </div>

      <div className="h-4 w-px bg-white/10" />

      {/* Grid visibility toggle */}
      <button
        onClick={() => setGridOverlayEnabled(!gridOverlayEnabled)}
        className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors ${
          gridOverlayEnabled
            ? "bg-purple-500/20 text-purple-300"
            : "text-text-muted hover:bg-white/5 hover:text-text-primary"
        }`}
        title="Toggle grid overlay"
      >
        {gridOverlayEnabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        Grid
      </button>

      <div className="h-4 w-px bg-white/10" />

      {/* Cell size */}
      <Stepper label="Snap" icon={Grid3X3} value={cellSize} onStep={stepCellSize} />

      <div className="h-4 w-px bg-white/10" />

      {/* Columns (width) */}
      <Stepper label="W" icon={ArrowLeftRight} value={cols} onStep={stepCols} />

      {/* Rows (height) */}
      <Stepper label="H" icon={ArrowUpDown} value={rows} onStep={stepRows} />

      <div className="h-4 w-px bg-white/10" />

      {/* Exit edit mode */}
      <button
        onClick={() => setEditMode(false)}
        className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted hover:bg-white/10 hover:text-text-primary transition-colors"
      >
        Done
      </button>
    </motion.div>
  );
}

export function DashboardOverlay() {
  const activePanel = useStore((s) => s.mcOfficePanel);
  const fpvActive = useStore((s) => s.auriaFpvActive);
  const editMode = useStore((s) => s.editMode);
  const sidebarCollapsed = useStore((s) => s.mcSidebarCollapsed);

  const sidebarWidth = sidebarCollapsed ? 56 : 200;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex" style={{ paddingLeft: sidebarWidth }}>
      {/* Expandable panel (driven by MCSidebar Tools section) */}
      <div className="py-4 pl-2">
        <AnimatePresence>
          {activePanel && (
            <SidebarPanel
              key={activePanel}
              panelId={activePanel}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Edit-mode toolbar — bottom center */}
      <AnimatePresence>
        {editMode && (
          <div className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
            <EditModeToolbar />
          </div>
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
