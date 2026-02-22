import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { NotificationPanel } from "./NotificationPanel";

export function NotificationBell() {
  const [panelOpen, setPanelOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = useStore((s) =>
    s.mcNotifications.filter((n) => !n.read).length,
  );

  // Close on click outside
  useEffect(() => {
    if (!panelOpen) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [panelOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setPanelOpen((prev) => !prev)}
        className="relative flex items-center justify-center rounded-md p-1.5 text-text-muted transition-colors hover:text-text-primary"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mc-accent px-1 text-[9px] font-bold text-black">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {panelOpen && <NotificationPanel />}
      </AnimatePresence>
    </div>
  );
}
