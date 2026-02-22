import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { MCTasksModule } from "./modules/MCTasksModule";
import { MCContentModule } from "./modules/MCContentModule";
import { MCCalendarModule } from "./modules/MCCalendarModule";
import { MCMemoryModule } from "./modules/MCMemoryModule";
import { MCTeamModule } from "./modules/MCTeamModule";
import { MCMonitoringModule } from "./modules/MCMonitoringModule";
import { MCGithubModule } from "./modules/MCGithubModule";
import { MCLinearModule } from "./modules/MCLinearModule";
import { MCNotionModule } from "./modules/MCNotionModule";

const moduleComponents = {
  tasks: MCTasksModule,
  content: MCContentModule,
  calendar: MCCalendarModule,
  memory: MCMemoryModule,
  team: MCTeamModule,
  monitoring: MCMonitoringModule,
  github: MCGithubModule,
  linear: MCLinearModule,
  notion: MCNotionModule,
} as const;

export function MCModuleContent() {
  const activeModule = useStore((s) => s.mcActiveModule);

  // Office content is handled by DashboardOverlay — don't render anything here
  if (activeModule === "office") return null;

  const Component = moduleComponents[activeModule];

  return (
    <div className="pointer-events-auto flex-1 overflow-y-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeModule}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          <Component />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
