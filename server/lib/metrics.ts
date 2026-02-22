// ── Metrics Collector — ring buffer + counters for monitoring dashboard ──────

export interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration: number;
}

export class MetricsCollector {
  private logs: LogEntry[] = [];
  private maxLogs = 50;
  private durations: number[] = [];
  private maxDurations = 1000;

  totalRequests = 0;
  errorCount4xx = 0;
  errorCount5xx = 0;
  rateLimitHits = 0;

  record(entry: LogEntry) {
    // Ring buffer for logs
    if (this.logs.length >= this.maxLogs) this.logs.shift();
    this.logs.push(entry);

    // Ring buffer for durations (avg calculation)
    if (this.durations.length >= this.maxDurations) this.durations.shift();
    this.durations.push(entry.duration);

    // Counters
    this.totalRequests++;
    if (entry.status === 429) this.rateLimitHits++;
    if (entry.status >= 400 && entry.status < 500) this.errorCount4xx++;
    if (entry.status >= 500) this.errorCount5xx++;
  }

  getMetrics() {
    const avgResponseTime =
      this.durations.length > 0
        ? Math.round(this.durations.reduce((a, b) => a + b, 0) / this.durations.length)
        : 0;

    return {
      totalRequests: this.totalRequests,
      errorCount4xx: this.errorCount4xx,
      errorCount5xx: this.errorCount5xx,
      rateLimitHits: this.rateLimitHits,
      avgResponseTime,
    };
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  reset() {
    this.logs = [];
    this.durations = [];
    this.totalRequests = 0;
    this.errorCount4xx = 0;
    this.errorCount5xx = 0;
    this.rateLimitHits = 0;
  }
}

export const metrics = new MetricsCollector();
