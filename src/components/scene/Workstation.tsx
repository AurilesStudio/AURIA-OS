import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WorkstationProps {
  position: [number, number, number];
  rotation: number;
  color: string;
  isActive: boolean;
}

export function Workstation({ position, rotation, color, isActive }: WorkstationProps) {
  const screenRef = useRef<THREE.Mesh>(null);
  const targetIntensity = isActive ? 0.4 : 0.15;
  const intensityRef = useRef(targetIntensity);

  useFrame((_, delta) => {
    if (!screenRef.current) return;
    // Smoothly lerp emissive intensity
    intensityRef.current += (targetIntensity - intensityRef.current) * Math.min(delta * 4, 1);
    const mat = screenRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = intensityRef.current;
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Desk surface */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.04, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>

      {/* Desk legs */}
      <mesh position={[-0.3, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.38, 8]} />
        <meshStandardMaterial color="#111122" roughness={0.9} />
      </mesh>
      <mesh position={[0.3, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.38, 8]} />
        <meshStandardMaterial color="#111122" roughness={0.9} />
      </mesh>

      {/* Monitor stand */}
      <mesh position={[0, 0.58, -0.18]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
        <meshStandardMaterial color="#111122" roughness={0.9} />
      </mesh>

      {/* Monitor screen */}
      <mesh ref={screenRef} position={[0, 0.72, -0.18]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.02]} />
        <meshStandardMaterial
          color="#0a0a15"
          emissive={color}
          emissiveIntensity={targetIntensity}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
}
