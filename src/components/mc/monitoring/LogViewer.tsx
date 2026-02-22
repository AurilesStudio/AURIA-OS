import { useEffect, useRef } from "react";

interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration: number;
}

interface LogViewerProps {
  logs: LogEntry[];
}

function statusColor(status: number): string {
  if (status >= 500) return "text-red-400";
  if (status >= 400) return "text-amber-400";
  return "text-emerald-400";
}

export function LogViewer({ logs }: LogViewerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="overlay-glass rounded-lg p-4">
      <span className="text-[10px] uppercase text-text-muted">Request Logs</span>

      <div className="mt-3 max-h-64 overflow-y-auto rounded border border-white/5 bg-bg-base/50 p-3">
        {logs.length === 0 ? (
          <span className="font-mono text-[11px] text-text-muted/50">No logs yet</span>
        ) : (
          <div className="space-y-0.5">
            {logs.map((log, i) => {
              const time = log.timestamp.split("T")[1]?.slice(0, 8) ?? "";
              return (
                <div key={i} className="font-mono text-[11px] leading-relaxed">
                  <span className="text-text-muted/50">{time}</span>{" "}
                  <span className="text-text-muted">{log.method}</span>{" "}
                  <span className="text-text-primary">{log.path}</span>{" "}
                  <span className={statusColor(log.status)}>{log.status}</span>{" "}
                  <span className="text-text-muted/50">{log.duration}ms</span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
