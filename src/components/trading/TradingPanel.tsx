import { useStore } from "@/store/useStore";
import { useTradingData } from "@/hooks/useTradingData";
import { LiveTicker } from "./LiveTicker";
import { SystemHealth } from "./SystemHealth";
import { DecisionCard } from "./DecisionCard";

export function TradingPanel() {
  const killSwitch = useStore((s) => s.tradingKillSwitch);
  const toggleKillSwitch = useStore((s) => s.toggleKillSwitch);
  const { pairs, opportunities, systemHealth, validateOpportunity, rejectOpportunity } =
    useTradingData(killSwitch);

  const pendingOpps = opportunities.filter((o) => o.status === "pending");

  return (
    <div className="flex flex-col gap-3">
      <SystemHealth data={systemHealth} onToggleKillSwitch={toggleKillSwitch} />
      <LiveTicker pairs={pairs} />

      {pendingOpps.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-trading-amber)]">
            Pending Decisions ({pendingOpps.length})
          </h3>
          {pendingOpps.slice(0, 3).map((opp) => (
            <DecisionCard
              key={opp.id}
              opportunity={opp}
              onValidate={validateOpportunity}
              onReject={rejectOpportunity}
            />
          ))}
        </div>
      )}
    </div>
  );
}
