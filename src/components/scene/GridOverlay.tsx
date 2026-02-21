import { useMemo } from "react";
import { useStore } from "@/store/useStore";

export function GridOverlay() {
  const gridOverlayEnabled = useStore((s) => s.gridOverlayEnabled);
  const globalCellSize = useStore((s) => s.gridCellSize);
  const gridWidth = useStore((s) => s.gridWidth);
  const gridHeight = useStore((s) => s.gridHeight);
  const activeProject = useStore((s) => s.workspaceProjects.find((p) => p.id === s.activeProjectId));
  const cellSize = activeProject?.gridCellSize ?? globalCellSize;

  // gridHelper takes [size, divisions] — size is the total extent, divisions is how many cells
  const args = useMemo(() => {
    const size = Math.max(gridWidth, gridHeight);
    const divisions = Math.round(size / cellSize);
    return [size, divisions, "#ffffff", "#ffffff"] as const;
  }, [cellSize, gridWidth, gridHeight]);

  if (!gridOverlayEnabled) return null;

  return (
    <gridHelper
      args={args}
      position={[0, 0.002, 0]}
      material-transparent
      material-opacity={0.08}
    />
  );
}
