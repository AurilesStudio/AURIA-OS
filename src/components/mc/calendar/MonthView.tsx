import { useMemo } from "react";
import type { MCCalendarEvent } from "@/types/mission-control";
import { EventBadge, EventDot } from "./EventBadge";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE = 3;

interface MonthViewProps {
  year: number;
  month: number; // 0-indexed
  events: MCCalendarEvent[];
  onEditEvent: (event: MCCalendarEvent) => void;
  onCreateEvent: (date: Date) => void;
}

/** Get all days to display in the month grid (always 42 cells = 6 rows) */
function getMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  // Monday = 0 offset (ISO week)
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function MonthView({ year, month, events, onEditEvent, onCreateEvent }: MonthViewProps) {
  const days = useMemo(() => getMonthGrid(year, month), [year, month]);
  const today = new Date();

  // Group events by day key
  const eventsByDay = useMemo(() => {
    const map = new Map<string, MCCalendarEvent[]>();
    for (const ev of events) {
      const d = new Date(ev.startDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    }
    return map;
  }, [events]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Day header row */}
      <div className="grid grid-cols-7 border-b border-white/5">
        {DAY_LABELS.map((d) => (
          <div key={d} className="px-2 py-1.5 text-center text-[10px] font-medium text-text-muted">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid flex-1 grid-cols-7 grid-rows-6">
        {days.map((day, i) => {
          const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
          const dayEvents = eventsByDay.get(key) ?? [];
          const isCurrentMonth = day.getMonth() === month;
          const isToday = isSameDay(day, today);
          const overflow = dayEvents.length - MAX_VISIBLE;

          return (
            <div
              key={i}
              onClick={() => onCreateEvent(day)}
              className={`cursor-pointer border-b border-r border-white/5 p-1 transition-colors hover:bg-white/[0.03] ${
                !isCurrentMonth ? "opacity-30" : ""
              }`}
            >
              {/* Day number */}
              <div className="mb-0.5 flex items-start justify-between">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                    isToday
                      ? "bg-mc-accent/20 font-bold text-mc-accent"
                      : "text-text-muted"
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>

              {/* Event badges / dots */}
              <div className="flex flex-col gap-0.5">
                {dayEvents.slice(0, MAX_VISIBLE).map((ev) => (
                  <EventBadge
                    key={ev.id}
                    event={ev}
                    onClick={() => onEditEvent(ev)}
                  />
                ))}
                {overflow > 0 && (
                  <div className="flex items-center gap-1 px-1">
                    {dayEvents.slice(MAX_VISIBLE, MAX_VISIBLE + 3).map((ev) => (
                      <EventDot
                        key={ev.id}
                        type={ev.type}
                        onClick={() => onEditEvent(ev)}
                      />
                    ))}
                    <span className="text-[9px] text-text-muted">
                      +{overflow}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
