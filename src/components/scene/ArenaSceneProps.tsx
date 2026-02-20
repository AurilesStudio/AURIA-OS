import { useMemo, Component, Suspense } from "react";
import type { ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";
import { ARENA_ROOM_SIZE } from "@/types";

/** Catches useGLTF load errors (e.g. missing file) so the rest of the scene still renders. */
class GlbErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? null : this.props.children; }
}

function ArenaModel() {
  const gltf = useGLTF("/models/Décorations/Arena.glb");

  const scene = useMemo(() => {
    const c = gltf.scene.clone(true);
    // Auto-fit to arena room size
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const maxHoriz = Math.max(size.x, size.z);
    if (maxHoriz > 0) {
      const targetSize = Math.min(ARENA_ROOM_SIZE.width, ARENA_ROOM_SIZE.depth);
      c.scale.multiplyScalar(targetSize / maxHoriz);
    }
    // Re-center
    const fitted = new THREE.Box3().setFromObject(c);
    const center = fitted.getCenter(new THREE.Vector3());
    c.position.x -= center.x;
    c.position.z -= center.z;
    c.position.y -= fitted.min.y;
    return c;
  }, [gltf.scene]);

  return <primitive object={scene} />;
}

export function ArenaSceneProps() {
  const rooms = useStore((s) => s.rooms);
  const arena = rooms.find((r) => r.id === "room-arena");
  if (!arena) return null;

  return (
    <group position={[arena.position[0], 0, arena.position[2]]}>
      <GlbErrorBoundary>
        <Suspense fallback={null}>
          <ArenaModel />
        </Suspense>
      </GlbErrorBoundary>
    </group>
  );
}
