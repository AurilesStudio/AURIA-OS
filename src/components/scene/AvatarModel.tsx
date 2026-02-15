import { useRef, useMemo, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { Group } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { AvatarData } from "@/types";
import { useStore } from "@/store/useStore";
import { useAvatarAction } from "@/hooks/useAvatarAction";
import { AvatarGlow } from "./AvatarGlow";
import { AvatarLabel } from "./AvatarLabel";

// ── Constants ──────────────────────────────────────────────────
const TARGET_HEIGHT = 1.45; // match procedural avatar approx height

interface AvatarModelProps {
  avatar: AvatarData;
  onDragStart?: (avatarId: string, e: ThreeEvent<PointerEvent>) => void;
}

// ── GLB avatar with auto-fit + idle animation ────────────────

function GltfAvatar({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const groupRef = useRef<Group>(null);

  const clone = useMemo(() => {
    const c = cloneSkeleton(gltf.scene) as Group;

    // Auto-fit: compute bounds, scale to target height, place feet on ground
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      c.scale.multiplyScalar(TARGET_HEIGHT / maxDim);
    }

    const fitted = new THREE.Box3().setFromObject(c);
    const center = fitted.getCenter(new THREE.Vector3());

    c.position.x -= center.x;
    c.position.z -= center.z;
    c.position.y -= fitted.min.y;

    return c;
  }, [gltf.scene]);

  // Play first (idle) animation if present
  const { actions } = useAnimations(gltf.animations, groupRef);

  useEffect(() => {
    const names = Object.keys(actions);
    const idle =
      names.find((n) => /idle/i.test(n)) ??
      names.find((n) => /stand/i.test(n)) ??
      names[0] ??
      null;
    if (!idle) return;
    const action = actions[idle];
    action?.reset().fadeIn(0.3).play();
    return () => {
      action?.fadeOut(0.3);
    };
  }, [actions]);

  return (
    <group ref={groupRef}>
      <primitive object={clone} />
    </group>
  );
}

// ── Procedural chibi avatar (original) ──────────────────────
function ProceduralAvatar({
  color,
  skin,
  ei,
}: {
  color: string;
  skin: string;
  ei: number;
}) {
  return (
    <>
      {/* === LEGS === */}
      <mesh position={[-0.12, 0.2, 0]} castShadow>
        <boxGeometry args={[0.18, 0.4, 0.2]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>
      <mesh position={[0.12, 0.2, 0]} castShadow>
        <boxGeometry args={[0.18, 0.4, 0.2]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>

      {/* === BODY (torso) === */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.5, 0.45, 0.3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={ei}
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>

      {/* === ARMS === */}
      <mesh position={[-0.35, 0.58, 0]} rotation={[0, 0, 0.1]} castShadow>
        <boxGeometry args={[0.15, 0.38, 0.18]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={ei * 0.5}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0.35, 0.58, 0]} rotation={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[0.15, 0.38, 0.18]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={ei * 0.5}
          roughness={0.7}
        />
      </mesh>

      {/* === HEAD (big, chibi style) === */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.45]} />
        <meshStandardMaterial color={skin} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Hair / helmet top */}
      <mesh position={[0, 1.38, 0]}>
        <boxGeometry args={[0.52, 0.1, 0.47]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={ei}
          roughness={0.5}
        />
      </mesh>
      {/* Hair sides */}
      <mesh position={[0, 1.2, -0.2]}>
        <boxGeometry args={[0.52, 0.35, 0.1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={ei * 0.5}
          roughness={0.5}
        />
      </mesh>

      {/* === EYES === */}
      <mesh position={[-0.12, 1.12, 0.23]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial color="#111111" roughness={0.3} />
      </mesh>
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
    </>
  );
}

// ── Main avatar component ───────────────────────────────────
export function AvatarModel({ avatar, onDragStart }: AvatarModelProps) {
  const groupRef = useRef<Group>(null);
  const selectedAvatarId = useStore((s) => s.selectedAvatarId);

  const isSelected = selectedAvatarId === avatar.id;

  useAvatarAction(avatar.id);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (onDragStart) {
      onDragStart(avatar.id, e);
    }
  };

  const skin = "#c8956c";
  const outfit = avatar.color;
  const ei = isSelected ? 0.4 : 0.15;

  return (
    <group position={avatar.position}>
      <group ref={groupRef} onPointerDown={handlePointerDown}>
        {avatar.modelUrl ? (
          <GltfAvatar url={avatar.modelUrl} />
        ) : (
          <ProceduralAvatar color={outfit} skin={skin} ei={ei} />
        )}

        <AvatarLabel name={avatar.name} color={avatar.color} status={avatar.status} />
      </group>

      <AvatarGlow visible={isSelected} status={avatar.status} />
    </group>
  );
}
