import { useRef, useCallback, useState, useEffect } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import { useStore } from "@/store/useStore";

const CLICK_THRESHOLD = 0.15;
const DEFAULT_CELL_SIZE = 2;

/** Resolve the gridCellSize for a given project (falls back to global default). */
function getCellSize(projectId: string | null): number {
  const state = useStore.getState();
  if (projectId) {
    const project = state.workspaceProjects.find((p) => p.id === projectId);
    if (project?.gridCellSize) return project.gridCellSize;
  }
  return state.gridCellSize ?? DEFAULT_CELL_SIZE;
}

export function useDragRoom() {
  const [isDraggingRoom, setIsDraggingRoom] = useState(false);
  const [dragRoomId, setDragRoomId] = useState<string | null>(null);

  // Project-level drag state
  const [dragProjectId, setDragProjectId] = useState<string | null>(null);

  const dragStartPos = useRef<{ x: number; z: number } | null>(null);
  const roomOriginPos = useRef<[number, number, number] | null>(null);
  const hasDragged = useRef(false);
  // Remember which project we're snapping to during the drag
  const dragCellSize = useRef(DEFAULT_CELL_SIZE);

  // Snapshot of all room/avatar positions at project drag start
  const projectSnapshot = useRef<{
    rooms: { id: string; position: [number, number, number] }[];
    avatars: { id: string; position: [number, number, number] }[];
  } | null>(null);

  const updateRoomPosition = useStore((s) => s.updateRoomPosition);
  const updateAvatarPosition = useStore((s) => s.updateAvatarPosition);

  const controls = useThree((s) => s.controls) as { enabled: boolean } | null;

  // The "active drag id" covers both room and project drags for routing
  const activeDragId = dragRoomId ?? dragProjectId;

  // Safety net: re-enable camera controls if pointer leaves the canvas
  useEffect(() => {
    const restore = () => {
      if (controls && !controls.enabled && activeDragId) {
        controls.enabled = true;
      }
    };
    window.addEventListener("pointerup", restore);
    return () => window.removeEventListener("pointerup", restore);
  }, [controls, activeDragId]);

  // ── Single room drag ─────────────────────────────────────────

  const handleRoomPointerDown = useCallback(
    (roomId: string, e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const room = useStore.getState().rooms.find((r) => r.id === roomId);
      if (!room) return;

      if (controls) controls.enabled = false;

      // Lock cell size for the duration of this drag
      dragCellSize.current = getCellSize(room.projectId);

      setDragRoomId(roomId);
      hasDragged.current = false;
      dragStartPos.current = { x: e.point.x, z: e.point.z };
      roomOriginPos.current = [...room.position];
    },
    [controls],
  );

  const handleRoomPointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragStartPos.current) return;

      const cellSize = dragCellSize.current;

      // ── Project drag ───────────────────────────────────────
      if (dragProjectId && projectSnapshot.current) {
        const dx = e.point.x - dragStartPos.current.x;
        const dz = e.point.z - dragStartPos.current.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > CLICK_THRESHOLD) {
          if (!hasDragged.current) {
            hasDragged.current = true;
            setIsDraggingRoom(true);
          }

          // Apply snapped delta to ALL rooms/avatars from their snapshot positions
          let snapDx = dx;
          let snapDz = dz;
          const ref = projectSnapshot.current.rooms[0];
          if (ref) {
            snapDx = Math.round((ref.position[0] + dx) / cellSize) * cellSize - ref.position[0];
            snapDz = Math.round((ref.position[2] + dz) / cellSize) * cellSize - ref.position[2];
          }

          for (const snap of projectSnapshot.current.rooms) {
            updateRoomPosition(snap.id, [
              snap.position[0] + snapDx,
              snap.position[1],
              snap.position[2] + snapDz,
            ]);
          }
          for (const snap of projectSnapshot.current.avatars) {
            updateAvatarPosition(snap.id, [
              snap.position[0] + snapDx,
              snap.position[1],
              snap.position[2] + snapDz,
            ]);
          }
        }
        return;
      }

      // ── Single room drag ───────────────────────────────────
      if (!dragRoomId || !roomOriginPos.current) return;

      const dx = e.point.x - dragStartPos.current.x;
      const dz = e.point.z - dragStartPos.current.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > CLICK_THRESHOLD) {
        if (!hasDragged.current) {
          hasDragged.current = true;
          setIsDraggingRoom(true);
        }

        let newX = roomOriginPos.current[0] + dx;
        let newZ = roomOriginPos.current[2] + dz;

        // Always snap to grid in edit mode
        newX = Math.round(newX / cellSize) * cellSize;
        newZ = Math.round(newZ / cellSize) * cellSize;

        const newRoomPos: [number, number, number] = [newX, roomOriginPos.current[1], newZ];

        // Read current positions BEFORE updating the store
        const state = useStore.getState();
        const room = state.rooms.find((r) => r.id === dragRoomId);
        if (!room) return;

        const roomDx = newRoomPos[0] - room.position[0];
        const roomDz = newRoomPos[2] - room.position[2];

        // Update room position
        updateRoomPosition(dragRoomId, newRoomPos);

        // Move avatars in this room by the same delta
        const avatarsInRoom = state.avatars.filter((a) => a.roomId === dragRoomId);
        for (const avatar of avatarsInRoom) {
          updateAvatarPosition(avatar.id, [
            avatar.position[0] + roomDx,
            avatar.position[1],
            avatar.position[2] + roomDz,
          ]);
        }
      }
    },
    [dragRoomId, dragProjectId, updateRoomPosition, updateAvatarPosition],
  );

  const handleRoomPointerUp = useCallback(() => {
    if (controls) controls.enabled = true;

    setDragRoomId(null);
    setDragProjectId(null);
    setIsDraggingRoom(false);
    dragStartPos.current = null;
    roomOriginPos.current = null;
    projectSnapshot.current = null;
    hasDragged.current = false;
  }, [controls]);

  // ── Project-level drag ───────────────────────────────────────

  const handleProjectPointerDown = useCallback(
    (projectId: string, e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (controls) controls.enabled = false;

      // Lock cell size for the duration of this drag
      dragCellSize.current = getCellSize(projectId);

      const state = useStore.getState();
      const projectRooms = state.rooms.filter((r) => r.projectId === projectId);
      const projectRoomIds = new Set(projectRooms.map((r) => r.id));
      const projectAvatars = state.avatars.filter((a) => projectRoomIds.has(a.roomId));

      setDragProjectId(projectId);
      hasDragged.current = false;
      dragStartPos.current = { x: e.point.x, z: e.point.z };

      // Snapshot all initial positions
      projectSnapshot.current = {
        rooms: projectRooms.map((r) => ({ id: r.id, position: [...r.position] as [number, number, number] })),
        avatars: projectAvatars.map((a) => ({ id: a.id, position: [...a.position] as [number, number, number] })),
      };
    },
    [controls],
  );

  return {
    isDraggingRoom,
    dragRoomId,
    activeDragId,
    handleRoomPointerDown,
    handleRoomPointerMove,
    handleRoomPointerUp,
    handleProjectPointerDown,
  };
}
