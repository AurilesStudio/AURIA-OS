import { useStore } from "@/store/useStore";

export function useSystemStatus() {
  const systemStatus = useStore((s) => s.systemStatus);
  const setSystemStatus = useStore((s) => s.setSystemStatus);

  return { systemStatus, setSystemStatus };
}
