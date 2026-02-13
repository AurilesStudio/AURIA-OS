import { useMemo } from "react";
import { Line, Text } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import type { RoomData } from "@/types";
import { ROOM_SIZE, ROOM_FLOOR_COLOR, ROOM_FLOOR_OPACITY } from "@/types";

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

/** Renders all rooms from the store */
export function IsometricRooms() {
  const rooms = useStore((s) => s.rooms);

  return (
    <group>
      {rooms.map((room) => (
        <IsometricRoom key={room.id} room={room} />
      ))}
    </group>
  );
}
