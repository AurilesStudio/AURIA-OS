import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { MapControls } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import { SceneLighting } from "./SceneLighting";
import { AvatarGroup } from "./AvatarGroup";
import { SceneParticles } from "./SceneParticles";
import { SceneProps } from "./SceneProps";
import { TradingSceneProps } from "./TradingSceneProps";
import { ProjectManagementSceneProps } from "./ProjectManagementSceneProps";
import { ArenaSceneProps } from "./ArenaSceneProps";
import { CameraAnimator } from "./CameraAnimator";
import { GridOverlay } from "./GridOverlay";
import { WorldEnvironment } from "./WorldEnvironment";

export function IsometricScene() {
  const selectAvatar = useStore((s) => s.selectAvatar);
  const fpvActive = useStore((s) => s.auriaFpvActive);

  const handlePointerMissed = () => {
    selectAvatar(null);
  };

  return (
    <div className="fixed inset-0 z-0 scene-nebula" style={{ background: "#0a0515" }}>
      <Canvas
        camera={{
          fov: 38,
          position: [14, 12, 14],
          near: 0.1,
          far: 300,
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
          enabled={!fpvActive}
          enableRotate
          enableDamping
          dampingFactor={0.15}
          screenSpacePanning={false}
          minDistance={5}
          maxDistance={150}
          maxPolarAngle={Math.PI / 2}
        />
        <CameraAnimator />
        <WorldEnvironment />
        <SceneLighting />
        <SceneParticles />
        <GridOverlay />
        <SceneProps />
        <TradingSceneProps />
        <ProjectManagementSceneProps />
        <ArenaSceneProps />
        <Suspense fallback={null}>
          <AvatarGroup />
        </Suspense>
      </Canvas>
    </div>
  );
}
