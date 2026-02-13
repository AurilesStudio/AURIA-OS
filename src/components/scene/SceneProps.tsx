import { useMemo } from "react";
import { Html } from "@react-three/drei";

/** Billboard screen prop */
function Billboard({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, -Math.PI / 4, 0]}>
      {/* Base */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.7, 0.24, 0.35]} />
        <meshStandardMaterial color="#222230" roughness={0.8} metalness={0.3} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.08, 0.5, 0.08]} />
        <meshStandardMaterial color="#2a2a38" roughness={0.7} metalness={0.4} />
      </mesh>
      {/* Screen frame */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[1.8, 1.0, 0.07]} />
        <meshStandardMaterial color="#222230" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Screen surface */}
      <mesh position={[0, 1.05, 0.04]}>
        <planeGeometry args={[1.5, 0.75]} />
        <meshStandardMaterial
          color="#1a0a18"
          emissive="#3a1028"
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Screen label */}
      <Html position={[0, 1.05, 0.08]} center distanceFactor={6} zIndexRange={[5, 0]}>
        <div className="pointer-events-none select-none text-center">
          <div className="text-[10px] font-bold" style={{ color: "#ff3c3c" }}>
            AURIA
          </div>
          <div className="text-[7px]" style={{ color: "#6b6b80" }}>
            Command Center
          </div>
        </div>
      </Html>
    </group>
  );
}

/** Pile of papers / objects on the floor */
function FloorObjects({ position }: { position: [number, number, number] }) {
  // Pre-compute random offsets once
  const offsets = useMemo(
    () =>
      [0, 0.04, 0.08, 0.11].map((y, i) => ({
        y,
        x: (i * 0.07 - 0.1),
        z: (i * 0.05 - 0.08),
        ry: i * 0.4 + 0.2,
        color: i % 2 === 0 ? "#2a1a3e" : "#1e1228",
      })),
    [],
  );

  return (
    <group position={position}>
      {offsets.map((o, i) => (
        <mesh key={i} position={[o.x, o.y, o.z]} rotation={[0, o.ry, 0]}>
          <boxGeometry args={[0.55, 0.03, 0.4]} />
          <meshStandardMaterial color={o.color} roughness={0.9} />
        </mesh>
      ))}
      {/* Crystal on top */}
      <mesh position={[0, 0.2, 0]} rotation={[0, 0.5, 0]}>
        <octahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial
          color="#bf00ff"
          emissive="#bf00ff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

export function SceneProps() {
  return (
    <group>
      <Billboard position={[2.8, 0, -2.2]} />
      <FloorObjects position={[-2.8, 0, 2]} />
    </group>
  );
}
