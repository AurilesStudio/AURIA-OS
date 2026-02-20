export function SceneLighting() {
  return (
    <>
      {/* Warm ambient base — lowered to let zone lights stand out */}
      <ambientLight intensity={0.5} color="#e8c8a8" />

      {/* Hemisphere: warm sky, cool ground */}
      <hemisphereLight color="#ffd8b0" groundColor="#0a0510" intensity={0.35} />

      {/* Key light — warm directional from upper-front-left */}
      <directionalLight
        intensity={1.0}
        position={[4, 8, 6]}
        color="#ffe4cc"
        castShadow
      />

      {/* Fill — softer, from back-right */}
      <directionalLight
        intensity={0.4}
        position={[-5, 5, -4]}
        color="#c0a0d0"
      />
    </>
  );
}
