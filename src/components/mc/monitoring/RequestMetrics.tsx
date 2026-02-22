interface RequestMetricsProps {
  totalRequests: number;
  errorCount4xx: number;
  errorCount5xx: number;
  rateLimitHits: number;
  avgResponseTime: number;
}

export function RequestMetrics({
  totalRequests,
  errorCount4xx,
  errorCount5xx,
  rateLimitHits,
  avgResponseTime,
}: RequestMetricsProps) {
  const errorRate =
    totalRequests > 0
      ? ((errorCount4xx + errorCount5xx) / totalRequests * 100).toFixed(1)
      : "0.0";

  const cards = [
    { label: "Total Requests", value: totalRequests.toLocaleString() },
    { label: "Error Rate", value: `${errorRate}%` },
    { label: "Avg Response", value: `${avgResponseTime}ms` },
    { label: "Rate Limited", value: rateLimitHits.toLocaleString() },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="overlay-glass rounded-lg p-4">
          <span className="text-[10px] uppercase text-text-muted">{card.label}</span>
          <p className="mt-1 text-xl font-semibold text-text-primary">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
