import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

/** Hologram prop for The Oracle room — semi-transparent rotating cube with cyan glow */
function OracleHologram({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.5;
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.4 + Math.sin(t * 2) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.8;
    }
  });

  return (
    <group position={position}>
      {/* Floating diamond */}
      <mesh ref={meshRef} position={[0, 2.2, 0]}>
        <octahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial
          color="#00ffcc"
          emissive="#00ffcc"
          emissiveIntensity={0.4}
          transparent
          opacity={0.5}
          roughness={0.1}
          metalness={0.9}
          toneMapped={false}
        />
      </mesh>

      {/* Rotating ring */}
      <mesh ref={ringRef} position={[0, 2.2, 0]}>
        <torusGeometry args={[1.1, 0.03, 8, 32]} />
        <meshStandardMaterial
          color="#00ffcc"
          emissive="#00ffcc"
          emissiveIntensity={0.6}
          transparent
          opacity={0.3}
          toneMapped={false}
        />
      </mesh>

      {/* Base pedestal */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.5, 0.7, 0.6, 6]} />
        <meshStandardMaterial color="#0a1a1a" roughness={0.7} metalness={0.5} />
      </mesh>
    </group>
  );
}

/** Anvil prop for The Strategy Forge room — glowing amber block */
function ForgeAnvil({ position }: { position: [number, number, number] }) {
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(t * 1.5) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Anvil base */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.2, 0.5, 0.8]} />
        <meshStandardMaterial color="#1a1008" roughness={0.6} metalness={0.7} />
      </mesh>

      {/* Anvil top — glowing */}
      <mesh ref={glowRef} position={[0, 0.65, 0]}>
        <boxGeometry args={[1.4, 0.3, 0.6]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Hammer nearby */}
      <mesh position={[0.9, 0.15, 0.5]} rotation={[0, 0.3, Math.PI / 6]}>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.8} metalness={0.3} />
      </mesh>
      <mesh position={[0.9, 0.45, 0.5]} rotation={[0, 0.3, Math.PI / 6]}>
        <boxGeometry args={[0.25, 0.2, 0.2]} />
        <meshStandardMaterial color="#555555" roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  );
}

/** Vault door prop for The Safe room — cylindrical vault with red glow */
function SafeVault({ position }: { position: [number, number, number] }) {
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.25 + Math.sin(t * 1.2) * 0.08;
    }
  });

  return (
    <group position={position}>
      {/* Vault body */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[1.6, 2.0, 1.0]} />
        <meshStandardMaterial color="#1a0a0a" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Vault door — cylindrical */}
      <mesh ref={glowRef} position={[0, 1.0, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.15, 16]} />
        <meshStandardMaterial
          color="#ff003c"
          emissive="#ff003c"
          emissiveIntensity={0.25}
          roughness={0.3}
          metalness={0.9}
          toneMapped={false}
        />
      </mesh>

      {/* Handle */}
      <mesh position={[0, 1.0, 0.55]}>
        <torusGeometry args={[0.2, 0.03, 8, 16]} />
        <meshStandardMaterial color="#888888" roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  );
}

/** Trading scene props — positioned in each trading sub-room */
export function TradingSceneProps() {
  const rooms = useStore((s) => s.rooms);

  const oracle = rooms.find((r) => r.id === "room-oracle");
  const forge = rooms.find((r) => r.id === "room-forge");
  const safe = rooms.find((r) => r.id === "room-safe");

  return (
    <group>
      {oracle && (
        <OracleHologram
          position={[oracle.position[0] + 3, 0, oracle.position[2] - 2]}
        />
      )}
      {forge && (
        <ForgeAnvil
          position={[forge.position[0] + 3, 0, forge.position[2] - 2]}
        />
      )}
      {safe && (
        <SafeVault
          position={[safe.position[0] + 3, 0, safe.position[2] - 2]}
        />
      )}
    </group>
  );
}
