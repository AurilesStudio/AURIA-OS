import { useRef, useMemo, Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { X, UserPlus, ArrowLeft } from "lucide-react";
import { useStore } from "@/store/useStore";
import { CHARACTER_CATALOG, AVATAR_PROVIDER_LABELS, ROLE_SUGGESTIONS } from "@/types";
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

export function RecruitAgentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addAvatar = useStore((s) => s.addAvatar);
  const rooms = useStore((s) => s.rooms);
  const avatars = useStore((s) => s.avatars);
  const activeProjectId = useStore((s) => s.activeProjectId);
  const projectRooms = rooms.filter((r) => r.projectId === activeProjectId);
  const deployedCharIds = new Set(
    avatars.filter((a) => a.projectId === activeProjectId).map((a) => a.characterId),
  );
  const availableCharacters = CHARACTER_CATALOG.filter((c) => !deployedCharIds.has(c.id));

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedChar, setSelectedChar] = useState<CharacterEntry | null>(null);
  const [provider, setProvider] = useState<LLMProvider>("claude");
  const [roleTitle, setRoleTitle] = useState("");
  const [roomId, setRoomId] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  const handleSelectCharacter = (char: CharacterEntry) => {
    setSelectedChar(char);
    setRoomId(projectRooms[0]?.id ?? "");
    setStep(2);
  };

  const handleRecruit = () => {
    if (!selectedChar || !roomId) return;
    addAvatar({
      characterId: selectedChar.id,
      provider,
      roomId,
      roleTitle,
      systemPrompt,
    });
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedChar(null);
    setProvider("claude");
    setRoleTitle("");
    setRoomId("");
    setSystemPrompt("");
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
                        ? "Select a character for your team"
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
                /* ── Step 1: Character selection grid ── */
                <div className="grid grid-cols-3 gap-3">
                  {availableCharacters.map((char) => (
                    <button
                      key={char.id}
                      onClick={() => handleSelectCharacter(char)}
                      className="group flex flex-col items-center rounded-lg border border-white/5 bg-bg-base/40 px-3 py-4 transition-all hover:border-white/15 hover:bg-bg-base/60"
                    >
                      <PreviewCanvas url={char.modelUrl} rotationY={char.rotationY} />
                      <span
                        className="mt-1 text-xs font-semibold"
                        style={{ color: char.color }}
                      >
                        {char.name}
                      </span>
                    </button>
                  ))}
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
                    <span className="text-[10px] uppercase text-text-muted">Role / Mission</span>
                    <input
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      list="recruit-role-suggestions"
                      placeholder="Ex: CTO / Lead Dev"
                      className="rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
                    />
                    <datalist id="recruit-role-suggestions">
                      {ROLE_SUGGESTIONS.map((r) => (
                        <option key={r} value={r} />
                      ))}
                    </datalist>
                  </label>

                  {/* Room */}
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Target Room</span>
                    <select
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-white/20"
                    >
                      {projectRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* System Prompt */}
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">
                      System Prompt (optional)
                    </span>
                    <textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="Instructions for the LLM agent..."
                      rows={3}
                      className="resize-y rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20"
                    />
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
