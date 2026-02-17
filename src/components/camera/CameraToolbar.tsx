import { useMemo, useState, useRef, useEffect } from "react";
import { Box, ArrowDown, Focus, PanelTop, PanelLeft } from "lucide-react";
import { useStore } from "@/store/useStore";
import type { LucideIcon } from "lucide-react";

interface Preset {
  label: string;
  icon: LucideIcon;
  position: [number, number, number];
  target: [number, number, number];
}

function useProjectCenter(): { cx: number; cz: number } {
  const activeProjectId = useStore((s) => s.activeProjectId);
  const rooms = useStore((s) => s.rooms);

  return useMemo(() => {
    const projectRooms = rooms.filter((r) => r.projectId === activeProjectId);
    if (projectRooms.length === 0) return { cx: 0, cz: 0 };

    let sumX = 0;
    let sumZ = 0;
    for (const r of projectRooms) {
      sumX += r.position[0];
      sumZ += r.position[2];
    }
    return {
      cx: sumX / projectRooms.length,
      cz: sumZ / projectRooms.length,
    };
  }, [rooms, activeProjectId]);
}

function AvatarFocusPicker({ onClose }: { onClose: () => void }) {
  const avatars = useStore((s) => s.avatars);
  const setCameraTarget = useStore((s) => s.setCameraTarget);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("pointerdown", handleClick);
    return () => document.removeEventListener("pointerdown", handleClick);
  }, [onClose]);

  if (avatars.length === 0) {
    return (
      <div ref={ref} className="absolute bottom-full right-0 mb-2 w-48 rounded-lg bg-bg-surface/90 border border-white/5 backdrop-blur-sm p-2">
        <p className="text-xs text-text-muted px-2 py-1">No avatars deployed.</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="absolute bottom-full right-0 mb-2 w-48 rounded-lg bg-bg-surface/90 border border-white/5 backdrop-blur-sm p-1">
      {avatars.map((a) => (
        <button
          key={a.id}
          onClick={() => {
            const [ax, , az] = a.position;
            setCameraTarget({
              position: [ax + 5, 4, az + 5],
              target: [ax, 0, az],
            });
            onClose();
          }}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-text-muted transition-colors hover:bg-white/10 hover:text-text-primary"
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: a.color }}
          />
          {a.name}
        </button>
      ))}
    </div>
  );
}

export function CameraToolbar() {
  const setCameraTarget = useStore((s) => s.setCameraTarget);
  const { cx, cz } = useProjectCenter();
  const [pickerOpen, setPickerOpen] = useState(false);

  const presets: Preset[] = useMemo(
    () => [
      {
        label: "Isometric",
        icon: Box,
        position: [cx + 20, 18, cz + 20],
        target: [cx, 0, cz],
      },
      {
        label: "Top-Down",
        icon: ArrowDown,
        position: [cx, 40, cz + 1],
        target: [cx, 0, cz],
      },
      {
        label: "Front",
        icon: PanelTop,
        position: [cx, 8, cz + 25],
        target: [cx, 0, cz],
      },
      {
        label: "Side",
        icon: PanelLeft,
        position: [cx + 30, 8, cz],
        target: [cx, 0, cz],
      },
    ],
    [cx, cz],
  );

  return (
    <div className="pointer-events-auto relative flex gap-1 rounded-xl bg-bg-surface/80 p-1.5 backdrop-blur-sm border border-white/5">
      {presets.map(({ label, icon: Icon, position, target }) => (
        <button
          key={label}
          onClick={() => setCameraTarget({ position, target })}
          title={label}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-all hover:bg-white/10 hover:text-text-primary"
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}

      {/* Separator */}
      <div className="mx-0.5 w-px self-stretch bg-white/10" />

      {/* Focus avatar button */}
      <button
        onClick={() => setPickerOpen((p) => !p)}
        title="Focus avatar"
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
          pickerOpen
            ? "bg-white/10 text-text-primary"
            : "text-text-muted hover:bg-white/10 hover:text-text-primary"
        }`}
      >
        <Focus className="h-4 w-4" />
      </button>

      {pickerOpen && <AvatarFocusPicker onClose={() => setPickerOpen(false)} />}
    </div>
  );
}
