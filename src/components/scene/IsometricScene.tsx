import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { MapControls } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import { SceneLighting } from "./SceneLighting";
import { IsometricRooms } from "./IsometricGrid";
import { AvatarGroup } from "./AvatarGroup";
import { SceneParticles } from "./SceneParticles";
import { SceneProps } from "./SceneProps";
import { TradingSceneProps } from "./TradingSceneProps";
import { CameraAnimator } from "./CameraAnimator";

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
          MapControls — left-click = pan, right-click = rotate, scroll = zoom.
          Same mouse mapping as before, but rotation is now enabled.
          makeDefault exposes controls via useThree — used by useDragAvatar
          to disable controls while dragging an avatar.
          maxPolarAngle prevents going below the ground plane.
        */}
        <MapControls
          makeDefault
          enableRotate
          enableDamping
          dampingFactor={0.15}
          screenSpacePanning={false}
          minDistance={5}
          maxDistance={150}
          maxPolarAngle={Math.PI / 2}
        />
        <CameraAnimator />
        <SceneLighting />
        <SceneParticles />
        <IsometricRooms />
        <SceneProps />
        <TradingSceneProps />
        <Suspense fallback={null}>
          <AvatarGroup />
        </Suspense>
      </Canvas>
    </div>
  );
}
