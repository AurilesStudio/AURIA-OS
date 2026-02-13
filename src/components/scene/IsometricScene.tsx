import { Canvas } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import { SceneLighting } from "./SceneLighting";
import { IsometricRoom } from "./IsometricGrid";
import { AvatarGroup } from "./AvatarGroup";
import { SceneParticles } from "./SceneParticles";
import { SceneProps } from "./SceneProps";

export function IsometricScene() {
  const selectAvatar = useStore((s) => s.selectAvatar);

  const handlePointerMissed = () => {
    selectAvatar(null);
  };

  return (
    <div className="fixed inset-0 z-0 scene-nebula">
      <Canvas
        camera={{
          fov: 30,
          position: [9, 8, 9],
          near: 0.1,
          far: 100,
        }}
        onPointerMissed={handlePointerMissed}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <SceneLighting />
        <SceneParticles />
        <IsometricRoom />
        <SceneProps />
        <AvatarGroup />
      </Canvas>
    </div>
  );
}
