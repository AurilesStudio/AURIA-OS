import { useMemo } from "react";
import { Line, Text } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import type { RoomData } from "@/types";
import { ROOM_SIZE, ROOM_FLOOR_COLOR, ROOM_FLOOR_OPACITY, TRADING_ROOM_SIZE } from "@/types";
import type { Project } from "@/types";

const hw = ROOM_SIZE.width / 2;
const hd = ROOM_SIZE.depth / 2;

const thw = TRADING_ROOM_SIZE.width / 2;
const thd = TRADING_ROOM_SIZE.depth / 2;

const BORDER_POINTS: [number, number, number][] = [
  [-hw, 0.01, -hd],
  [hw, 0.01, -hd],
  [hw, 0.01, hd],
  [-hw, 0.01, hd],
  [-hw, 0.01, -hd],
];

/** Single room zone with neon border outline + label + number */
function IsometricRoom({ room, roomNumber }: { room: RoomData; roomNumber: number }) {
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
        lineWidth={2}
        transparent
        opacity={0.12}
      />

      {/* Neon glow border (wider, transparent, underneath) */}
      <Line
        points={points}
        color={room.borderColor}
        lineWidth={4}
        transparent
        opacity={0.04}
      />

      {/* Room number — large, centered, neon glow */}
      <Text
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2.8}
        color={room.borderColor}
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.4}
      >
        {String(roomNumber)}
        <meshStandardMaterial
          color={room.borderColor}
          emissive={room.borderColor}
          emissiveIntensity={1.5}
          transparent
          opacity={0.4}
          toneMapped={false}
        />
      </Text>

      {/* Room label — flat on floor, left-aligned to border, neon glow */}
      <Text
        position={[-hw, 0.03, hd + 0.45]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.28}
        color={room.borderColor}
        anchorX="left"
        anchorY="top"
        fillOpacity={0.9}
        letterSpacing={0.08}
        maxWidth={ROOM_SIZE.width}
      >
        {room.label.toUpperCase()}
        <meshStandardMaterial
          color={room.borderColor}
          emissive={room.borderColor}
          emissiveIntensity={1.5}
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </Text>
    </group>
  );
}

/** Trading room thematic text mapping */
const TRADING_ROOM_GLYPHS: Record<string, string> = {
  "room-oracle": "EYE",
  "room-forge": "FORGE",
  "room-safe": "SAFE",
};

const TRADING_BORDER_POINTS: [number, number, number][] = [
  [-thw, 0.01, -thd],
  [thw, 0.01, -thd],
  [thw, 0.01, thd],
  [-thw, 0.01, thd],
  [-thw, 0.01, -thd],
];

/** Single trading sub-room — larger footprint with neon glow */
function TradingRoom({ room }: { room: RoomData }) {
  const points = useMemo(() => TRADING_BORDER_POINTS, []);
  const glyph = TRADING_ROOM_GLYPHS[room.id] ?? "";

  return (
    <group position={room.position}>
      {/* Semi-transparent dark floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[TRADING_ROOM_SIZE.width, TRADING_ROOM_SIZE.depth]} />
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
        lineWidth={2}
        transparent
        opacity={0.18}
      />

      {/* Neon glow border (wider, transparent, underneath) */}
      <Line
        points={points}
        color={room.borderColor}
        lineWidth={5}
        transparent
        opacity={0.06}
      />

      {/* Thematic glyph — large, centered, neon glow */}
      <Text
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={2.2}
        color={room.borderColor}
        anchorX="center"
        anchorY="middle"
        fillOpacity={0.35}
      >
        {glyph}
        <meshStandardMaterial
          color={room.borderColor}
          emissive={room.borderColor}
          emissiveIntensity={1.5}
          transparent
          opacity={0.35}
          toneMapped={false}
        />
      </Text>

      {/* Room label — flat on floor, left-aligned to border */}
      <Text
        position={[-thw, 0.03, thd + 0.45]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.28}
        color={room.borderColor}
        anchorX="left"
        anchorY="top"
        fillOpacity={0.9}
        letterSpacing={0.08}
        maxWidth={TRADING_ROOM_SIZE.width}
      >
        {room.label.toUpperCase()}
        <meshStandardMaterial
          color={room.borderColor}
          emissive={room.borderColor}
          emissiveIntensity={1.5}
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </Text>
    </group>
  );
}

