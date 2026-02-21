import { Calendar } from "lucide-react";
import { useStore } from "@/store/useStore";

export function MCCalendarModule() {
  const count = useStore((s) => s.mcCalendarEvents.length);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <Calendar className="h-12 w-12 text-text-muted/30" />
      <h2 className="text-lg font-semibold text-text-primary">Calendar</h2>
      <p className="text-sm text-text-muted">
        {count > 0 ? `${count} event${count > 1 ? "s" : ""}` : "No events yet"}
      </p>
      <p className="max-w-sm text-center text-xs text-text-muted/60">
        Schedule events, deployments, and milestones for your projects.
      </p>
    </div>
  );
}
