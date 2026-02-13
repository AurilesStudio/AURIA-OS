import { IsometricScene } from "@/components/scene/IsometricScene";
import { DashboardOverlay } from "@/components/layout/DashboardOverlay";
import { AvatarInfoPanel } from "@/components/scene/AvatarInfoPanel";
import { RoomManagerPanel } from "@/components/scene/RoomManagerPanel";

export default function App() {
  return (
    <>
      {/* z-0  — 3D Canvas full-screen with nebula background */}
      <IsometricScene />

      {/* z-10 — Thin sidebar + expandable panels */}
      <DashboardOverlay />

      {/* z-30 — Avatar info panel (slides in on selection) */}
      <AvatarInfoPanel />

      {/* z-30 — Room management panel */}
      <RoomManagerPanel />
    </>
  );
}
