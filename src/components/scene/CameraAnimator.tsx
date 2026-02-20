import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import { avatarWorldPositions } from "@/lib/avatarPositions";
import { auriaFpvDirection } from "@/lib/auriaFpvDirection";
import { Vector3 } from "three";

const _v = new Vector3();
const _t = new Vector3();

// Frame-rate independent smoothing: higher = snappier, lower = softer
const SMOOTH_SPEED = 3;
const FPV_SMOOTH_SPEED = 8;
const DONE_THRESHOLD = 0.005;

// Camera offset relative to focused avatar
const FOLLOW_OFFSET: [number, number, number] = [5, 4, 5];

// FPV constants
const FPV_EYE_HEIGHT = 1.4;
const FPV_LOOK_DISTANCE = 10;
const FPV_YAW_SPEED = 2; // radians/sec for arrow key rotation

const AURIA_AVATAR_ID = "avatar-auria";

export function CameraAnimator() {
  const cameraTarget = useStore((s) => s.cameraTarget);
  const setCameraTarget = useStore((s) => s.setCameraTarget);
  const focusedAvatarId = useStore((s) => s.focusedAvatarId);
  const setFocusedAvatarId = useStore((s) => s.setFocusedAvatarId);
  const fpvActive = useStore((s) => s.auriaFpvActive);
  const setFpvActive = useStore((s) => s.setAuriaFpvActive);
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
      if (state.auriaFpvActive) setFpvActive(false);
    };
    controls.addEventListener("start", cancel);
    return () => controls.removeEventListener("start", cancel);
  }, [controls, setCameraTarget, setFocusedAvatarId, setFpvActive]);

  useFrame(({ camera }, delta) => {
    if (!controls) return;

    // ── FPV mode — first-person game controls ────────────────
    if (fpvActive) {
      // Accumulate camera yaw from arrow keys
      // Negative because in Three.js screen-right = -cos(yaw) direction
      const dir = auriaFpvDirection;
      dir.cameraYaw -= dir.yawInput * FPV_YAW_SPEED * delta;

      const worldPos = avatarWorldPositions.get(AURIA_AVATAR_ID);
      if (worldPos) {
        const [ax, ay, az] = worldPos;
        const yaw = dir.cameraYaw;

        // Camera at AURIA's eye position
        _v.set(ax, ay + FPV_EYE_HEIGHT, az);

        // Look-at: far ahead in camera yaw direction
        _t.set(
          ax + Math.sin(yaw) * FPV_LOOK_DISTANCE,
          ay + FPV_EYE_HEIGHT,
          az + Math.cos(yaw) * FPV_LOOK_DISTANCE,
        );

        const alpha = 1 - Math.exp(-FPV_SMOOTH_SPEED * delta);
        camera.position.lerp(_v, alpha);
        controls.target.lerp(_t, alpha);
        controls.update();
      }
      return;
    }

    const alpha = 1 - Math.exp(-SMOOTH_SPEED * delta);

    // ── Continuous avatar tracking ─────────────────────────────
    if (focusedAvatarId) {
      const worldPos = avatarWorldPositions.get(focusedAvatarId);
      if (worldPos) {
        const [ax, ay, az] = worldPos;
        _v.set(ax + FOLLOW_OFFSET[0], ay + FOLLOW_OFFSET[1], az + FOLLOW_OFFSET[2]);
        _t.set(ax, ay, az);

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
