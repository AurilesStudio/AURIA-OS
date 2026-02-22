import { motion } from "framer-motion";
import {
  Building2,
  CheckSquare,
  FileText,
  Calendar,
  Brain,
  Users,
  Activity,
  Github,
  BarChart2,
  StickyNote,
  Home,
  MessageSquare,
  Coins,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import type { MCModule } from "@/types";

const modules: { id: MCModule; icon: typeof Building2; label: string }[] = [
  { id: "office", icon: Building2, label: "Office" },
  { id: "tasks", icon: CheckSquare, label: "Tasks" },
  { id: "content", icon: FileText, label: "Content" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
  { id: "memory", icon: Brain, label: "Memory" },
  { id: "team", icon: Users, label: "Team" },
  { id: "monitoring", icon: Activity, label: "Monitoring" },
];

const integrationModules: { id: MCModule; icon: typeof Building2; label: string }[] = [
  { id: "github", icon: Github, label: "GitHub" },
  { id: "linear", icon: BarChart2, label: "Linear" },
  { id: "notion", icon: StickyNote, label: "Notion" },
];

const officeTools: { id: string; icon: typeof Building2; label: string }[] = [
  { id: "home", icon: Home, label: "Command" },
  { id: "chat", icon: MessageSquare, label: "Activity" },
  { id: "alerts", icon: Coins, label: "Tokens" },
  { id: "trading", icon: TrendingUp, label: "Trading" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export function MCSidebar() {
  const activeModule = useStore((s) => s.mcActiveModule);
  const setActive = useStore((s) => s.setMCActiveModule);
  const collapsed = useStore((s) => s.mcSidebarCollapsed);
  const toggle = useStore((s) => s.toggleMCSidebar);
  const systemStatus = useStore((s) => s.systemStatus);
  const officePanel = useStore((s) => s.mcOfficePanel);
  const setOfficePanel = useStore((s) => s.setMCOfficePanel);

  const isOnline = systemStatus !== "ERROR";

  const handleToolClick = (toolId: string) => {
    if (activeModule === "office" && officePanel === toolId) {
      // Toggle off if already open
      setOfficePanel(null);
    } else {
      // Switch to office + open panel
      if (activeModule !== "office") setActive("office");
      setOfficePanel(toolId);
    }
  };

  return (
    <motion.nav
      layout
      className="pointer-events-auto relative z-10 flex h-full flex-col overlay-glass border-r border-white/5"
      animate={{ width: collapsed ? 56 : 200 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {/* Logo / Brand */}
      <div className="flex h-14 items-center gap-2 overflow-hidden px-4">
        <div className="h-6 w-6 shrink-0 rounded-md bg-[#00ffff]/20 flex items-center justify-center">
          <span className="text-[10px] font-bold text-[#00ffff]">A</span>
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs font-semibold uppercase tracking-wider text-text-primary whitespace-nowrap"
          >
            AURIA-OS
          </motion.span>
        )}
      </div>

      {/* Module buttons */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-2">
        {modules.map(({ id, icon: Icon, label }) => {
          const isActive = activeModule === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                isActive
                  ? "bg-[#00ffff]/10 text-[#00ffff]"
                  : "text-text-muted hover:bg-white/5 hover:text-text-primary"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mc-active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#00ffff]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-medium whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </button>
          );
        })}

        {/* Integrations separator */}
        <div className="my-2 border-t border-white/5" />
        {!collapsed && (
          <span className="px-3 pb-1 text-[10px] uppercase tracking-wider text-text-muted/50">
            Integrations
          </span>
        )}

        {integrationModules.map(({ id, icon: Icon, label }) => {
          const isActive = activeModule === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                isActive
                  ? "bg-[#00ffff]/10 text-[#00ffff]"
                  : "text-text-muted hover:bg-white/5 hover:text-text-primary"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="mc-active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#00ffff]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-medium whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </button>
          );
        })}

        {/* Tools separator */}
        <div className="my-2 border-t border-white/5" />
        {!collapsed && (
          <span className="px-3 pb-1 text-[10px] uppercase tracking-wider text-text-muted/50">
            Tools
          </span>
        )}

        {officeTools.map(({ id, icon: Icon, label }) => {
          const isActive = activeModule === "office" && officePanel === id;
          return (
            <button
              key={id}
              onClick={() => handleToolClick(id)}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                isActive
                  ? "bg-white/10 text-text-primary"
                  : "text-text-muted hover:bg-white/5 hover:text-text-primary"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-medium whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>

      {/* AURIA status indicator */}
      <div className="border-t border-white/5 px-3 py-3">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 shrink-0 rounded-full ${
              isOnline ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]"
            }`}
          />
          {!collapsed && (
            <span className="text-[10px] text-text-muted">
              {isOnline ? "Online" : "Offline"}
            </span>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-20 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-bg-surface text-text-muted hover:text-text-primary transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </motion.nav>
  );
}
