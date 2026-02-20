import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

/** Github branches prop — central sphere with 3 branches ending in spheres */
function GithubBranches({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      const children = groupRef.current.children;
      for (const child of children) {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat.emissive) {
            mat.emissiveIntensity = 0.4 + Math.sin(t * 2) * 0.15;
          }
        }
      }
    }
  });

  const branchAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
  const branchLength = 1.2;

  return (
    <group position={position} ref={groupRef}>
      {/* Central sphere (main branch) */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color="#58a6ff"
          emissive="#58a6ff"
          emissiveIntensity={0.4}
          transparent
          opacity={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Branches */}
      {branchAngles.map((angle, i) => {
        const dx = Math.cos(angle) * branchLength;
        const dz = Math.sin(angle) * branchLength;
        const midX = dx / 2;
        const midZ = dz / 2;
        const length = Math.sqrt(dx * dx + dz * dz);
        return (
          <group key={i}>
            {/* Branch cylinder */}
            <mesh
              position={[midX, 1.5, midZ]}
              rotation={[0, -angle + Math.PI / 2, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.04, 0.04, length, 8]} />
              <meshStandardMaterial
                color="#58a6ff"
                emissive="#58a6ff"
                emissiveIntensity={0.3}
                transparent
                opacity={0.6}
                toneMapped={false}
              />
            </mesh>

            {/* End sphere (commit node) */}
            <mesh position={[dx, 1.5, dz]}>
              <sphereGeometry args={[0.2, 12, 12]} />
              <meshStandardMaterial
                color="#58a6ff"
                emissive="#58a6ff"
                emissiveIntensity={0.4}
                transparent
                opacity={0.7}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}

      {/* Base pedestal */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.5, 0.7, 0.6, 6]} />
        <meshStandardMaterial color="#0a1220" roughness={0.7} metalness={0.5} />
      </mesh>
    </group>
  );
}

/** Notion pages prop — 3 floating stacked pages with subtle offset */
function NotionPages({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // Subtle float animation
      groupRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.08;
    }
  });

  const pages = [
    { y: 1.0, rotY: 0, opacity: 0.6 },
    { y: 1.35, rotY: 0.08, opacity: 0.5 },
    { y: 1.7, rotY: -0.05, opacity: 0.4 },
  ];

  return (
    <group ref={groupRef} position={position}>
      {pages.map((page, i) => (
        <mesh key={i} position={[0, page.y, 0]} rotation={[0, page.rotY, 0]}>
          <boxGeometry args={[1.0, 0.04, 1.3]} />
          <meshStandardMaterial
            color="#e0e0e0"
            emissive="#e0e0e0"
            emissiveIntensity={0.15}
            transparent
            opacity={page.opacity}
            roughness={0.3}
            metalness={0.1}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Text lines on top page */}
      {[0, 0.15, 0.3].map((offset, i) => (
        <mesh key={`line-${i}`} position={[-0.15, 1.73, -0.3 + offset]}>
          <boxGeometry args={[0.5 - i * 0.1, 0.01, 0.04]} />
          <meshStandardMaterial
            color="#888888"
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}

      {/* Base pedestal */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.5, 0.7, 0.6, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.5} />
      </mesh>
    </group>
  );
}

/** Linear kanban prop — 3 columns of stacked cubes (3-2-1) */
function LinearKanban({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      const children = groupRef.current.children;
      for (const child of children) {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat.emissive) {
            mat.emissiveIntensity = 0.3 + Math.sin(t * 1.8) * 0.1;
          }
        }
      }
    }
  });

  const columns = [
    { x: -0.6, count: 3 },
    { x: 0, count: 2 },
    { x: 0.6, count: 1 },
  ];

  return (
    <group position={position} ref={groupRef}>
      {columns.map((col, ci) =>
        Array.from({ length: col.count }).map((_, ri) => (
          <mesh
            key={`${ci}-${ri}`}
            position={[col.x, 0.9 + ri * 0.35, 0]}
          >
            <boxGeometry args={[0.4, 0.25, 0.5]} />
            <meshStandardMaterial
              color="#818cf8"
              emissive="#818cf8"
              emissiveIntensity={0.3}
              transparent
              opacity={0.7}
              roughness={0.3}
              metalness={0.5}
              toneMapped={false}
            />
          </mesh>
        )),
      )}

      {/* Column base lines */}
      {columns.map((col, i) => (
        <mesh key={`base-${i}`} position={[col.x, 0.75, 0]}>
          <boxGeometry args={[0.02, 0.02, 0.6]} />
          <meshStandardMaterial
            color="#818cf8"
            emissive="#818cf8"
            emissiveIntensity={0.2}
            transparent
            opacity={0.4}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Base pedestal */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.5, 0.7, 0.6, 6]} />
        <meshStandardMaterial color="#0f0f20" roughness={0.7} metalness={0.5} />
      </mesh>
    </group>
  );
}

/** Project management scene props — positioned in each PM sub-room */
export function ProjectManagementSceneProps() {
  const rooms = useStore((s) => s.rooms);

  const github = rooms.find((r) => r.id === "room-github");
  const notion = rooms.find((r) => r.id === "room-notion");
  const linear = rooms.find((r) => r.id === "room-linear");

  return (
    <group>
      {github && (
        <GithubBranches
          position={[github.position[0] + 3, 0, github.position[2] - 2]}
        />
      )}
      {notion && (
        <NotionPages
          position={[notion.position[0] + 3, 0, notion.position[2] - 2]}
        />
      )}
      {linear && (
        <LinearKanban
          position={[linear.position[0] + 3, 0, linear.position[2] - 2]}
        />
      )}
    </group>
  );
}
