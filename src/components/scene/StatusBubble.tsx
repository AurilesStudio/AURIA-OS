import { Html } from "@react-three/drei";
import type { AvatarStatus, AvatarAction } from "@/types";

interface StatusBubbleProps {
  status: AvatarStatus;
  currentAction: AvatarAction | null;
  hidden?: boolean;
}

const STATUS_CONFIG: Record<AvatarStatus, { color: string; label: string; pulse: boolean }> = {
  working: { color: "#10b981", label: "Working", pulse: true },
  idle:    { color: "#f59e0b", label: "Idle",    pulse: false },
  success: { color: "#10b981", label: "Done",    pulse: false },
  error:   { color: "#ef4444", label: "Error",   pulse: false },
};

function getStatusText(status: AvatarStatus, currentAction: AvatarAction | null): string {
  switch (status) {
    case "working":
      return currentAction?.prompt ?? "Processing...";
    case "idle":
      return "Patrolling";
    case "success":
      return currentAction?.result ?? "Task completed";
    case "error":
      return currentAction?.error ?? "Something went wrong";
  }
}

export function StatusBubble({ status, currentAction, hidden }: StatusBubbleProps) {
  if (hidden) return null;

  const config = STATUS_CONFIG[status];
  const text = getStatusText(status, currentAction);

  return (
    <Html position={[0, 2.2, 0]} center distanceFactor={8} zIndexRange={[10, 0]}>
      <div
        className="pointer-events-none select-none rounded-lg border border-white/10 bg-black/60 px-2 py-1 backdrop-blur-sm"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {/* Status row */}
        <div className="flex items-center gap-1">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: config.color,
              boxShadow: `0 0 4px ${config.color}`,
              animation: config.pulse ? "pulse 2s ease-in-out infinite" : undefined,
            }}
          />
          <span className="text-[9px] font-medium text-white/80">{config.label}</span>
        </div>
        {/* Task text */}
        <div
          className="mt-0.5 max-w-[160px] truncate text-[9px] text-white/50"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {text}
        </div>
      </div>
    </Html>
  );
}
