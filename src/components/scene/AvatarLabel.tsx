import { Html } from "@react-three/drei";
import type { AvatarStatus } from "@/types";

interface AvatarLabelProps {
  name: string;
  color: string;
  status: AvatarStatus;
  role?: string;
  level?: number;
  availability?: "available" | "unavailable";
}

/** Simple floating name label above the avatar (red/coral text like reference) */
export function AvatarLabel({ name, color, status, role, level, availability }: AvatarLabelProps) {
  return (
    <Html position={[0, 1.7, 0]} center distanceFactor={8} zIndexRange={[10, 0]}>
      <div
        className="pointer-events-none select-none whitespace-nowrap text-center"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {/* Green dot when selected/active */}
        {status === "working" && (
          <div
            className="mx-auto mb-0.5 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "#44ff44", boxShadow: "0 0 4px #44ff44" }}
          />
        )}
        <div
          className="text-xs font-semibold"
          style={{
            color: color,
            textShadow: `0 0 6px ${color}60`,
          }}
        >
          {name}
          {level != null && level > 0 && (
            <span className="ml-1 text-[8px] opacity-70">Lv.{level}</span>
          )}
        </div>
        {role && (
          <div
            className="text-[8px]"
            style={{ color: color, opacity: 0.6 }}
          >
            {role}
          </div>
        )}
        {availability && (
          <div
            className="mx-auto mt-0.5 h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: availability === "available" ? "#44ff44" : "#ff6b35",
              boxShadow: `0 0 4px ${availability === "available" ? "#44ff44" : "#ff6b35"}`,
            }}
          />
        )}
      </div>
    </Html>
  );
}
