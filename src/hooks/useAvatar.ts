import { useCallback } from "react";
import { useStore } from "@/store/useStore";

export function useAvatar() {
  const avatars = useStore((s) => s.avatars);
  const selectedAvatarId = useStore((s) => s.selectedAvatarId);
  const selectAvatar = useStore((s) => s.selectAvatar);
  const assignAction = useStore((s) => s.assignAction);

  const selectedAvatar = avatars.find((a) => a.id === selectedAvatarId) ?? null;

  const select = useCallback(
    (id: string | null) => {
      selectAvatar(id);
    },
    [selectAvatar],
  );

  const assign = useCallback(
    (prompt: string) => {
      if (!selectedAvatarId) return;
      assignAction(selectedAvatarId, prompt);
    },
    [selectedAvatarId, assignAction],
  );

  return { avatars, selectedAvatar, selectedAvatarId, select, assign };
}
