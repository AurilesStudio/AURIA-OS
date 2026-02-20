// ── Zone Bounds Computation ───────────────────────────────────────────
// Computes bounding rectangles around each project's rooms, with padding.

import type { Project, RoomData } from "@/types";
import { ROOM_SIZE, TRADING_ROOM_SIZE, ARENA_ROOM_SIZE } from "@/types";

/** Padding around the outermost rooms — matches ProjectFrame in IsometricGrid */
const ZONE_PADDING = 2.8;

export interface ZoneBounds {
  projectId: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  centerX: number;
  centerZ: number;
  width: number;
  depth: number;
}

function roomHalfSize(project: Project): { hw: number; hd: number } {
  if (project.layoutType === "arena") {
    return { hw: ARENA_ROOM_SIZE.width / 2, hd: ARENA_ROOM_SIZE.depth / 2 };
  }
  if (project.layoutType === "trading" || project.layoutType === "project-management") {
    return { hw: TRADING_ROOM_SIZE.width / 2, hd: TRADING_ROOM_SIZE.depth / 2 };
  }
  return { hw: ROOM_SIZE.width / 2, hd: ROOM_SIZE.depth / 2 };
}

export function computeZoneBounds(
  project: Project,
  rooms: RoomData[],
): ZoneBounds | null {
  const projectRooms = rooms.filter((r) => r.projectId === project.id);
  if (projectRooms.length === 0) return null;

  const { hw, hd } = roomHalfSize(project);

  let minX = Infinity,
    maxX = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity;

  for (const r of projectRooms) {
    minX = Math.min(minX, r.position[0] - hw);
    maxX = Math.max(maxX, r.position[0] + hw);
    minZ = Math.min(minZ, r.position[2] - hd);
    maxZ = Math.max(maxZ, r.position[2] + hd);
  }

  minX -= ZONE_PADDING;
  maxX += ZONE_PADDING;
  minZ -= ZONE_PADDING;
  maxZ += ZONE_PADDING;

  return {
    projectId: project.id,
    minX,
    maxX,
    minZ,
    maxZ,
    centerX: (minX + maxX) / 2,
    centerZ: (minZ + maxZ) / 2,
    width: maxX - minX,
    depth: maxZ - minZ,
  };
}

export function computeAllZoneBounds(
  projects: Project[],
  rooms: RoomData[],
): ZoneBounds[] {
  return projects
    .map((p) => computeZoneBounds(p, rooms))
    .filter((b): b is ZoneBounds => b !== null);
}
