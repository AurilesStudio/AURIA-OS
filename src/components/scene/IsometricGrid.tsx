import { useMemo } from "react";
import { Html, Line } from "@react-three/drei";
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

      {/* Room label at bottom-left edge */}
      <Html
        position={[-hw + 0.3, 0.02, hd + 0.15]}
        center={false}
        distanceFactor={10}
        zIndexRange={[5, 0]}
      >
        <div
          className="pointer-events-none select-none whitespace-nowrap font-mono text-[11px] font-semibold uppercase tracking-widest"
          style={{
            color: room.borderColor,
            opacity: 0.6,
            textShadow: `0 0 6px ${room.borderColor}40`,
          }}
        >
          {room.label}
        </div>
      </Html>
    </group>
  );
}
