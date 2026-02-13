import { useRef, useCallback, useState } from "react";
import type { Mesh } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import type { RoomData } from "@/types";
import { ROOM_SIZE } from "@/types";
import { useStore } from "@/store/useStore";

const CLICK_THRESHOLD = 0.15;
const hw = ROOM_SIZE.width / 2;
const hd = ROOM_SIZE.depth / 2;

/** Check if a world-space point falls inside a room's bounds */
function findRoomAtPoint(x: number, z: number, rooms: RoomData[]): RoomData | null {
  for (const room of rooms) {
    const rx = room.position[0];
    const rz = room.position[2];
    if (x >= rx - hw && x <= rx + hw && z >= rz - hd && z <= rz + hd) {
      return room;
    }
  }
  return null;
}

/** Clamp a position inside a room's bounds with padding */
function clampToRoom(x: number, z: number, room: RoomData): [number, number] {
  const pad = 0.4;
  const chw = hw - pad;
  const chd = hd - pad;
  const cx = Math.max(room.position[0] - chw, Math.min(room.position[0] + chw, x));
  const cz = Math.max(room.position[2] - chd, Math.min(room.position[2] + chd, z));
  return [cx, cz];
}

export function useDragAvatar(rooms: RoomData[]) {
  const groundPlaneRef = useRef<Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragAvatarId, setDragAvatarId] = useState<string | null>(null);

  const dragStartPos = useRef<{ x: number; z: number } | null>(null);
  const dragOriginPos = useRef<[number, number, number] | null>(null);
  const hasDragged = useRef(false);

  const selectAvatar = useStore((s) => s.selectAvatar);
  const updateAvatarPosition = useStore((s) => s.updateAvatarPosition);
  const avatars = useStore((s) => s.avatars);

  // Access MapControls set with makeDefault to disable during drag
  const controls = useThree((s) => s.controls) as { enabled: boolean } | null;

  const handlePointerDown = useCallback(
    (avatarId: string, e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const avatar = avatars.find((a) => a.id === avatarId);
      if (!avatar) return;

      // Disable camera pan while interacting with an avatar
      if (controls) controls.enabled = false;

      setDragAvatarId(avatarId);
      hasDragged.current = false;
      dragStartPos.current = { x: e.point.x, z: e.point.z };
      dragOriginPos.current = [...avatar.position];
    },
    [avatars, controls],
  );

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragAvatarId || !dragStartPos.current) return;

      const dx = e.point.x - dragStartPos.current.x;
      const dz = e.point.z - dragStartPos.current.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > CLICK_THRESHOLD) {
        if (!hasDragged.current) {
          hasDragged.current = true;
          setIsDragging(true);
        }
        updateAvatarPosition(dragAvatarId, [e.point.x, 0, e.point.z]);
      }
    },
    [dragAvatarId, updateAvatarPosition],
  );

  const handlePointerUp = useCallback(() => {
    // Re-enable camera controls
    if (controls) controls.enabled = true;

    if (!dragAvatarId) return;

    if (!hasDragged.current) {
      // It was a click, not a drag — toggle selection
      const selectedId = useStore.getState().selectedAvatarId;
      selectAvatar(selectedId === dragAvatarId ? null : dragAvatarId);
    } else {
      // It was a drag — find which room the avatar landed in
      const avatar = useStore.getState().avatars.find((a) => a.id === dragAvatarId);
      if (avatar) {
        const targetRoom = findRoomAtPoint(avatar.position[0], avatar.position[2], rooms);
        if (targetRoom) {
          // Snap inside the target room
          const [cx, cz] = clampToRoom(avatar.position[0], avatar.position[2], targetRoom);
          updateAvatarPosition(dragAvatarId, [cx, 0, cz]);
          // Update roomId if changed
          if (targetRoom.id !== avatar.roomId) {
            useStore.setState((state) => ({
              avatars: state.avatars.map((a) =>
                a.id === dragAvatarId ? { ...a, roomId: targetRoom.id } : a,
              ),
            }));
          }
        } else {
          // Dropped outside any room — return to origin
          if (dragOriginPos.current) {
            updateAvatarPosition(dragAvatarId, dragOriginPos.current);
          }
        }
      }
    }

    setDragAvatarId(null);
    setIsDragging(false);
    dragStartPos.current = null;
    dragOriginPos.current = null;
    hasDragged.current = false;
  }, [dragAvatarId, rooms, selectAvatar, updateAvatarPosition, controls]);

  return {
    isDragging,
    dragAvatarId,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    groundPlaneRef,
  };
}
