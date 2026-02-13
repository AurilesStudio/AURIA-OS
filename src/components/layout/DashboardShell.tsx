import { Header } from "./Header";
import { TokenGaugesPanel } from "@/components/monitoring/TokenGaugesPanel";
import { ActivityStream } from "@/components/activity/ActivityStream";
import { OmniPrompt } from "@/components/command/OmniPrompt";
import { QuickActions } from "@/components/command/QuickActions";
import { ProjectsGrid } from "@/components/projects/ProjectsGrid";

export function DashboardShell() {
  return (
    <div className="flex h-screen flex-col bg-bg-base">
      <Header />

      <main className="flex-1 overflow-hidden p-4">
        <div className="mx-auto grid h-full max-w-[1600px] grid-cols-1 gap-4 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
          {/* Left column: Gauges + OmniPrompt */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            <TokenGaugesPanel />
            <OmniPrompt />
          </div>

          {/* Center column: Activity Stream */}
          <div className="min-h-[300px] lg:col-span-5 lg:row-span-2">
            <ActivityStream />
          </div>

          {/* Right column: Projects + Quick Actions */}
          <div className="flex flex-col gap-4 lg:col-span-4 lg:row-span-2 overflow-y-auto">
            <ProjectsGrid />
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  );
}
