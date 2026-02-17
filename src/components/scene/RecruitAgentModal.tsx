import { useRef, useMemo, Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { X, UserPlus, ArrowLeft } from "lucide-react";
import { useStore } from "@/store/useStore";
import { CHARACTER_CATALOG, CHARACTER_TEAMS, AVATAR_PROVIDER_LABELS } from "@/types";
import type { LLMProvider, CharacterEntry } from "@/types";
import {
  buildBoneMap,
  retargetClip,
  getBindPoseQuaternions,
  getBoneNamesFromClips,
  getBoneNamesFromScene,
} from "@/lib/animationRetarget";

const TARGET_HEIGHT = 1.6;
const IDLE_FBX = "/animations/happy-idle.fbx";

/** Animated GLB preview inside a small Canvas */
function GlbPreview({ url, rotationY = 0 }: { url: string; rotationY?: number }) {
  const gltf = useGLTF(url);
  const fbx = useLoader(FBXLoader, IDLE_FBX);
  const groupRef = useRef<THREE.Group>(null);

  const { mixer, scene } = useMemo(() => {
    const c = cloneSkeleton(gltf.scene) as THREE.Group;

    c.traverse((obj) => {
      if ((obj as THREE.SkinnedMesh).isSkinnedMesh) {
        const sm = obj as THREE.SkinnedMesh;
        sm.frustumCulled = false;
        if (!sm.skeleton.boneTexture) sm.skeleton.computeBoneTexture();
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
    c.position.y -= center.y;

    // Retarget animation
    const targetBones = getBoneNamesFromScene(c);
    const targetBindPose = getBindPoseQuaternions(c);
    const sourceClips = [...fbx.animations];
    const sourceBindPose = getBindPoseQuaternions(fbx);

    const mixer = new THREE.AnimationMixer(c);

    if (sourceClips.length > 0) {
      const sourceBones = getBoneNamesFromClips(sourceClips);
      const boneMap = buildBoneMap(sourceBones, targetBones);
      const clip = retargetClip(sourceClips[0]!, boneMap, sourceBindPose, targetBindPose, "Idle");
      if (clip.tracks.length > 0) {
        mixer.clipAction(clip).play();
      }
    }

    return { mixer, scene: c };
  }, [gltf.scene, fbx]);

  // Slow rotation + animation update
  useFrame((_, delta) => {
    mixer.update(delta);
  });

  return (
    <group ref={groupRef} rotation={[0, rotationY, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function PreviewCanvas({ url, rotationY = 0 }: { url: string; rotationY?: number }) {
  return (
    <div className="mx-auto mb-2 h-32 w-28">
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 30 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 3, 2]} intensity={1.2} />
        <Suspense fallback={null}>
          <GlbPreview url={url} rotationY={rotationY} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/** Placeholder when no 3D model is available */
function CharacterPlaceholder({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="mx-auto mb-2 flex h-32 w-28 items-center justify-center rounded-lg border border-white/10"
      style={{ backgroundColor: `${color}15` }}
    >
      <span className="text-3xl font-black opacity-40" style={{ color }}>
        {name.charAt(0)}
      </span>
    </div>
  );
}

export function RecruitAgentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addAvatar = useStore((s) => s.addAvatar);
  const rooms = useStore((s) => s.rooms);
  const avatars = useStore((s) => s.avatars);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const workspaceProjects = useStore((s) => s.workspaceProjects);
  const roles = useStore((s) => s.roles);

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTeamId, setSelectedTeamId] = useState(CHARACTER_TEAMS[0]?.id ?? "");
  const [selectedChar, setSelectedChar] = useState<CharacterEntry | null>(null);
  const [targetProjectId, setTargetProjectId] = useState(activeProjectId);
  const [provider, setProvider] = useState<LLMProvider>("claude");
  const [roleId, setRoleId] = useState("");
  const [roomId, setRoomId] = useState("");

  const targetRooms = rooms.filter((r) => r.projectId === targetProjectId);
  const deployedCharIds = new Set(
    avatars.filter((a) => a.projectId === targetProjectId).map((a) => a.characterId),
  );
  const teamCharacters = CHARACTER_CATALOG.filter(
    (c) => c.teamId === selectedTeamId && !deployedCharIds.has(c.id),
  );

  const handleSelectCharacter = (char: CharacterEntry) => {
    setSelectedChar(char);
    setRoomId(targetRooms[0]?.id ?? "");
    setStep(2);
  };

  const handleRecruit = () => {
    if (!selectedChar || !roomId) return;
    addAvatar({
      characterId: selectedChar.id,
      provider,
      roomId,
      roleId,
    });
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedChar(null);
    setTargetProjectId(activeProjectId);
    setProvider("claude");
    setRoleId("");
    setRoomId("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed left-1/2 top-1/2 z-50 w-[560px] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="overlay-glass rounded-xl border border-white/10 p-6">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {step === 2 && (
                    <button
                      onClick={() => setStep(1)}
                      className="text-text-muted transition-colors hover:text-text-primary"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  )}
                  <UserPlus className="h-5 w-5 text-neon-red" />
                  <div>
                    <h2 className="text-sm font-bold text-text-primary">
                      {step === 1 ? "Recruit Agent" : `Configure ${selectedChar?.name}`}
                    </h2>
                    <p className="text-[10px] text-text-muted">
                      {step === 1
                        ? "Select a team, then pick a character"
                        : "Choose provider, role and room"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-text-muted transition-colors hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {step === 1 ? (
                /* ── Step 1: Team tabs + character grid ── */
                <div className="flex flex-col gap-4">
                  {/* Team tabs */}
                  <div className="flex gap-1 rounded-lg border border-white/5 bg-bg-base/30 p-1">
                    {CHARACTER_TEAMS.map((team) => {
                      const isActive = team.id === selectedTeamId;
                      return (
                        <button
                          key={team.id}
                          onClick={() => setSelectedTeamId(team.id)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-all"
                          style={{
                            backgroundColor: isActive ? `${team.color}20` : "transparent",
                            color: isActive ? team.color : "rgba(255,255,255,0.45)",
                            borderBottom: isActive ? `2px solid ${team.color}` : "2px solid transparent",
                          }}
                        >
                          <span>{team.icon}</span>
                          {team.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Characters grid */}
                  <div className="grid grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {teamCharacters.length === 0 ? (
                      <p className="col-span-3 py-8 text-center text-xs text-text-muted">
                        All characters from this team are already deployed.
                      </p>
                    ) : (
                      teamCharacters.map((char) => (
                        <button
                          key={char.id}
                          onClick={() => handleSelectCharacter(char)}
                          className="group flex flex-col items-center rounded-lg border border-white/5 bg-bg-base/40 px-3 py-4 transition-all hover:border-white/15 hover:bg-bg-base/60"
                        >
                          {char.modelUrl ? (
                            <PreviewCanvas url={char.modelUrl} rotationY={char.rotationY} />
                          ) : (
                            <CharacterPlaceholder name={char.name} color={char.color} />
                          )}
                          <span
                            className="mt-1 text-xs font-semibold"
                            style={{ color: char.color }}
                          >
                            {char.name}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* ── Step 2: Configuration ── */
                <div className="flex flex-col gap-4">
                  {/* Preview */}
                  {selectedChar && (
                    <div className="flex justify-center">
                      <div
                        className="rounded-lg border px-4 py-2"
                        style={{
                          borderColor: `${selectedChar.color}40`,
                          backgroundColor: `${selectedChar.color}10`,
                        }}
                      >
                        <span
                          className="text-sm font-bold"
                          style={{ color: selectedChar.color }}
                        >
                          {selectedChar.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Target Project */}
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Project</span>
                    <select
                      value={targetProjectId}
                      onChange={(e) => {
                        setTargetProjectId(e.target.value);
                        const firstRoom = rooms.find((r) => r.projectId === e.target.value);
                        setRoomId(firstRoom?.id ?? "");
                      }}
                      className="rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-white/20"
                    >
                      {workspaceProjects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Provider */}
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">LLM Provider</span>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value as LLMProvider)}
                      className="rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-white/20"
                    >
                      {(Object.entries(AVATAR_PROVIDER_LABELS) as [LLMProvider, string][]).map(
                        ([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  {/* Role */}
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Role</span>
                    <select
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
                      className="rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-white/20"
                    >
                      <option value="">— No role —</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </label>

                  {/* Room */}
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Target Room</span>
                    <select
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-white/20"
                    >
                      {targetRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Recruit button */}
                  <button
                    onClick={handleRecruit}
                    disabled={!roomId}
                    className="rounded px-4 py-2 text-xs font-bold uppercase text-white transition-colors disabled:opacity-30"
                    style={{
                      backgroundColor: selectedChar?.color ?? "#ff3c3c",
                    }}
                  >
                    Recruit {selectedChar?.name}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
