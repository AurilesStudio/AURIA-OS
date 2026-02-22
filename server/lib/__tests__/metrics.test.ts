import { describe, it, expect, beforeEach } from "vitest";
import { MetricsCollector } from "../metrics.js";

describe("MetricsCollector", () => {
  let collector: MetricsCollector;

  const entry = (status = 200, duration = 50) => ({
    timestamp: new Date().toISOString(),
    method: "GET",
    path: "/api/test",
    status,
    duration,
  });

  beforeEach(() => {
    collector = new MetricsCollector();
  });

  it("starts with zero counters", () => {
    const m = collector.getMetrics();
    expect(m.totalRequests).toBe(0);
    expect(m.errorCount4xx).toBe(0);
    expect(m.errorCount5xx).toBe(0);
    expect(m.rateLimitHits).toBe(0);
    expect(m.avgResponseTime).toBe(0);
  });

  it("starts with empty logs", () => {
    expect(collector.getLogs()).toEqual([]);
  });

  it("records a request and increments counters", () => {
    collector.record(entry(200, 100));
    const m = collector.getMetrics();
    expect(m.totalRequests).toBe(1);
    expect(m.avgResponseTime).toBe(100);
  });

  it("counts 4xx errors", () => {
    collector.record(entry(400));
    collector.record(entry(404));
    expect(collector.getMetrics().errorCount4xx).toBe(2);
  });

  it("counts 5xx errors", () => {
    collector.record(entry(500));
    collector.record(entry(503));
    expect(collector.getMetrics().errorCount5xx).toBe(2);
  });

  it("counts rate limit hits (429)", () => {
    collector.record(entry(429));
    collector.record(entry(429));
    const m = collector.getMetrics();
    expect(m.rateLimitHits).toBe(2);
    // 429 is also a 4xx
    expect(m.errorCount4xx).toBe(2);
  });

  it("computes average response time", () => {
    collector.record(entry(200, 100));
    collector.record(entry(200, 200));
    collector.record(entry(200, 300));
    expect(collector.getMetrics().avgResponseTime).toBe(200);
  });

  it("enforces ring buffer limit of 50 logs", () => {
    for (let i = 0; i < 60; i++) {
      collector.record(entry(200, i));
    }
    const logs = collector.getLogs();
    expect(logs.length).toBe(50);
    // First entry should be the 11th recorded (index 10)
    expect(logs[0].duration).toBe(10);
  });

  it("getLogs returns a copy (not reference)", () => {
    collector.record(entry(200));
    const logs1 = collector.getLogs();
    const logs2 = collector.getLogs();
    expect(logs1).not.toBe(logs2);
    expect(logs1).toEqual(logs2);
  });

  it("reset clears all state", () => {
    collector.record(entry(200));
    collector.record(entry(500));
    collector.reset();
    expect(collector.getMetrics().totalRequests).toBe(0);
    expect(collector.getMetrics().errorCount5xx).toBe(0);
    expect(collector.getLogs()).toEqual([]);
  });
});
