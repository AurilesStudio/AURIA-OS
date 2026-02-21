import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export type CalendarView = "month" | "week";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface CalendarHeaderProps {
  year: number;
  month: number; // 0-indexed
  view: CalendarView;
  eventCount: number;
  onPrev: () => void;
  onNext: () => void;
  onViewChange: (view: CalendarView) => void;
  onNewEvent: () => void;
}

export function CalendarHeader({
  year,
  month,
  view,
  eventCount,
  onPrev,
  onNext,
  onViewChange,
  onNewEvent,
}: CalendarHeaderProps) {
  const navBtn =
    "flex h-7 w-7 items-center justify-center rounded border border-white/10 text-text-muted transition-colors hover:border-white/20 hover:text-text-primary";
  const viewBtn = (active: boolean) =>
    `rounded px-3 py-1 text-xs font-medium transition-colors ${
      active
        ? "bg-white/10 text-text-primary"
        : "text-text-muted hover:text-text-primary"
    }`;

  return (
    <div className="flex items-center justify-between border-b border-white/5 px-6 py-3">
      {/* Left — navigation */}
      <div className="flex items-center gap-2">
        <button onClick={onPrev} className={navBtn}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button onClick={onNext} className={navBtn}>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <span className="ml-1 text-sm font-semibold text-text-primary">
          {MONTH_NAMES[month]} {year}
        </span>
      </div>

      {/* Center — view toggle */}
      <div className="flex items-center rounded-lg border border-white/10 p-0.5">
        <button
          onClick={() => onViewChange("month")}
          className={viewBtn(view === "month")}
        >
          Month
        </button>
        <button
          onClick={() => onViewChange("week")}
          className={viewBtn(view === "week")}
        >
          Week
        </button>
      </div>

      {/* Right — counter + new event */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-muted">
          {eventCount} event{eventCount !== 1 ? "s" : ""}
        </span>
        <button
          onClick={onNewEvent}
          className="flex items-center gap-1.5 rounded bg-mc-accent/15 px-3 py-1.5 text-xs font-semibold text-mc-accent transition-colors hover:bg-mc-accent/25"
        >
          <Plus className="h-3.5 w-3.5" />
          New Event
        </button>
      </div>
    </div>
  );
}
