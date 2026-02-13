import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { AvatarData } from "@/types";
import { useStore } from "@/store/useStore";
import { useAvatarAction } from "@/hooks/useAvatarAction";
import { AvatarGlow } from "./AvatarGlow";
import { AvatarLabel } from "./AvatarLabel";

interface AvatarModelProps {
  avatar: AvatarData;
  onDragStart?: (avatarId: string, e: ThreeEvent<PointerEvent>) => void;
}

/**
 * Voxel / chibi-style procedural avatar.
 * Blocky proportions: big head, stubby body, small limbs.
 */
export function AvatarModel({ avatar, onDragStart }: AvatarModelProps) {
  const groupRef = useRef<Group>(null);
  const selectedAvatarId = useStore((s) => s.selectedAvatarId);

  const isSelected = selectedAvatarId === avatar.id;

  useAvatarAction(avatar.id);

  // Idle bob + working animation
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    if (avatar.status === "working") {
      groupRef.current.position.y = Math.sin(t * 6) * 0.06;
      groupRef.current.rotation.y = Math.sin(t * 2) * 0.25;
    } else {
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.03;
      groupRef.current.rotation.y = 0;
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (onDragStart) {
      onDragStart(avatar.id, e);
    }
  };

  // Skin tone (warm) vs outfit (avatar color)
  const skin = "#c8956c";
  const outfit = avatar.color;
  const ei = isSelected ? 0.4 : 0.15;

  return (
    <group position={avatar.position}>
      <group ref={groupRef} onPointerDown={handlePointerDown}>

        {/* === LEGS === */}
        {/* Left leg */}
        <mesh position={[-0.12, 0.2, 0]} castShadow>
          <boxGeometry args={[0.18, 0.4, 0.2]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
        </mesh>
        {/* Right leg */}
        <mesh position={[0.12, 0.2, 0]} castShadow>
          <boxGeometry args={[0.18, 0.4, 0.2]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
        </mesh>

        {/* === BODY (torso) === */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.5, 0.45, 0.3]} />
          <meshStandardMaterial
            color={outfit}
            emissive={outfit}
            emissiveIntensity={ei}
            roughness={0.6}
            metalness={0.3}
          />
        </mesh>

        {/* === ARMS === */}
        {/* Left arm */}
        <mesh position={[-0.35, 0.58, 0]} rotation={[0, 0, 0.1]} castShadow>
          <boxGeometry args={[0.15, 0.38, 0.18]} />
          <meshStandardMaterial
            color={outfit}
            emissive={outfit}
            emissiveIntensity={ei * 0.5}
            roughness={0.7}
          />
        </mesh>
        {/* Right arm */}
        <mesh position={[0.35, 0.58, 0]} rotation={[0, 0, -0.1]} castShadow>
          <boxGeometry args={[0.15, 0.38, 0.18]} />
          <meshStandardMaterial
            color={outfit}
            emissive={outfit}
            emissiveIntensity={ei * 0.5}
            roughness={0.7}
          />
        </mesh>

        {/* === HEAD (big, chibi style) === */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.45]} />
          <meshStandardMaterial color={skin} roughness={0.7} metalness={0.05} />
        </mesh>

        {/* Hair / helmet top — avatar color */}
        <mesh position={[0, 1.38, 0]}>
          <boxGeometry args={[0.52, 0.1, 0.47]} />
          <meshStandardMaterial
            color={outfit}
            emissive={outfit}
            emissiveIntensity={ei}
            roughness={0.5}
          />
        </mesh>
        {/* Hair sides */}
        <mesh position={[0, 1.2, -0.2]}>
          <boxGeometry args={[0.52, 0.35, 0.1]} />
          <meshStandardMaterial
            color={outfit}
            emissive={outfit}
            emissiveIntensity={ei * 0.5}
            roughness={0.5}
          />
        </mesh>

        {/* === EYES === */}
        {/* Left eye */}
        <mesh position={[-0.12, 1.12, 0.23]}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
          <meshStandardMaterial color="#111111" roughness={0.3} />
        </mesh>
        {/* Right eye */}
        <mesh position={[0.12, 1.12, 0.23]}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
          <meshStandardMaterial color="#111111" roughness={0.3} />
        </mesh>
        {/* Eye glints */}
        <mesh position={[-0.1, 1.14, 0.24]}>
          <boxGeometry args={[0.03, 0.03, 0.01]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.14, 1.14, 0.24]}>
          <boxGeometry args={[0.03, 0.03, 0.01]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* === BRAND EMBLEM on torso === */}
        <mesh position={[0, 0.63, 0.16]}>
          <circleGeometry args={[0.08, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>

        <AvatarLabel name={avatar.name} color={avatar.color} status={avatar.status} />
      </group>

      <AvatarGlow visible={isSelected} status={avatar.status} />
    </group>
  );
}
