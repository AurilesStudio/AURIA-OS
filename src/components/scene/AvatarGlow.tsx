import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

interface AvatarGlowProps {
  visible: boolean;
  status: "idle" | "working" | "success" | "error";
}

/** Green selection ring at avatar feet (matches Claw reference) */
export function AvatarGlow({ visible, status }: AvatarGlowProps) {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.visible = visible;
    if (!visible) return;

    const t = clock.getElapsedTime();
    const base = status === "working" ? 0.6 : 0.4;
    const pulse = status === "working" ? Math.sin(t * 4) * 0.2 : Math.sin(t * 2) * 0.1;
    (ref.current.material as { opacity: number }).opacity = base + pulse;
  });

  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
      <ringGeometry args={[0.35, 0.45, 32]} />
      <meshBasicMaterial color="#44ff44" transparent opacity={0.4} />
    </mesh>
  );
}
