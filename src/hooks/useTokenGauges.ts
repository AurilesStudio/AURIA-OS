import { useStore } from "@/store/useStore";

export function useTokenGauges() {
  const gauges = useStore((s) => s.gauges);
  const updateGauge = useStore((s) => s.updateGauge);
  const addTokenUsage = useStore((s) => s.addTokenUsage);
  const resetTokenTracking = useStore((s) => s.resetTokenTracking);

  return { gauges, updateGauge, addTokenUsage, resetTokenTracking };
}