const FRAME_PADDING = 2.8;
const FRAME_COLOR = "#a855f7";
const FRAME_LABEL_COLOR = "#e0c0ff";

/** Bounding frame around all rooms of a project */
function ProjectFrame({
  rooms,
  project,
  isActive,
}: {
  rooms: RoomData[];
  project: Project;
  isActive: boolean;
}) {
  const setActiveProjectId = useStore((s) => s.setActiveProjectId);
  const frameOpacity = isActive ? 0.4 : 0.15;
  const isTrading = project.layoutType === "trading";
  const roomHw = isTrading ? thw : hw;
  const roomHd = isTrading ? thd : hd;

  const bounds = useMemo(() => {
    if (rooms.length === 0) return null;
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const r of rooms) {
      minX = Math.min(minX, r.position[0] - roomHw);
      maxX = Math.max(maxX, r.position[0] + roomHw);
      minZ = Math.min(minZ, r.position[2] - roomHd);
      maxZ = Math.max(maxZ, r.position[2] + roomHd);
    }
    const pad = FRAME_PADDING;
    const x0 = minX - pad, x1 = maxX + pad;
    const z0 = minZ - pad, z1 = maxZ + pad;
    const y = 0.005;
    return {
      outline: [
        [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [x0, y, z0],
      ] as [number, number, number][],
      labelPos: [x0, 0.006, z0 - 0.35] as [number, number, number],
      center: [(x0 + x1) / 2, 0.001, (z0 + z1) / 2] as [number, number, number],
      size: [x1 - x0, z1 - z0] as [number, number],
    };
  }, [rooms, roomHw, roomHd]);

  if (!bounds) return null;

  return (
    <group>
      <Line
        points={bounds.outline}
        color={FRAME_COLOR}
        lineWidth={1}
        transparent
        opacity={frameOpacity}
        linewidth={1}
      />
      <Text
        position={bounds.labelPos}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.42}
        color={FRAME_LABEL_COLOR}
        anchorX="left"
        anchorY="bottom"
        fillOpacity={isActive ? 0.7 : 0.35}
        letterSpacing={0.08}
      >
        {project.name.toUpperCase()}
        <meshBasicMaterial color={FRAME_LABEL_COLOR} transparent opacity={isActive ? 0.7 : 0.35} />
      </Text>

      {/* Clickable zone — click to switch active project */}
      {!isActive && (
        <mesh
          position={bounds.center}
          rotation-x={-Math.PI / 2}
          onClick={(e) => {
            e.stopPropagation();
            setActiveProjectId(project.id);
          }}
          visible={false}
        >
          <planeGeometry args={bounds.size} />
          <meshBasicMaterial />
        </mesh>
      )}
    </group>
  );
}

/** Renders all rooms from the store (all projects visible simultaneously) */
export function IsometricRooms() {
  const projects = useStore((s) => s.workspaceProjects);
  const rooms = useStore((s) => s.rooms);
  const activeProjectId = useStore((s) => s.activeProjectId);

  return (
    <group>
      {projects.map((project) => {
        const projectRooms = rooms.filter((r) => r.projectId === project.id);
        const isActive = project.id === activeProjectId;
        const isTrading = project.layoutType === "trading";
        return (
          <group key={project.id}>
            {projectRooms.length > 0 && (
              <ProjectFrame rooms={projectRooms} project={project} isActive={isActive} />
            )}
            {projectRooms.map((room, i) =>
              isTrading ? (
                <TradingRoom key={room.id} room={room} />
              ) : (
                <IsometricRoom key={room.id} room={room} roomNumber={i + 1} />
              ),
            )}
          </group>
        );
      })}
    </group>
  );
}
