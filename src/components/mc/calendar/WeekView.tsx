import { useMemo } from "react";
import type { MCCalendarEvent } from "@/types/mission-control";
import { TYPE_COLORS } from "./EventBadge";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 48; // px per hour slot
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WeekViewProps {
  year: number;
  month: number;
  /** Monday of the week to display */
  weekStart: Date;
  events: MCCalendarEvent[];
  onEditEvent: (event: MCCalendarEvent) => void;
  onCreateEvent: (date: Date) => void;
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) =>
    new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i),
  );
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function WeekView({ weekStart, events, onEditEvent, onCreateEvent }: WeekViewProps) {
  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const today = new Date();

  // Group events by day
  const eventsByDay = useMemo(() => {
    const map = new Map<number, MCCalendarEvent[]>();
    for (let i = 0; i < 7; i++) map.set(i, []);
    for (const ev of events) {
      const d = new Date(ev.startDate);
      const idx = days.findIndex((day) => isSameDay(day, d));
      if (idx >= 0) map.get(idx)!.push(ev);
    }
    return map;
  }, [events, days]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-white/5">
        <div /> {/* time gutter spacer */}
        {days.map((day, i) => {
          const isToday = isSameDay(day, today);
          return (
            <div key={i} className="px-2 py-1.5 text-center">
              <span className="text-[10px] text-text-muted">{DAY_LABELS[i]}</span>
              <span
                className={`ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  isToday
                    ? "bg-mc-accent/20 font-bold text-mc-accent"
                    : "text-text-primary"
                }`}
              >
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scrollable timeline */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="grid grid-cols-[48px_repeat(7,1fr)]"
          style={{ height: HOURS.length * HOUR_HEIGHT }}
        >
          {/* Time gutter */}
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute right-2 text-[9px] text-text-muted/60"
                style={{ top: h * HOUR_HEIGHT }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, dayIdx) => {
            const dayEvts = eventsByDay.get(dayIdx) ?? [];
            return (
              <div
                key={dayIdx}
                className="relative border-l border-white/5"
                onClick={() => onCreateEvent(day)}
              >
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-white/[0.04]"
                    style={{ top: h * HOUR_HEIGHT }}
                  />
                ))}

                {/* Event blocks */}
                {dayEvts.map((ev) => {
                  const start = new Date(ev.startDate);
                  const end = new Date(ev.endDate);
                  const startMin = start.getHours() * 60 + start.getMinutes();
                  const endMin = end.getHours() * 60 + end.getMinutes();
                  const duration = Math.max(endMin - startMin, 30); // min 30min height
                  const top = (startMin / 60) * HOUR_HEIGHT;
                  const height = (duration / 60) * HOUR_HEIGHT;
                  const typeColor = TYPE_COLORS[ev.type];

                  return (
                    <button
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEvent(ev);
                      }}
                      className="absolute left-1 right-1 overflow-hidden rounded border border-white/10 bg-white/5 backdrop-blur-sm transition-colors hover:bg-white/10"
                      style={{ top, height: Math.max(height, 20) }}
                    >
                      {/* Left color bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[3px]"
                        style={{ backgroundColor: typeColor }}
                      />
                      <div className="pl-2 pr-1 py-0.5">
                        <span className="block truncate text-[10px] font-medium text-text-primary">
                          {ev.title}
                        </span>
                        {height > 30 && (
                          <span className="block text-[9px] text-text-muted">
                            {String(start.getHours()).padStart(2, "0")}:{String(start.getMinutes()).padStart(2, "0")}
                            {" - "}
                            {String(end.getHours()).padStart(2, "0")}:{String(end.getMinutes()).padStart(2, "0")}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
