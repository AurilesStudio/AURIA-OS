import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Text } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import { SKILLS } from "@/types";
import * as THREE from "three";

// ── Fake code lines for the giant wall screen ───────────────────
const CODE_LINES: { text: string; color: string }[] = [
  { text: "import { NeuralCore } from '@auria/core';", color: "#c792ea" },
  { text: "import { AgentPool } from '@auria/agents';", color: "#c792ea" },
  { text: "", color: "#546e7a" },
  { text: "// Initialize AURIA orchestration layer", color: "#546e7a" },
  { text: "const core = new NeuralCore({", color: "#82aaff" },
  { text: "  model: 'auria-v4.2',", color: "#f78c6c" },
  { text: "  temperature: 0.7,", color: "#f78c6c" },
  { text: "  maxTokens: 128_000,", color: "#f78c6c" },
  { text: "});", color: "#82aaff" },
  { text: "", color: "#546e7a" },
  { text: "async function dispatch(task: Task) {", color: "#82aaff" },
  { text: "  const agent = await pool.acquire();", color: "#ffcb6b" },
  { text: "  agent.setContext(task.context);", color: "#ffcb6b" },
  { text: "  const result = await agent.execute(task);", color: "#c3e88d" },
  { text: "  pool.release(agent);", color: "#ffcb6b" },
  { text: "  return result;", color: "#89ddff" },
  { text: "}", color: "#82aaff" },
  { text: "", color: "#546e7a" },
  { text: "// Spawn agent cluster", color: "#546e7a" },
  { text: "const pool = new AgentPool({", color: "#82aaff" },
  { text: "  providers: ['claude', 'gemini', 'mistral'],", color: "#c3e88d" },
  { text: "  concurrency: 6,", color: "#f78c6c" },
  { text: "  failover: true,", color: "#f78c6c" },
  { text: "});", color: "#82aaff" },
  { text: "", color: "#546e7a" },
  { text: "export async function runPipeline(", color: "#c792ea" },
  { text: "  tasks: Task[],", color: "#ffcb6b" },
  { text: "  opts: PipelineOpts = {},", color: "#ffcb6b" },
  { text: ") {", color: "#c792ea" },
  { text: "  const stream = core.createStream();", color: "#82aaff" },
  { text: "  for (const task of tasks) {", color: "#89ddff" },
  { text: "    stream.push(dispatch(task));", color: "#ffcb6b" },
  { text: "  }", color: "#89ddff" },
  { text: "  return stream.flush();", color: "#82aaff" },
  { text: "}", color: "#c792ea" },
  { text: "", color: "#546e7a" },
  { text: "interface AgentMetrics {", color: "#c792ea" },
  { text: "  tokensUsed: number;", color: "#ffcb6b" },
  { text: "  latencyMs: number;", color: "#ffcb6b" },
  { text: "  successRate: number;", color: "#ffcb6b" },
  { text: "}", color: "#c792ea" },
  { text: "", color: "#546e7a" },
  { text: "function monitor(metrics: AgentMetrics) {", color: "#82aaff" },
  { text: "  if (metrics.successRate < 0.95) {", color: "#89ddff" },
  { text: "    core.emit('alert', {", color: "#ffcb6b" },
  { text: "      level: 'WARNING',", color: "#f78c6c" },
  { text: "      msg: `Rate drop: ${metrics.successRate}`,", color: "#c3e88d" },
  { text: "    });", color: "#ffcb6b" },
  { text: "  }", color: "#89ddff" },
  { text: "}", color: "#82aaff" },
  { text: "", color: "#546e7a" },
  { text: "core.on('ready', () => {", color: "#82aaff" },
  { text: "  console.log('[AURIA] Neural core online');", color: "#c3e88d" },
  { text: "  pool.warmup();", color: "#ffcb6b" },
  { text: "});", color: "#82aaff" },
];

// Canvas texture dimensions (high-res for crisp text)
const TEX_W = 2048;
const TEX_H = 1024;
const VISIBLE_LINES = 32;
const FONT_SIZE = 28;
const LINE_HEIGHT = FONT_SIZE * 1.35;
const PAD_X = 30;
const PAD_Y = 24;

