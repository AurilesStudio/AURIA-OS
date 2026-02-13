import { useStore } from "@/store/useStore";
import type { ActivityType } from "@/types";

export function useActivityStream() {
  const activities = useStore((s) => s.activities);
  const addActivity = useStore((s) => s.addActivity);

  const log = (type: ActivityType, message: string, source?: string) => {
    addActivity({ type, message, source });
  };

  return { activities, log };
}
