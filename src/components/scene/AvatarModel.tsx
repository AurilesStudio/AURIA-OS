import { useRef, useMemo, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { Group } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { AvatarData } from "@/types";
import { ROOM_SIZE } from "@/types";
import { useStore } from "@/store/useStore";
import { useAvatarAction } from "@/hooks/useAvatarAction";
import { AvatarGlow } from "./AvatarGlow";
import { AvatarLabel } from "./AvatarLabel";
import {
  buildBoneMap,
  retargetClip,
  getBindPoseQuaternions,
  getBoneNamesFromClips,
  getBoneNamesFromScene,
} from "@/lib/animationRetarget";

// ── Constants ──────────────────────────────────────────────────
const TARGET_HEIGHT = 1.45;
const ANIM_URLS = ["/animations/happy-idle.fbx", "/animations/walking.fbx"];
const ANIM_NAMES = ["Happy Idle", "Walking"];
const WALK_SPEED = 1.2;
const PATROL_MARGIN = 1.5;

interface AvatarModelProps {
  avatar: AvatarData;
  onDragStart?: (avatarId: string, e: ThreeEvent<PointerEvent>) => void;
}

// ── GLB avatar with FBX retargeted animations ────────────────
function GltfAvatar({ url, avatarId }: { url: string; avatarId: string }) {
  const gltf = useGLTF(url);
  const fbxFiles = ANIM_URLS.map((u) => useLoader(FBXLoader, u));
  const groupRef = useRef<Group>(null);
  const activeRef = useRef<THREE.AnimationAction | null>(null);
  const activeClip = useStore((s) => s.avatars.find((a) => a.id === avatarId)?.activeClip ?? "");
  const setAvailableClipNames = useStore((s) => s.setAvailableClipNames);
  const setAvatarActiveClip = useStore((s) => s.setAvatarActiveClip);

  const { mixer, actionMap, clipNames, scene } = useMemo(() => {
    const c = cloneSkeleton(gltf.scene) as Group;

    c.traverse((obj) => {
      if ((obj as THREE.SkinnedMesh).isSkinnedMesh) {
        const sm = obj as THREE.SkinnedMesh;
        sm.frustumCulled = false;
        if (!sm.skeleton.boneTexture) {
          sm.skeleton.computeBoneTexture();
        }
      }
    });

    // Auto-fit
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) c.scale.multiplyScalar(TARGET_HEIGHT / maxDim);
    const fitted = new THREE.Box3().setFromObject(c);
    const center = fitted.getCenter(new THREE.Vector3());
    c.position.x -= center.x;
    c.position.z -= center.z;
    c.position.y -= fitted.min.y;

    // Collect bone info
    const targetBones = getBoneNamesFromScene(c);
    const targetBindPose = getBindPoseQuaternions(c);

    const allSourceClips: THREE.AnimationClip[] = [];
    let sourceBindPose = new Map<string, THREE.Quaternion>();
    for (const fbx of fbxFiles) {
      allSourceClips.push(...fbx.animations);
      if (sourceBindPose.size === 0) {
        sourceBindPose = getBindPoseQuaternions(fbx);
      }
    }

    if (allSourceClips.length === 0) {
      return {
        mixer: new THREE.AnimationMixer(c),
        actionMap: {} as Record<string, THREE.AnimationAction>,
        clipNames: [] as string[],
        scene: c,
      };
    }

    const sourceBones = getBoneNamesFromClips(allSourceClips);
    const boneMap = buildBoneMap(sourceBones, targetBones);

    const mixer = new THREE.AnimationMixer(c);
    const map: Record<string, THREE.AnimationAction> = {};
    const names: string[] = [];

    allSourceClips.forEach((clip, i) => {
      const displayName = ANIM_NAMES[i] ?? clip.name;
      const remapped = retargetClip(clip, boneMap, sourceBindPose, targetBindPose, displayName);
      if (remapped.tracks.length > 0) {
        map[displayName] = mixer.clipAction(remapped);
        names.push(displayName);
      }
    });

    return { mixer, actionMap: map, clipNames: names, scene: c };
  }, [gltf.scene, ...fbxFiles]);

  // Publish available clip names (shared across all avatars)
  useEffect(() => {
    if (clipNames.length > 0) {
      setAvailableClipNames(clipNames);
    }
  }, [clipNames, setAvailableClipNames]);

  // Play stored clip (or first clip) on mount
  useEffect(() => {
    if (clipNames.length === 0) return;
    const target = activeClip && actionMap[activeClip] ? activeClip : clipNames[0]!;
    const action = actionMap[target]!;
    action.play();
    activeRef.current = action;
    if (target !== activeClip) setAvatarActiveClip(avatarId, target);
    return () => {
      mixer.stopAllAction();
      activeRef.current = null;
    };
  }, [mixer, actionMap, clipNames, avatarId, setAvatarActiveClip]);

  // React to activeClip changes (from info panel)
  useEffect(() => {
    if (!activeClip) return;
    const newAction = actionMap[activeClip];
    if (!newAction) return;

    const oldAction = activeRef.current;
    if (oldAction && oldAction !== newAction) {
      newAction.reset();
      newAction.play();
      newAction.crossFadeFrom(oldAction, 0.5);
    } else if (!oldAction) {
      newAction.play();
    }

    activeRef.current = newAction;
  }, [activeClip, actionMap]);

  useFrame((_, delta) => {
    mixer.update(delta);
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
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
  const rooms = useStore((s) => s.rooms);

  const isSelected = selectedAvatarId === avatar.id;
  const isWalking = avatar.activeClip === "Walking";

  useAvatarAction(avatar.id);

  // Patrol state
  const patrol = useRef({
    targetX: 0,
    targetZ: 0,
    needsNewTarget: true,
  });

  // Reset patrol when clip changes
  useEffect(() => {
    patrol.current.needsNewTarget = true;
  }, [avatar.activeClip]);

  // Get room bounds for patrol
  const room = rooms.find((r) => r.id === avatar.roomId);

  const pickNewTarget = () => {
    if (!room) return;
    const halfW = ROOM_SIZE.width / 2 - PATROL_MARGIN;
    const halfD = ROOM_SIZE.depth / 2 - PATROL_MARGIN;
    patrol.current.targetX = room.position[0] + (Math.random() - 0.5) * 2 * halfW;
    patrol.current.targetZ = room.position[2] + (Math.random() - 0.5) * 2 * halfD;
    patrol.current.needsNewTarget = false;
  };

  // Locomotion when walking
  useFrame((_, delta) => {
    if (!groupRef.current || !isWalking || !room) return;

    const p = patrol.current;
    if (p.needsNewTarget) pickNewTarget();

    const pos = groupRef.current.position;
    const dx = p.targetX - pos.x;
    const dz = p.targetZ - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.15) {
      pickNewTarget();
      return;
    }

    const step = Math.min(WALK_SPEED * delta, dist);
    pos.x += (dx / dist) * step;
    pos.z += (dz / dist) * step;

    // Face movement direction
    groupRef.current.rotation.y = Math.atan2(dx, dz);
  });

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
          <GltfAvatar url={avatar.modelUrl} avatarId={avatar.id} />
        ) : (
          <ProceduralAvatar color={outfit} skin={skin} ei={ei} />
        )}

        <AvatarLabel name={avatar.name} color={avatar.color} status={avatar.status} />
      </group>

      <AvatarGlow visible={isSelected} status={avatar.status} />
    </group>
  );
}
