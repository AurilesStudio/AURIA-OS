import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import { Vector3 } from "three";

const _v = new Vector3();
const _t = new Vector3();

// Frame-rate independent smoothing: higher = snappier, lower = softer
const SMOOTH_SPEED = 4;
const DONE_THRESHOLD = 0.01;

export function CameraAnimator() {
  const cameraTarget = useStore((s) => s.cameraTarget);
  const setCameraTarget = useStore((s) => s.setCameraTarget);
  const controls = useThree((s) => s.controls) as unknown as
    | { target: Vector3; update: () => void; addEventListener: Function; removeEventListener: Function }
    | null;

  // Cancel animation when the user grabs the camera
  useEffect(() => {
    if (!controls) return;
    const cancel = () => {
      if (useStore.getState().cameraTarget) setCameraTarget(null);
    };
    controls.addEventListener("start", cancel);
    return () => controls.removeEventListener("start", cancel);
  }, [controls, setCameraTarget]);

  useFrame(({ camera }, delta) => {
    if (!cameraTarget || !controls) return;

    _v.set(...cameraTarget.position);
    _t.set(...cameraTarget.target);

    // Frame-rate independent exponential ease-out
    const alpha = 1 - Math.exp(-SMOOTH_SPEED * delta);

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
