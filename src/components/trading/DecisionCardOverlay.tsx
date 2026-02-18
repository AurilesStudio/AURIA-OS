import { AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useTradingData } from "@/hooks/useTradingData";
import { DecisionCard } from "./DecisionCard";

export function DecisionCardOverlay() {
  const killSwitch = useStore((s) => s.tradingKillSwitch);
  const { opportunities, validateOpportunity, rejectOpportunity } = useTradingData(killSwitch);

  const latestPending = opportunities.filter((o) => o.status === "pending").slice(-1)[0];

  if (!latestPending) return null;

  return (
    <div className="fixed top-4 right-4 z-40 w-80 pointer-events-auto">
      <AnimatePresence mode="wait">
        <DecisionCard
          key={latestPending.id}
          opportunity={latestPending}
          onValidate={validateOpportunity}
          onReject={rejectOpportunity}
        />
      </AnimatePresence>
    </div>
  );
}
