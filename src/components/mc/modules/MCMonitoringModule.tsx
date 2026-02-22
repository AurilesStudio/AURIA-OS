import { useState, useEffect, useCallback } from "react";
import { MonitoringHeader } from "../monitoring/MonitoringHeader";
import { SystemHealth } from "../monitoring/SystemHealth";
import { ServiceStatus } from "../monitoring/ServiceStatus";
import { RequestMetrics } from "../monitoring/RequestMetrics";
import { LogViewer } from "../monitoring/LogViewer";

interface MonitoringData {
  system: {
    uptime: number;
    nodeVersion: string;
    platform: string;
    heapUsedMB: number;
    heapTotalMB: number;
  };
  services: {
    name: string;
    status: "connected" | "error";
    latency: number;
    error?: string;
  }[];
  metrics: {
    totalRequests: number;
    errorCount4xx: number;
    errorCount5xx: number;
    rateLimitHits: number;
    avgResponseTime: number;
  };
  logs: {
    timestamp: string;
    method: string;
    path: string;
    status: number;
    duration: number;
  }[];
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
const TOKEN = import.meta.env.VITE_GATEWAY_TOKEN ?? "";

export function MCMonitoringModule() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/monitoring`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling every 10s when auto-refresh is on
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchData, 10_000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchData]);

  return (
    <div className="flex h-full flex-col">
      <MonitoringHeader
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh((v) => !v)}
        onRefresh={fetchData}
        lastUpdated={lastUpdated}
        loading={loading}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {error && (
          <div className="rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {data ? (
          <>
            {/* Top row: System + Services */}
            <div className="grid grid-cols-2 gap-4">
              <SystemHealth {...data.system} />
              <ServiceStatus services={data.services} />
            </div>

            {/* Request metrics */}
            <RequestMetrics {...data.metrics} />

            {/* Logs */}
            <LogViewer logs={data.logs} />
          </>
        ) : (
          !error && (
            <div className="flex items-center justify-center py-20 text-xs text-text-muted">
              Loading monitoring data...
            </div>
          )
        )}
      </div>
    </div>
  );
}
