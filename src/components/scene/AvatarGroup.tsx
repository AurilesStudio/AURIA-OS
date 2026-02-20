import { useCallback } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import { useDragAvatar } from "@/hooks/useDragAvatar";
import { useDragRoom } from "@/hooks/useDragRoom";
import { AvatarModel } from "./AvatarModel";
import { IsometricRooms } from "./IsometricGrid";

export function AvatarGroup() {
  const avatars = useStore((s) => s.avatars);
  const rooms = useStore((s) => s.rooms);
  const editMode = useStore((s) => s.editMode);

  const {
    handlePointerDown: handleAvatarPointerDown,
    handlePointerMove: handleAvatarPointerMove,
    handlePointerUp: handleAvatarPointerUp,
    groundPlaneRef,
  } = useDragAvatar(rooms);

  const {
    handleRoomPointerDown,
    handleRoomPointerMove,
    handleRoomPointerUp,
    handleProjectPointerDown,
    activeDragId,
  } = useDragRoom();

  // Route ground plane pointer events based on whether a room/project drag is active.
  // `activeDragId` covers both single-room and project drags.
  const handleGroundPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (activeDragId) {
        handleRoomPointerMove(e);
      } else {
        handleAvatarPointerMove(e);
      }
    },
    [activeDragId, handleRoomPointerMove, handleAvatarPointerMove],
  );

  const handleGroundPointerUp = useCallback(() => {
    if (activeDragId) {
      handleRoomPointerUp();
    } else {
      handleAvatarPointerUp();
    }
  }, [activeDragId, handleRoomPointerUp, handleAvatarPointerUp]);

  return (
    <group>
      {/* Rooms rendered here so they share the same ground plane for dragging */}
      <IsometricRooms
        onRoomPointerDown={editMode ? handleRoomPointerDown : undefined}
        onProjectPointerDown={editMode ? handleProjectPointerDown : undefined}
      />

      {avatars.map((avatar) => (
        <AvatarModel
          key={avatar.id}
          avatar={avatar}
          onDragStart={handleAvatarPointerDown}
        />
      ))}

      {/* Invisible ground plane for drag raycasting (avatars + rooms) */}
      <mesh
        ref={groundPlaneRef}
        rotation-x={-Math.PI / 2}
        position={[20, 0, -20]}
        onPointerMove={handleGroundPointerMove}
        onPointerUp={handleGroundPointerUp}
        visible={false}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
}
