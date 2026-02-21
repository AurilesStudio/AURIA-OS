import { useStore } from "@/store/useStore";
import { MCSidebar } from "./MCSidebar";
import { MCHeader } from "./MCHeader";
import { MCModuleContent } from "./MCModuleContent";

export function MCLayout() {
  const activeModule = useStore((s) => s.mcActiveModule);
  const isOffice = activeModule === "office";

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex">
      {/* Sidebar — always visible */}
      <MCSidebar />

      {/* Module content area — only for non-office modules */}
      {!isOffice && (
        <div className="pointer-events-auto flex flex-1 flex-col">
          <MCHeader />
          <MCModuleContent />
        </div>
      )}
    </div>
  );
}
