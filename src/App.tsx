import { useState } from "react";
import { IsometricScene } from "@/components/scene/IsometricScene";
import { DashboardOverlay } from "@/components/layout/DashboardOverlay";
import { AvatarInfoPanel } from "@/components/scene/AvatarInfoPanel";
import { RoomManagerPanel } from "@/components/scene/RoomManagerPanel";
import { RecruitAgentModal } from "@/components/scene/RecruitAgentModal";
import { AuriaCommandPanel } from "@/components/scene/AuriaCommandPanel";
import { SkillsAssignmentPanel } from "@/components/scene/SkillsAssignmentPanel";
import { UserPlus } from "lucide-react";

export default function App() {
  const [recruitOpen, setRecruitOpen] = useState(false);

  return (
    <>
      {/* z-0  — 3D Canvas full-screen with nebula background */}
      <IsometricScene />

      {/* z-10 — Thin sidebar + expandable panels */}
      <DashboardOverlay />

      {/* z-30 — Avatar info / settings panel (slides in on selection) */}
      <AvatarInfoPanel />

      {/* z-30 — Room management panel */}
      <RoomManagerPanel />

      {/* z-30 — Recruit agent button (next to Rooms) */}
      <button
        onClick={() => setRecruitOpen(true)}
        className="fixed bottom-4 left-36 z-30 overlay-glass flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-text-muted transition-colors hover:text-text-primary"
      >
        <UserPlus className="h-3.5 w-3.5" />
        Recruit Agent
      </button>

      {/* z-40 — Recruit modal */}
      <RecruitAgentModal open={recruitOpen} onClose={() => setRecruitOpen(false)} />

      {/* z-40 — AURIA Command Center panel */}
      <AuriaCommandPanel />

      {/* z-40 — Skills assignment panel */}
      <SkillsAssignmentPanel />
    </>
  );
}
