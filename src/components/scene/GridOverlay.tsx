import { useStore } from "@/store/useStore";

export function GridOverlay() {
  const gridOverlayEnabled = useStore((s) => s.gridOverlayEnabled);

  if (!gridOverlayEnabled) return null;

  return (
    <gridHelper
      args={[200, 100, "#ffffff", "#ffffff"]}
      position={[0, 0.002, 0]}
      material-transparent
      material-opacity={0.06}
    />
  );
}
