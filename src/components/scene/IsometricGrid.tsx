import { useMemo } from "react";
import { Line, Text } from "@react-three/drei";
import { useScene } from "@/hooks/useScene";

/** Rectangular room zone with neon border outline + label */
export function IsometricRoom() {
  const { room } = useScene();
  const hw = room.width / 2;
  const hd = room.depth / 2;

  const borderPoints = useMemo<[number, number, number][]>(
    () => [
      [-hw, 0.01, -hd],
      [hw, 0.01, -hd],
      [hw, 0.01, hd],
      [-hw, 0.01, hd],
      [-hw, 0.01, -hd],
    ],
    [hw, hd],
  );

  return (
    <group>
      {/* Semi-transparent dark floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[room.width, room.depth]} />
        <meshStandardMaterial
          color={room.floorColor}
          transparent
          opacity={room.floorOpacity}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Neon border outline */}
      <Line
        points={borderPoints}
        color={room.borderColor}
        lineWidth={1.5}
      />

      {/* Room label — flat on floor along bottom-left border (front-left edge, +Z side) */}
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
