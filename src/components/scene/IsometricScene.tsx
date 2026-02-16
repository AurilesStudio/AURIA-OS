import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { MapControls } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import { SceneLighting } from "./SceneLighting";
import { IsometricRooms } from "./IsometricGrid";
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
          fov: 38,
          position: [14, 12, 14],
          near: 0.1,
          far: 200,
        }}
        onPointerMissed={handlePointerMissed}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        {/*
          Left-click drag on empty space → pan camera horizontally
          Scroll → zoom in / out
          Rotation disabled to keep isometric angle
          makeDefault exposes controls via useThree — used by useDragAvatar
          to disable panning while dragging an avatar.
        */}
        <MapControls
          makeDefault
          enableRotate={false}
          enableDamping
          dampingFactor={0.15}
          screenSpacePanning={false}
          minDistance={5}
          maxDistance={150}
        />
        <SceneLighting />
        <SceneParticles />
        <IsometricRooms />
        <SceneProps />
        <Suspense fallback={null}>
          <AvatarGroup />
        </Suspense>
      </Canvas>
    </div>
  );
}
