import { useRef, useMemo, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";
import type { Group } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import {
  buildBoneMap,
  retargetClip,
  getBindPoseQuaternions,
  getBoneNamesFromClips,
  getBoneNamesFromScene,
} from "@/lib/animationRetarget";

const AVATAR_URL = "/models/goku_tripo.glb";
const ANIM_URLS = ["/animations/happy-idle.fbx", "/animations/walking.fbx"];
const ANIM_NAMES = ["Happy Idle", "Walking"];
const FIT_HEIGHT = 1.6;
const WALK_SPEED = 1.2;
const PATROL_MARGIN = 1.5; // distance from room edge

function AuriaGltf() {
  const gltf = useGLTF(AVATAR_URL);
  const fbxFiles = ANIM_URLS.map((url) => useLoader(FBXLoader, url));
  const wrapRef = useRef<Group>(null);
  const activeRef = useRef<THREE.AnimationAction | null>(null);
  const setAuriaClipNames = useStore((s) => s.setAuriaClipNames);
  const setAuriaActiveClip = useStore((s) => s.setAuriaActiveClip);

  // ── Build mixer with retargeted animations ──
  const { mixer, actionMap, clipNames } = useMemo(() => {
    gltf.scene.traverse((obj) => {
      if ((obj as THREE.SkinnedMesh).isSkinnedMesh) {
        const sm = obj as THREE.SkinnedMesh;
        sm.frustumCulled = false;
        if (!sm.skeleton.boneTexture) {
          sm.skeleton.computeBoneTexture();
        }
      }
    });

    const targetBones = getBoneNamesFromScene(gltf.scene);
    const targetBindPose = getBindPoseQuaternions(gltf.scene);

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
        mixer: new THREE.AnimationMixer(gltf.scene),
        actionMap: {} as Record<string, THREE.AnimationAction>,
        clipNames: [] as string[],
      };
    }

    const sourceBones = getBoneNamesFromClips(allSourceClips);
    const boneMap = buildBoneMap(sourceBones, targetBones);

    const mixer = new THREE.AnimationMixer(gltf.scene);
    const map: Record<string, THREE.AnimationAction> = {};
    const names: string[] = [];

    allSourceClips.forEach((clip, i) => {
      const displayName = ANIM_NAMES[i] ?? clip.name;
      const remapped = retargetClip(
        clip,
        boneMap,
        sourceBindPose,
        targetBindPose,
        displayName,
      );
      if (remapped.tracks.length > 0) {
        map[displayName] = mixer.clipAction(remapped);
        names.push(displayName);
      }
    });

    return { mixer, actionMap: map, clipNames: names };
  }, [gltf, ...fbxFiles]);

  // ── Auto-fit ──
  useEffect(() => {
    if (!wrapRef.current) return;
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const s = FIT_HEIGHT / maxDim;
      wrapRef.current.scale.set(s, s, s);
    }
    const b = new THREE.Box3().setFromObject(wrapRef.current);
    const center = b.getCenter(new THREE.Vector3());
    wrapRef.current.position.set(-center.x, -b.min.y, -center.z);
  }, [gltf.scene]);

  // ── Play first clip + publish to store ──
  useEffect(() => {
    setAuriaClipNames(clipNames);
    if (clipNames.length > 0) {
      const first = clipNames[0]!;
      const action = actionMap[first]!;
      action.play();
      activeRef.current = action;
      setAuriaActiveClip(first);
    }
    return () => {
      mixer.stopAllAction();
    };
  }, [mixer, actionMap, clipNames, setAuriaClipNames, setAuriaActiveClip]);

  // ── Clip switching ──
  const clipRequest = useStore((s) => s.auriaClipRequest);
  useEffect(() => {
    if (!clipRequest) return;
    const newAction = actionMap[clipRequest];
    if (!newAction) return;

    const oldAction = activeRef.current;
    if (oldAction && oldAction !== newAction) {
      newAction.reset();
      newAction.play();
      newAction.crossFadeFrom(oldAction, 0.5);
    } else {
      newAction.play();
    }

    activeRef.current = newAction;
    setAuriaActiveClip(clipRequest);
    useStore.setState({ auriaClipRequest: null });
  }, [clipRequest, actionMap, setAuriaActiveClip]);

  // ── Render loop ──
  useFrame((_, delta) => {
    mixer.update(delta);
  });

  return (
    <group ref={wrapRef}>
      <primitive object={gltf.scene} />
    </group>
  );
}

export function AuriaMascot() {
  const rooms = useStore((s) => s.rooms);
  const setCommandCenterOpen = useStore((s) => s.setCommandCenterOpen);
  const auriaActiveClip = useStore((s) => s.auriaActiveClip);
  const groupRef = useRef<Group>(null);

  // Patrol state — persists across renders
  const patrol = useRef({
    targetX: 0,
    targetZ: 0,
    needsNewTarget: true,
  });

  const roomCenter = useMemo<[number, number, number]>(() => {
    const r = rooms[0];
    return r ? [r.position[0], 0, r.position[2]] : [0, 0, 0];
  }, [rooms]);

  // Pick a random patrol waypoint within the room
  const pickNewTarget = () => {
    const halfW = 5 - PATROL_MARGIN; // ROOM_SIZE.width / 2
    const halfD = 4 - PATROL_MARGIN; // ROOM_SIZE.depth / 2
    patrol.current.targetX = roomCenter[0] + (Math.random() - 0.5) * 2 * halfW;
    patrol.current.targetZ = roomCenter[2] + (Math.random() - 0.5) * 2 * halfD;
    patrol.current.needsNewTarget = false;
  };

  // Reset patrol when clip changes
  useEffect(() => {
    patrol.current.needsNewTarget = true;
  }, [auriaActiveClip]);

  // Locomotion: move toward waypoint when walking
  const isWalking = auriaActiveClip === "Walking";

  useFrame((_, delta) => {
    if (!groupRef.current || !isWalking) return;

    const p = patrol.current;
    if (p.needsNewTarget) pickNewTarget();

    const pos = groupRef.current.position;
    const dx = p.targetX - pos.x;
    const dz = p.targetZ - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.15) {
      // Reached waypoint, pick a new one
      pickNewTarget();
      return;
    }

    // Move toward target
    const step = Math.min(WALK_SPEED * delta, dist);
    pos.x += (dx / dist) * step;
    pos.z += (dz / dist) * step;

    // Face movement direction
    groupRef.current.rotation.y = Math.atan2(dx, dz);
  });

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setCommandCenterOpen(true);
  };

  return (
    <group ref={groupRef} position={roomCenter} onPointerDown={handleClick}>
      <AuriaGltf />
    </group>
  );
}
