import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ZoneBounds } from "@/lib/zoneBounds";
import type { ZoneTheme } from "@/lib/zoneThemes";
import type { RoomData } from "@/types";

// ── Seeded random ────────────────────────────────────────────────────
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ── Zone Particles — coloured motes floating above the zone ──────────
function ZoneParticles({
  zone,
  color,
  count = 30,
}: {
  zone: ZoneBounds;
  color: string;
  count?: number;
}) {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const rng = seededRandom(hashString(zone.projectId + "particles"));
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = zone.minX + rng() * zone.width;
      pos[i * 3 + 1] = 0.3 + rng() * 3;
      pos[i * 3 + 2] = zone.minZ + rng() * zone.depth;
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return geo;
  }, [zone, count]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color,
        size: 0.08,
        transparent: true,
        opacity: 0.25,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    [color],
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;
    // Very slow vertical drift
    const t = clock.getElapsedTime();
    const attr = ref.current.geometry.attributes.position;
    if (!attr) return;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3 + 1;
      arr[idx] = arr[idx]! + Math.sin(t * 0.3 + i) * 0.001;
    }
    attr.needsUpdate = true;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

// ── Ground Fog — very faint transparent plane that pulses gently ─────
function GroundFog({
  zone,
  color,
}: {
  zone: ZoneBounds;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.04 + Math.sin(clock.getElapsedTime() * 0.15) * 0.015;
  });

  return (
    <mesh
      ref={ref}
      rotation-x={-Math.PI / 2}
      position={[zone.centerX, 0.01, zone.centerZ]}
    >
      <planeGeometry args={[zone.width * 0.85, zone.depth * 0.85]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.04}
        depthWrite={false}
      />
    </mesh>
  );
}

// ── Main Export ───────────────────────────────────────────────────────
export function ZoneDecorations({
  zone,
  theme,
  rooms: _rooms,
}: {
  zone: ZoneBounds;
  theme: ZoneTheme;
  rooms: RoomData[];
}) {
  return (
    <>
      <ZoneParticles zone={zone} color={theme.atmosphereColor} />
      <GroundFog zone={zone} color={theme.atmosphereColor} />
    </>
  );
}
