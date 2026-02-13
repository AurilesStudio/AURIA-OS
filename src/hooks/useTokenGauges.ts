import { useStore } from "@/store/useStore";

export function useTokenGauges() {
  const gauges = useStore((s) => s.gauges);
  const updateGauge = useStore((s) => s.updateGauge);

  return { gauges, updateGauge };
}