/** Draw code lines onto a canvas and return the texture */
function useCodeTexture() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const [offset, setOffset] = useState(0);

  // Create canvas once
  if (!canvasRef.current) {
    canvasRef.current = document.createElement("canvas");
    canvasRef.current.width = TEX_W;
    canvasRef.current.height = TEX_H;
  }

  // Create texture once
  if (!textureRef.current) {
    textureRef.current = new THREE.CanvasTexture(canvasRef.current);
    textureRef.current.minFilter = THREE.LinearFilter;
    textureRef.current.magFilter = THREE.LinearFilter;
  }

  // Scroll timer
  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % CODE_LINES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Repaint canvas when offset changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, TEX_W, TEX_H);

    ctx.font = `${FONT_SIZE}px "Courier New", monospace`;
    ctx.textBaseline = "top";

    for (let i = 0; i < VISIBLE_LINES; i++) {
      const idx = (offset + i) % CODE_LINES.length;
      const line = CODE_LINES[idx] ?? { text: "", color: "#546e7a" };
      const y = PAD_Y + i * LINE_HEIGHT;

      // Fade at top and bottom edges
      let alpha = 0.9;
      if (i < 2) alpha = 0.2 + i * 0.35;
      else if (i > VISIBLE_LINES - 3) alpha = 0.2;

      // Line number
      const lineNum = String(idx + 1).padStart(2, " ");
      ctx.globalAlpha = alpha * 0.35;
      ctx.fillStyle = "#5c5c70";
      ctx.fillText(lineNum, PAD_X, y);

      // Code text
      ctx.globalAlpha = alpha;
      ctx.fillStyle = line.color;
      ctx.fillText(line.text || " ", PAD_X + 60, y);
    }

    ctx.globalAlpha = 1;

    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
  }, [offset]);

  return textureRef.current;
}

