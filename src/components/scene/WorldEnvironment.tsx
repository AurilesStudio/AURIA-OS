import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Stars, Line } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";
import { computeAllZoneBounds } from "@/lib/zoneBounds";
import { getThemeForProject } from "@/lib/zoneThemes";

/** Exponential fog — fades distant zones into darkness */
function SceneFog() {
  const { scene } = useThree();
  useMemo(() => {
    scene.fog = new THREE.FogExp2("#0a0515", 0.007);
  }, [scene]);
  return null;
}

/** Thin neon border — single line, low opacity */
function ZoneBorder({
  minX,
  maxX,
  minZ,
  maxZ,
  color,
}: {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  color: string;
}) {
  const y = 0.005;
  const points: [number, number, number][] = useMemo(
    () => [
      [minX, y, minZ],
      [maxX, y, minZ],
      [maxX, y, maxZ],
      [minX, y, maxZ],
      [minX, y, minZ],
    ],
    [minX, maxX, minZ, maxZ],
  );

  return (
    <Line points={points} color={color} lineWidth={1} transparent opacity={0.12} />
  );
}

export function WorldEnvironment() {
  const projects = useStore((s) => s.workspaceProjects);
  const rooms = useStore((s) => s.rooms);

  const zones = useMemo(
    () => computeAllZoneBounds(projects, rooms),
    [projects, rooms],
  );

  return (
    <>
      {/* Dim star field */}
      <Stars
        radius={180}
        depth={100}
        count={1500}
        factor={2.5}
        saturation={0}
        fade
        speed={0.3}
      />

      {/* Fog into darkness */}
      <SceneFog />

      {/* Per-zone: thin border only */}
      {zones.map((z) => {
        const theme = getThemeForProject(z.projectId);
        if (!theme) return null;
        return (
          <ZoneBorder
            key={z.projectId}
            minX={z.minX}
            maxX={z.maxX}
            minZ={z.minZ}
            maxZ={z.maxZ}
            color={theme.accentColor}
          />
        );
      })}
    </>
  );
}
