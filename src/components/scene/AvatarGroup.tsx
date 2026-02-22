import { useCallback, useMemo } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import { useDragAvatar } from "@/hooks/useDragAvatar";
import { useDragRoom } from "@/hooks/useDragRoom";
import { AvatarModel } from "./AvatarModel";
import { Workstation } from "./Workstation";
import { IsometricRooms } from "./IsometricGrid";
import type { RoomData, AvatarData } from "@/types";

// ── Workstation layout offsets (max 6 per room) ──────────────
const DESK_OFFSETS: { offset: [number, number, number]; faceZ: 1 | -1 }[] = [
  { offset: [-1.0, 0, -0.8], faceZ: 1 },
  { offset: [1.0, 0, -0.8], faceZ: 1 },
  { offset: [-1.0, 0, 0.8], faceZ: -1 },
  { offset: [1.0, 0, 0.8], faceZ: -1 },
  { offset: [0, 0, -0.8], faceZ: 1 },
  { offset: [0, 0, 0.8], faceZ: -1 },
];

interface DeskAssignment {
  avatarId: string;
  position: [number, number, number];
  rotation: number;
  color: string;
  isActive: boolean;
}

function computeDeskAssignments(
  rooms: RoomData[],
  avatars: AvatarData[],
): Map<string, DeskAssignment> {
  const map = new Map<string, DeskAssignment>();

  for (const room of rooms) {
    // Get non-AURIA avatars in this room
    const roomAvatars = avatars.filter(
      (a) => a.roomId === room.id && a.characterId !== "auria",
    );

    roomAvatars.forEach((avatar, idx) => {
      if (idx >= DESK_OFFSETS.length) return; // max 6 desks per room
      const slot = DESK_OFFSETS[idx]!;
      const pos: [number, number, number] = [
        room.position[0] + slot.offset[0],
        (room.floorY ?? 0) + slot.offset[1],
        room.position[2] + slot.offset[2],
      ];
      // faceZ=1 → rotation 0 (face +Z), faceZ=-1 → rotation Math.PI (face -Z)
      const rotation = slot.faceZ === 1 ? 0 : Math.PI;

      map.set(avatar.id, {
        avatarId: avatar.id,
        position: pos,
        rotation,
        color: avatar.color,
        isActive: avatar.status === "working",
      });
    });
  }

  return map;
}

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

  // Compute desk assignments (memoized on avatars + rooms identity)
  const deskAssignments = useMemo(
    () => computeDeskAssignments(rooms, avatars),
    [rooms, avatars],
  );

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

  // Collect all desk assignments for rendering workstations
  const allDesks = useMemo(
    () => Array.from(deskAssignments.values()),
    [deskAssignments],
  );

  return (
    <group>
      {/* Rooms rendered here so they share the same ground plane for dragging */}
      <IsometricRooms
        onRoomPointerDown={editMode ? handleRoomPointerDown : undefined}
        onProjectPointerDown={editMode ? handleProjectPointerDown : undefined}
      />

      {/* Workstations */}
      {allDesks.map((desk) => (
        <Workstation
          key={desk.avatarId}
          position={desk.position}
          rotation={desk.rotation}
          color={desk.color}
          isActive={desk.isActive}
        />
      ))}

      {avatars.map((avatar) => {
        const desk = deskAssignments.get(avatar.id);
        return (
          <AvatarModel
            key={avatar.id}
            avatar={avatar}
            deskPosition={desk?.position}
            deskRotation={desk?.rotation}
            onDragStart={handleAvatarPointerDown}
          />
        );
      })}

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
