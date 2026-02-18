import { useState, useEffect, useRef, useCallback } from "react";

// ── Interfaces ──────────────────────────────────────────────────

export interface TradingPair {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  trend: "up" | "down" | "flat";
}

export type OpportunityStatus = "pending" | "validated" | "rejected";

export interface TradingOpportunity {
  id: string;
  pair: string;
  type: "LONG" | "SHORT";
  confidence: number;
  entry: number;
  target: number;
  stopLoss: number;
  riskReward: number;
  status: OpportunityStatus;
  detectedAt: number;
}

export interface SystemHealthData {
  binanceApi: "connected" | "degraded" | "disconnected";
  latencyMs: number;
  killSwitch: boolean;
  lastHeartbeat: number;
  activeStrategies: number;
}

// ── Mock base prices ────────────────────────────────────────────

const BASE_PAIRS: { symbol: string; price: number; volume: number }[] = [
  { symbol: "BTC/USDT", price: 67450, volume: 1_250_000_000 },
  { symbol: "ETH/USDT", price: 3520, volume: 620_000_000 },
  { symbol: "SOL/USDT", price: 148.5, volume: 310_000_000 },
  { symbol: "BNB/USDT", price: 605, volume: 180_000_000 },
  { symbol: "XRP/USDT", price: 0.535, volume: 95_000_000 },
];

function randomWalk(price: number, volatility: number): number {
  const change = (Math.random() - 0.5) * 2 * volatility * price;
  return Math.max(price * 0.9, price + change);
}

let opportunityCounter = 0;

function maybeGenerateOpportunity(pairs: TradingPair[]): TradingOpportunity | null {
  if (Math.random() > 0.08) return null; // ~8% chance per tick
  const pair = pairs[Math.floor(Math.random() * pairs.length)]!;
  const isLong = Math.random() > 0.5;
  const confidence = 60 + Math.random() * 35;
  const entry = pair.price;
  const target = isLong ? entry * (1 + 0.02 + Math.random() * 0.05) : entry * (1 - 0.02 - Math.random() * 0.05);
  const stopLoss = isLong ? entry * (1 - 0.01 - Math.random() * 0.02) : entry * (1 + 0.01 + Math.random() * 0.02);
  const riskReward = Math.abs(target - entry) / Math.abs(entry - stopLoss);

  opportunityCounter++;
  return {
    id: `opp-${opportunityCounter}`,
    pair: pair.symbol,
    type: isLong ? "LONG" : "SHORT",
    confidence: Math.round(confidence),
    entry: +entry.toFixed(pair.price < 1 ? 4 : 2),
    target: +target.toFixed(pair.price < 1 ? 4 : 2),
    stopLoss: +stopLoss.toFixed(pair.price < 1 ? 4 : 2),
    riskReward: +riskReward.toFixed(2),
    status: "pending",
    detectedAt: Date.now(),
  };
}

// ── Hook ────────────────────────────────────────────────────────

export function useTradingData(killSwitch: boolean) {
  const [pairs, setPairs] = useState<TradingPair[]>(() =>
    BASE_PAIRS.map((bp) => ({
      symbol: bp.symbol,
      price: bp.price,
      change24h: (Math.random() - 0.5) * 6,
      volume: bp.volume,
      trend: "flat" as const,
    })),
  );

  const [opportunities, setOpportunities] = useState<TradingOpportunity[]>([]);

  const [systemHealth, setSystemHealth] = useState<SystemHealthData>({
    binanceApi: "connected",
    latencyMs: 42,
    killSwitch: false,
    lastHeartbeat: Date.now(),
    activeStrategies: 3,
  });

  const prevPrices = useRef<Map<string, number>>(new Map());

  // Sync killSwitch
  useEffect(() => {
    setSystemHealth((h) => ({ ...h, killSwitch }));
  }, [killSwitch]);

  // Price random walk interval
  useEffect(() => {
    if (killSwitch) return;

    const interval = setInterval(() => {
      setPairs((prev) => {
        const updated = prev.map((p) => {
          const base = BASE_PAIRS.find((bp) => bp.symbol === p.symbol);
          const volatility = p.symbol.includes("BTC") ? 0.002 : 0.004;
          const newPrice = randomWalk(p.price, volatility);
          const oldPrice = prevPrices.current.get(p.symbol) ?? p.price;
          const trend: TradingPair["trend"] = newPrice > oldPrice ? "up" : newPrice < oldPrice ? "down" : "flat";
          prevPrices.current.set(p.symbol, p.price);

          return {
            ...p,
            price: +newPrice.toFixed(p.price < 1 ? 4 : 2),
            change24h: +((newPrice / (base?.price ?? newPrice) - 1) * 100).toFixed(2),
            volume: base ? base.volume + (Math.random() - 0.5) * base.volume * 0.05 : p.volume,
            trend,
          };
        });

        // Maybe generate an opportunity
        const opp = maybeGenerateOpportunity(updated);
        if (opp) {
          setOpportunities((prev) => [...prev.slice(-9), opp]);
        }

        return updated;
      });

      // Update system health heartbeat + latency jitter
      setSystemHealth((h) => ({
        ...h,
        latencyMs: Math.round(30 + Math.random() * 40),
        lastHeartbeat: Date.now(),
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [killSwitch]);

  const validateOpportunity = useCallback((id: string) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "validated" as const } : o)),
    );
  }, []);

  const rejectOpportunity = useCallback((id: string) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "rejected" as const } : o)),
    );
  }, []);

  return {
    pairs,
    opportunities,
    systemHealth,
    validateOpportunity,
    rejectOpportunity,
  };
}
