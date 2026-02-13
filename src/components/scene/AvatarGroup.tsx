import { useStore } from "@/store/useStore";
import { AvatarModel } from "./AvatarModel";

export function AvatarGroup() {
  const avatars = useStore((s) => s.avatars);

  return (
    <group>
      {avatars.map((avatar) => (
        <AvatarModel key={avatar.id} avatar={avatar} />
      ))}
    </group>
  );
}
