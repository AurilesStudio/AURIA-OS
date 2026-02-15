import { useMemo } from "react";
import { Line, Text } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import type { RoomData } from "@/types";
import { ROOM_SIZE, ROOM_FLOOR_COLOR, ROOM_FLOOR_OPACITY } from "@/types";
import type { Project } from "@/types";

const hw = ROOM_SIZE.width / 2;
const hd = ROOM_SIZE.depth / 2;

const BORDER_POINTS: [number, number, number][] = [
  [-hw, 0.01, -hd],
  [hw, 0.01, -hd],
  [hw, 0.01, hd],
  [-hw, 0.01, hd],
  [-hw, 0.01, -hd],
];

/** Single room zone with neon border outline + label */
function IsometricRoom({ room }: { room: RoomData }) {
  const points = useMemo(() => BORDER_POINTS, []);

  return (
    <group position={room.position}>
      {/* Semi-transparent dark floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_SIZE.width, ROOM_SIZE.depth]} />
        <meshStandardMaterial
          color={ROOM_FLOOR_COLOR}
          transparent
          opacity={ROOM_FLOOR_OPACITY}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Neon border outline */}
      <Line
        points={points}
        color={room.borderColor}
        lineWidth={1.5}
      />

      {/* Room label — flat on floor along bottom-left border */}
      <Text
        position={[-hw + 1.6, 0.03, hd + 0.45]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.32}
        color={room.borderColor}
        anchorX="center"
        anchorY="top"
        fillOpacity={0.8}
        letterSpacing={0.12}
      >
        {room.label.toUpperCase()}
        <meshStandardMaterial
          color={room.borderColor}
          emissive={room.borderColor}
          emissiveIntensity={0.6}
          transparent
          opacity={0.8}
        />
      </Text>
    </group>
  );
}

const FRAME_PADDING = 2.8;
const FRAME_COLOR = "#a855f7";
const FRAME_LABEL_COLOR = "#e0c0ff";
const FRAME_OPACITY = 0.25;

/** Bounding frame around all rooms of a project */
function ProjectFrame({ rooms, project }: { rooms: RoomData[]; project: Project }) {
  const points = useMemo(() => {
    if (rooms.length === 0) return null;
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const r of rooms) {
      minX = Math.min(minX, r.position[0] - hw);
      maxX = Math.max(maxX, r.position[0] + hw);
      minZ = Math.min(minZ, r.position[2] - hd);
      maxZ = Math.max(maxZ, r.position[2] + hd);
    }
    const pad = FRAME_PADDING;
    const x0 = minX - pad, x1 = maxX + pad;
    const z0 = minZ - pad, z1 = maxZ + pad;
    const y = 0.005;
    return {
      outline: [
        [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [x0, y, z0],
      ] as [number, number, number][],
      labelPos: [x0 + 0.6, 0.006, z0 - 0.35] as [number, number, number],
    };
  }, [rooms]);

  if (!points) return null;

  return (
    <group>
      <Line
        points={points.outline}
        color={FRAME_COLOR}
        lineWidth={1}
        transparent
        opacity={FRAME_OPACITY}
        linewidth={1}
      />
      <Text
        position={points.labelPos}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.42}
        color={FRAME_LABEL_COLOR}
        anchorX="left"
        anchorY="bottom"
        fillOpacity={0.7}
        letterSpacing={0.08}
      >
        {project.name.toUpperCase()}
        <meshBasicMaterial color={FRAME_LABEL_COLOR} transparent opacity={0.7} />
      </Text>
    </group>
  );
}

/** Renders all rooms from the store (filtered by active project) */
export function IsometricRooms() {
  const activeProjectId = useStore((s) => s.activeProjectId);
  const rooms = useStore((s) => s.rooms).filter((r) => r.projectId === activeProjectId);
  const project = useStore((s) => s.workspaceProjects.find((p) => p.id === s.activeProjectId));

  return (
    <group>
      {project && rooms.length > 0 && (
        <ProjectFrame rooms={rooms} project={project} />
      )}
      {rooms.map((room) => (
        <IsometricRoom key={room.id} room={room} />
      ))}
    </group>
  );
}
