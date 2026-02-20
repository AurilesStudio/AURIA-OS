import { useRef, useCallback, useState, useEffect } from "react";
import type { Mesh } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import type { RoomData, Project } from "@/types";
import { ROOM_SIZE, TRADING_ROOM_SIZE, ARENA_ROOM_SIZE } from "@/types";
import { useStore } from "@/store/useStore";

const CLICK_THRESHOLD = 0.15;

/** Get the room size based on the project layout type */
function getRoomSize(room: RoomData, projects: Project[]): { width: number; depth: number } {
  const project = projects.find((p) => p.id === room.projectId);
  if (project?.layoutType === "arena") return ARENA_ROOM_SIZE;
  if (project?.layoutType === "trading" || project?.layoutType === "project-management") return TRADING_ROOM_SIZE;
  return ROOM_SIZE;
}

/** Check if a world-space point falls inside a room's bounds */
function findRoomAtPoint(x: number, z: number, rooms: RoomData[], projects: Project[]): RoomData | null {
  for (const room of rooms) {
    const size = getRoomSize(room, projects);
    const rhw = size.width / 2;
    const rhd = size.depth / 2;
    const rx = room.position[0];
    const rz = room.position[2];
    if (x >= rx - rhw && x <= rx + rhw && z >= rz - rhd && z <= rz + rhd) {
      return room;
    }
  }
  return null;
}

/** Clamp a position inside a room's bounds with padding */
function clampToRoom(x: number, z: number, room: RoomData, projects: Project[]): [number, number] {
  const size = getRoomSize(room, projects);
  const pad = 0.4;
  const chw = size.width / 2 - pad;
  const chd = size.depth / 2 - pad;
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
  const workspaceProjects = useStore((s) => s.workspaceProjects);

  // Access OrbitControls set with makeDefault to disable during drag
  const controls = useThree((s) => s.controls) as { enabled: boolean } | null;

  // Safety net: if pointerUp fires outside the ground plane (e.g. pointer
  // leaves the canvas), re-enable camera controls via a window listener.
  useEffect(() => {
    const restore = () => {
      if (controls && !controls.enabled && dragAvatarId) {
        controls.enabled = true;
      }
    };
    window.addEventListener("pointerup", restore);
    return () => window.removeEventListener("pointerup", restore);
  }, [controls, dragAvatarId]);

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

      // AURIA cannot be dragged — only click-to-select
      const dragAvatar = avatars.find((a) => a.id === dragAvatarId);
      if (dragAvatar?.characterId === "auria") return;

      const dx = e.point.x - dragStartPos.current.x;
      const dz = e.point.z - dragStartPos.current.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > CLICK_THRESHOLD) {
        if (!hasDragged.current) {
          hasDragged.current = true;
          setIsDragging(true);
        }
        const hoverRoom = findRoomAtPoint(e.point.x, e.point.z, rooms, workspaceProjects);
        updateAvatarPosition(dragAvatarId, [e.point.x, hoverRoom?.floorY ?? 0, e.point.z]);
      }
    },
    [dragAvatarId, avatars, updateAvatarPosition, workspaceProjects],
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
        const targetRoom = findRoomAtPoint(avatar.position[0], avatar.position[2], rooms, workspaceProjects);
        if (targetRoom) {
          // Snap inside the target room
          const [cx, cz] = clampToRoom(avatar.position[0], avatar.position[2], targetRoom, workspaceProjects);
          updateAvatarPosition(dragAvatarId, [cx, targetRoom.floorY ?? 0, cz]);
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
  }, [dragAvatarId, rooms, selectAvatar, updateAvatarPosition, controls, workspaceProjects]);

  return {
    isDragging,
    dragAvatarId,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    groundPlaneRef,
  };
}
