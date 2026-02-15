import { useStore } from "@/store/useStore";
import { useDragAvatar } from "@/hooks/useDragAvatar";
import { AvatarModel } from "./AvatarModel";

export function AvatarGroup() {
  const activeProjectId = useStore((s) => s.activeProjectId);
  const avatars = useStore((s) => s.avatars).filter((a) => a.projectId === activeProjectId);
  const rooms = useStore((s) => s.rooms);
  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    groundPlaneRef,
  } = useDragAvatar(rooms);

  return (
    <group>
      {avatars.map((avatar) => (
        <AvatarModel
          key={avatar.id}
          avatar={avatar}
          onDragStart={handlePointerDown}
        />
      ))}

      {/* Invisible ground plane for drag raycasting */}
      <mesh
        ref={groundPlaneRef}
        rotation-x={-Math.PI / 2}
        position={[4, 0, 3]}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        visible={false}
      >
        <planeGeometry args={[80, 80]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
}
