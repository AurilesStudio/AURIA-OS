import { useState, useEffect } from "react";
import { IsometricScene } from "@/components/scene/IsometricScene";
import { DashboardOverlay } from "@/components/layout/DashboardOverlay";
import { AvatarInfoPanel } from "@/components/scene/AvatarInfoPanel";
import { RoomManagerPanel } from "@/components/scene/RoomManagerPanel";
import { RecruitAgentModal } from "@/components/scene/RecruitAgentModal";
import { AvatarGenerationConsole } from "@/components/scene/AvatarGenerationConsole";
import { AuriaCommandPanel } from "@/components/scene/AuriaCommandPanel";
import { SkillsAssignmentPanel } from "@/components/scene/SkillsAssignmentPanel";
import { useStore } from "@/store/useStore";
import { ProjectSelector } from "@/components/scene/ProjectSelector";
import { TeamManagerPanel } from "@/components/scene/TeamManagerPanel";
import { UserPlus } from "lucide-react";

export default function App() {
  const [recruitOpen, setRecruitOpen] = useState(false);
  const generationConsoleOpen = useStore((s) => s.avatarGenerationConsoleOpen);
  const setGenerationConsoleOpen = useStore((s) => s.setAvatarGenerationConsoleOpen);
  const hydrateLocalGlbs = useStore((s) => s.hydrateLocalGlbs);

  // Restore local GLB blob URLs from IndexedDB on mount
  useEffect(() => {
    hydrateLocalGlbs();
  }, [hydrateLocalGlbs]);

  return (
    <>
      {/* z-0  — 3D Canvas full-screen with nebula background */}
      <IsometricScene />

      {/* z-10 — Thin sidebar + expandable panels */}
      <DashboardOverlay />

      {/* z-30 — Avatar info / settings panel (slides in on selection) */}
      <AvatarInfoPanel />

      {/* z-30 — Bottom bar: Project selector + Room management + Recruit agent */}
      <div className="fixed bottom-4 left-4 z-30 flex items-end gap-2">
        <ProjectSelector />
        <TeamManagerPanel />
        <RoomManagerPanel />
        <button
          onClick={() => setRecruitOpen(true)}
          className="overlay-glass flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-text-muted transition-colors hover:text-text-primary"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Recruit Agent
        </button>
      </div>

      {/* z-40 — Recruit modal */}
      <RecruitAgentModal open={recruitOpen} onClose={() => setRecruitOpen(false)} />

      {/* z-40 — Avatar Generation Console */}
      <AvatarGenerationConsole
        open={generationConsoleOpen}
        onClose={() => setGenerationConsoleOpen(false)}
      />

      {/* z-40 — AURIA Command Center panel */}
      <AuriaCommandPanel />

      {/* z-40 — Skills assignment panel */}
      <SkillsAssignmentPanel />
    </>
  );
}
