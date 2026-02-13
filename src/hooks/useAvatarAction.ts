import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

/**
 * Simulates the working → success → idle cycle for a given avatar.
 * When an avatar enters "working" status, after 3-5s it completes,
 * shows "success" for 2s, then returns to "idle".
 */
export function useAvatarAction(avatarId: string) {
  const avatar = useStore((s) => s.avatars.find((a) => a.id === avatarId));
  const completeAction = useStore((s) => s.completeAction);
  const setAvatarStatus = useStore((s) => s.setAvatarStatus);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (avatar?.status !== "working") return;

    const duration = 3000 + Math.random() * 2000; // 3–5s

    timerRef.current = setTimeout(() => {
      completeAction(avatarId, "Task completed successfully");

      // success → idle after 2s
      timerRef.current = setTimeout(() => {
        setAvatarStatus(avatarId, "idle");
      }, 2000);
    }, duration);

    return () => clearTimeout(timerRef.current);
  }, [avatar?.status, avatarId, completeAction, setAvatarStatus]);
}