/** Giant AURIA Command Center screen — left side, perpendicular to rooms */
function CommandCenterScreen() {
  const setCommandCenterOpen = useStore((s) => s.setCommandCenterOpen);
  const screenRef = useRef<THREE.Mesh>(null);
  const codeTexture = useCodeTexture();

  // Subtle flicker on the screen emissive
  useFrame(({ clock }) => {
    if (!screenRef.current) return;
    const t = clock.getElapsedTime();
    const mat = screenRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.15 + Math.sin(t * 3) * 0.03;
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setCommandCenterOpen(true);
  };

  return (
    <group position={[-7, 0, 5]} rotation={[0, Math.PI / 2, 0]}>
      {/* Screen frame — tall dark slab */}
      <mesh position={[0, 4.5, 0]} onClick={handleClick}>
        <boxGeometry args={[18, 9, 0.15]} />
        <meshStandardMaterial color="#050505" roughness={0.95} metalness={0.1} />
      </mesh>

      {/* Screen surface with code texture */}
      <mesh ref={screenRef} position={[0, 4.5, 0.08]} onClick={handleClick}>
        <planeGeometry args={[17.2, 8.2]} />
        <meshStandardMaterial
          map={codeTexture}
          emissive="#ffffff"
          emissiveMap={codeTexture}
          emissiveIntensity={0.15}
          toneMapped={false}
        />
      </mesh>

      {/* Floor supports */}
      {[-7, -2.5, 2.5, 7].map((z, i) => (
        <mesh key={i} position={[z, 0.15, 0]}>
          <boxGeometry args={[0.2, 0.3, 0.3]} />
          <meshStandardMaterial color="#161620" roughness={0.8} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/** Pile of papers / objects on the floor */
function FloorObjects({ position }: { position: [number, number, number] }) {
  const offsets = useMemo(
    () =>
      [0, 0.04, 0.08, 0.11].map((y, i) => ({
        y,
        x: i * 0.07 - 0.1,
        z: i * 0.05 - 0.08,
        ry: i * 0.4 + 0.2,
        color: i % 2 === 0 ? "#2a1a3e" : "#1e1228",
      })),
    [],
  );

  return (
    <group position={position}>
      {offsets.map((o, i) => (
        <mesh key={i} position={[o.x, o.y, o.z]} rotation={[0, o.ry, 0]}>
          <boxGeometry args={[0.55, 0.03, 0.4]} />
          <meshStandardMaterial color={o.color} roughness={0.9} />
        </mesh>
      ))}
      {/* Crystal on top */}
      <mesh position={[0, 0.2, 0]} rotation={[0, 0.5, 0]}>
        <octahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial
          color="#bf00ff"
          emissive="#bf00ff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

// ── Skills 3D toolbox ────────────────────────────────────────────

const SKILL_TILE = 128;

/** One small canvas texture per skill module (icon + name + count) */
function useSkillModuleTextures() {
  const rooms = useStore((s) => s.rooms);
  const texturesRef = useRef<THREE.CanvasTexture[]>([]);

  if (texturesRef.current.length === 0) {
    for (let i = 0; i < SKILLS.length; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = SKILL_TILE;
      canvas.height = SKILL_TILE;
      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      texturesRef.current.push(tex);
    }
  }

  const skillCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const skill of SKILLS) {
      counts[skill.id] = rooms.filter((r) => r.skillIds?.includes(skill.id)).length;
    }
    return counts;
  }, [rooms]);

  useEffect(() => {
    for (let i = 0; i < SKILLS.length; i++) {
      const skill = SKILLS[i]!;
      const tex = texturesRef.current[i]!;
      const canvas = tex.image as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      const count = skillCounts[skill.id] ?? 0;
      const active = count > 0;
      const s = SKILL_TILE;

      ctx.clearRect(0, 0, s, s);

      // Icon (large, centered)
      ctx.font = "bold 46px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = active ? 1 : 0.5;
      ctx.fillStyle = active ? "#ffffff" : skill.color;
      ctx.fillText(skill.icon, s / 2, s / 2 - 12);

      // Skill name (small, below)
      ctx.font = "13px 'Courier New', monospace";
      ctx.globalAlpha = active ? 0.85 : 0.3;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(skill.name, s / 2, s / 2 + 22);

      // Count badge (top-right)
      if (count > 0) {
        const bx = s - 20;
        const by = 18;
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = skill.color;
        ctx.beginPath();
        ctx.arc(bx, by, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px 'Courier New', monospace";
        ctx.fillText(String(count), bx, by + 1);
      }

      ctx.globalAlpha = 1;
      tex.needsUpdate = true;
    }
  }, [skillCounts]);

  return { textures: texturesRef.current, skillCounts };
}

/** Title plate texture */
function useToolboxTitleTexture() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  if (!canvasRef.current) {
    canvasRef.current = document.createElement("canvas");
    canvasRef.current.width = 256;
    canvasRef.current.height = 48;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.fillStyle = "#0c0c18";
    ctx.fillRect(0, 0, 256, 48);
    ctx.font = "bold 24px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.7;
    ctx.fillText("SKILLS", 128, 24);
  }

  if (!textureRef.current) {
    textureRef.current = new THREE.CanvasTexture(canvasRef.current);
    textureRef.current.minFilter = THREE.LinearFilter;
    textureRef.current.magFilter = THREE.LinearFilter;
  }

  return textureRef.current;
}

/** Single skill module — 3D cartridge with glowing face */
function SkillModule({
  skill,
  texture,
  active,
  position,
}: {
  skill: (typeof SKILLS)[number];
  texture: THREE.CanvasTexture;
  active: boolean;
  position: [number, number, number];
}) {
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!glowRef.current || !active) return;
    const t = clock.getElapsedTime();
    const mat = glowRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.3 + Math.sin(t * 2 + position[1]) * 0.08;
  });

  return (
    <group position={position}>
      {/* Module body */}
      <mesh>
        <boxGeometry args={[1.3, 1.15, 0.5]} />
        <meshStandardMaterial
          color={active ? "#111118" : "#0a0a10"}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Front glow plate */}
      <mesh ref={glowRef} position={[0, 0, 0.22]}>
        <boxGeometry args={[1.2, 1.05, 0.07]} />
        <meshStandardMaterial
          color={active ? skill.color : "#13131e"}
          emissive={active ? skill.color : "#000000"}
          emissiveIntensity={active ? 0.3 : 0}
          roughness={0.5}
          metalness={0.4}
          transparent
          opacity={active ? 1 : 0.6}
        />
      </mesh>

      {/* Face texture (icon + name) */}
      <mesh position={[0, 0, 0.265]}>
        <planeGeometry args={[1.05, 0.95]} />
        <meshStandardMaterial
          map={texture}
          transparent
          emissive="#ffffff"
          emissiveMap={texture}
          emissiveIntensity={active ? 0.1 : 0}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** 3D skills toolbox — physical cabinet next to the Command Center */
function SkillsPanel() {
  const { textures, skillCounts } = useSkillModuleTextures();
  const titleTexture = useToolboxTitleTexture();
  const setSkillsPanelOpen = useStore((s) => s.setSkillsPanelOpen);

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setSkillsPanelOpen(true);
  };

  // Cabinet dimensions
  const W = 3.6;
  const H = 7.2;
  const D = 0.9;
  const WALL = 0.06;

  // Grid layout — 2 cols × 4 rows
  const cols = 2;
  const cellW = 1.5;
  const cellH = 1.55;
  const titleH = 0.7;
  const gridTopY = H - titleH - cellH / 2 - 0.15;

  return (
    <group position={[-7, 0, 19]} rotation={[0, Math.PI / 2, 0]}>
      {/* Invisible click zone covering the whole cabinet */}
      <mesh position={[0, H / 2, 0]} onClick={handleClick}>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      {/* ── Cabinet shell ── */}

      {/* Back wall */}
      <mesh position={[0, H / 2, -D / 2 + WALL / 2]}>
        <boxGeometry args={[W, H, WALL]} />
        <meshStandardMaterial color="#08080e" roughness={0.85} metalness={0.2} />
      </mesh>

      {/* Side walls */}
      {([-1, 1] as const).map((side) => (
        <mesh key={side} position={[side * (W / 2 - WALL / 2), H / 2, 0]}>
          <boxGeometry args={[WALL, H, D]} />
          <meshStandardMaterial color="#0c0c16" roughness={0.7} metalness={0.4} />
        </mesh>
      ))}

      {/* Top cap */}
      <mesh position={[0, H + 0.04, 0]}>
        <boxGeometry args={[W + 0.12, 0.08, D + 0.06]} />
        <meshStandardMaterial color="#0e0e1a" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Bottom base */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[W + 0.12, 0.08, D + 0.06]} />
        <meshStandardMaterial color="#0e0e1a" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Title plate */}
      <mesh position={[0, H - titleH / 2 - 0.05, D / 2 - 0.01]}>
        <planeGeometry args={[W - 0.3, titleH * 0.65]} />
        <meshStandardMaterial
          map={titleTexture}
          emissive="#ffffff"
          emissiveMap={titleTexture}
          emissiveIntensity={0.06}
          transparent
          toneMapped={false}
        />
      </mesh>

      {/* Shelf dividers */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, gridTopY - (i + 0.5) * cellH - cellH / 2 + 0.5, -0.05]}>
          <boxGeometry args={[W - WALL * 4, 0.03, D - 0.15]} />
          <meshStandardMaterial color="#0a0a14" roughness={0.8} metalness={0.3} />
        </mesh>
      ))}

      {/* ── Skill modules ── */}
      {SKILLS.map((skill, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = (col - (cols - 1) / 2) * cellW;
        const y = gridTopY - row * cellH;
        const count = skillCounts[skill.id] ?? 0;

        return (
          <SkillModule
            key={skill.id}
            skill={skill}
            texture={textures[i]!}
            active={count > 0}
            position={[x, y, 0.05]}
          />
        );
      })}

      {/* Floor supports */}
      {[-1.2, 1.2].map((z, i) => (
        <mesh key={i} position={[z, 0.15, 0]}>
          <boxGeometry args={[0.15, 0.3, 0.25]} />
          <meshStandardMaterial color="#161620" roughness={0.8} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

const ADMIN_FRAME_COLOR = "#ff3c3c";
const ADMIN_LABEL_COLOR = "#ff8080";

/** Floor frame around the Command Center + Skills cabinet */
function AdminFrame() {
  const y = 0.005;
  // Bounding box covering both objects (screen Z ≈ -4…14, cabinet Z ≈ 17…21)
  const x0 = -9.5, x1 = -5;
  const z0 = -5, z1 = 22;
  const pad = 1.2;

  const outline: [number, number, number][] = [
    [x0 - pad, y, z0 - pad],
    [x1 + pad, y, z0 - pad],
    [x1 + pad, y, z1 + pad],
    [x0 - pad, y, z1 + pad],
    [x0 - pad, y, z0 - pad],
  ];

  const labelPos: [number, number, number] = [x1 + pad - 0.6, 0.006, z0 - pad - 0.35];

  return (
    <group>
      <Line
        points={outline}
        color={ADMIN_FRAME_COLOR}
        lineWidth={1}
        transparent
        opacity={0.25}
      />
      <Text
        position={labelPos}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.42}
        color={ADMIN_LABEL_COLOR}
        anchorX="right"
        anchorY="bottom"
        fillOpacity={0.7}
        letterSpacing={0.08}
      >
        ADMIN
        <meshBasicMaterial color={ADMIN_LABEL_COLOR} transparent opacity={0.7} />
      </Text>
    </group>
  );
}

export function SceneProps() {
  return (
    <group>
      {/* Admin zone frame */}
      <AdminFrame />
      {/* AURIA Command Center — giant screen, left side */}
      <CommandCenterScreen />
      {/* Skills panel — right of the screen */}
      <SkillsPanel />
      <FloorObjects position={[-6.5, 0, -2]} />
    </group>
  );
}
