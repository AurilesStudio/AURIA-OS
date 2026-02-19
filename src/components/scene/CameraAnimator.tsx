import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import { avatarWorldPositions } from "@/lib/avatarPositions";
import { Vector3 } from "three";

const _v = new Vector3();
const _t = new Vector3();

// Frame-rate independent smoothing: higher = snappier, lower = softer
const SMOOTH_SPEED = 3;
const DONE_THRESHOLD = 0.005;

// Camera offset relative to focused avatar
const FOLLOW_OFFSET: [number, number, number] = [5, 4, 5];

export function CameraAnimator() {
  const cameraTarget = useStore((s) => s.cameraTarget);
  const setCameraTarget = useStore((s) => s.setCameraTarget);
  const focusedAvatarId = useStore((s) => s.focusedAvatarId);
  const setFocusedAvatarId = useStore((s) => s.setFocusedAvatarId);
  const controls = useThree((s) => s.controls) as unknown as
    | { target: Vector3; update: () => void; addEventListener: Function; removeEventListener: Function }
    | null;

  // Cancel animation / tracking when the user grabs the camera
  useEffect(() => {
    if (!controls) return;
    const cancel = () => {
      const state = useStore.getState();
      if (state.cameraTarget) setCameraTarget(null);
      if (state.focusedAvatarId) setFocusedAvatarId(null);
    };
    controls.addEventListener("start", cancel);
    return () => controls.removeEventListener("start", cancel);
  }, [controls, setCameraTarget, setFocusedAvatarId]);

  useFrame(({ camera }, delta) => {
    if (!controls) return;

    const alpha = 1 - Math.exp(-SMOOTH_SPEED * delta);

    // ── Continuous avatar tracking ─────────────────────────────
    if (focusedAvatarId) {
      const worldPos = avatarWorldPositions.get(focusedAvatarId);
      if (worldPos) {
        const [ax, , az] = worldPos;
        _v.set(ax + FOLLOW_OFFSET[0], FOLLOW_OFFSET[1], az + FOLLOW_OFFSET[2]);
        _t.set(ax, 0, az);

        camera.position.lerp(_v, alpha);
        controls.target.lerp(_t, alpha);
        controls.update();
      }
      return;
    }

    // ── One-shot camera target ─────────────────────────────────
    if (!cameraTarget) return;

    _v.set(...cameraTarget.position);
    _t.set(...cameraTarget.target);

    camera.position.lerp(_v, alpha);
    controls.target.lerp(_t, alpha);
    controls.update();

    const posDist = camera.position.distanceTo(_v);
    const tgtDist = controls.target.distanceTo(_t);

    if (posDist < DONE_THRESHOLD && tgtDist < DONE_THRESHOLD) {
      camera.position.copy(_v);
      controls.target.copy(_t);
      controls.update();
      setCameraTarget(null);
    }
  });

  return null;
}
