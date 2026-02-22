interface SystemHealthProps {
  uptime: number;
  nodeVersion: string;
  platform: string;
  heapUsedMB: number;
  heapTotalMB: number;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

export function SystemHealth({ uptime, nodeVersion, platform, heapUsedMB, heapTotalMB }: SystemHealthProps) {
  const heapPercent = heapTotalMB > 0 ? Math.round((heapUsedMB / heapTotalMB) * 100) : 0;

  return (
    <div className="overlay-glass rounded-lg p-4">
      <span className="text-[10px] uppercase text-text-muted">System Health</span>

      <div className="mt-3 space-y-3">
        {/* Uptime */}
        <div>
          <span className="text-[10px] text-text-muted">Uptime</span>
          <p className="text-xl font-semibold text-text-primary">{formatUptime(uptime)}</p>
        </div>

        {/* Heap memory */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted">Heap Memory</span>
            <span className="text-[10px] text-text-muted">
              {heapUsedMB} / {heapTotalMB} MB ({heapPercent}%)
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-mc-accent transition-all"
              style={{ width: `${Math.min(heapPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Info row */}
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] text-text-muted">Node</span>
            <p className="text-xs text-text-primary">{nodeVersion}</p>
          </div>
          <div>
            <span className="text-[10px] text-text-muted">Platform</span>
            <p className="text-xs text-text-primary">{platform}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
