import { RefreshCw } from "lucide-react";

interface MonitoringHeaderProps {
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  lastUpdated: string | null;
  loading: boolean;
}

export function MonitoringHeader({
  autoRefresh,
  onToggleAutoRefresh,
  onRefresh,
  lastUpdated,
  loading,
}: MonitoringHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 px-6 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-muted">System Monitoring</span>
        {lastUpdated && (
          <span className="text-[10px] text-text-muted/50">
            Updated {lastUpdated}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Auto-refresh toggle */}
        <button
          onClick={onToggleAutoRefresh}
          className={`rounded px-2.5 py-1 text-[10px] font-medium transition-colors ${
            autoRefresh
              ? "bg-mc-accent/15 text-mc-accent"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          Auto {autoRefresh ? "ON" : "OFF"}
        </button>

        {/* Manual refresh */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 rounded bg-mc-accent/15 px-3 py-1.5 text-xs font-semibold text-mc-accent transition-colors hover:bg-mc-accent/25 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}
