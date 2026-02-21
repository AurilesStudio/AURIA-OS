import { useState, useMemo, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { CalendarHeader, type CalendarView } from "../calendar/CalendarHeader";
import { MonthView } from "../calendar/MonthView";
import { WeekView } from "../calendar/WeekView";
import { EventModal } from "../calendar/EventModal";
import type { MCCalendarEvent } from "@/types/mission-control";

/** Get the Monday of the week containing the given date */
function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = (day + 6) % 7; // 0=Mon offset
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
}

export function MCCalendarModule() {
  const events = useStore((s) => s.mcCalendarEvents);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState<CalendarView>("month");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<MCCalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();

  // Week start (Monday of selected month's first day, or today)
  const [weekStart, setWeekStart] = useState(() => getMonday(today));

  // Filter events visible in current view
  const visibleEvents = useMemo(() => {
    if (view === "month") {
      // Include events from the full grid range (prev/next month days shown)
      const first = new Date(year, month, 1);
      const startOffset = (first.getDay() + 6) % 7;
      const gridStart = new Date(year, month, 1 - startOffset).getTime();
      const gridEnd = new Date(year, month, 1 - startOffset + 42).getTime();
      return events.filter((e) => e.startDate >= gridStart && e.startDate < gridEnd);
    } else {
      const ws = weekStart.getTime();
      const we = ws + 7 * 24 * 60 * 60 * 1000;
      return events.filter((e) => e.startDate >= ws && e.startDate < we);
    }
  }, [events, year, month, view, weekStart]);

  const handlePrev = useCallback(() => {
    if (view === "month") {
      setMonth((m) => {
        if (m === 0) { setYear((y) => y - 1); return 11; }
        return m - 1;
      });
    } else {
      setWeekStart((ws) => new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() - 7));
    }
  }, [view]);

  const handleNext = useCallback(() => {
    if (view === "month") {
      setMonth((m) => {
        if (m === 11) { setYear((y) => y + 1); return 0; }
        return m + 1;
      });
    } else {
      setWeekStart((ws) => new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + 7));
    }
  }, [view]);

  const handleViewChange = useCallback((v: CalendarView) => {
    setView(v);
    if (v === "week") {
      // Set week start to the Monday of the current month view's first day
      setWeekStart(getMonday(new Date(year, month, 1)));
    }
  }, [year, month]);

  const openCreate = useCallback((date?: Date) => {
    setEditEvent(null);
    setDefaultDate(date);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((event: MCCalendarEvent) => {
    setEditEvent(event);
    setDefaultDate(undefined);
    setModalOpen(true);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <CalendarHeader
        year={view === "week" ? weekStart.getFullYear() : year}
        month={view === "week" ? weekStart.getMonth() : month}
        view={view}
        eventCount={events.length}
        onPrev={handlePrev}
        onNext={handleNext}
        onViewChange={handleViewChange}
        onNewEvent={() => openCreate()}
      />

      {view === "month" ? (
        <MonthView
          year={year}
          month={month}
          events={visibleEvents}
          onEditEvent={openEdit}
          onCreateEvent={openCreate}
        />
      ) : (
        <WeekView
          year={year}
          month={month}
          weekStart={weekStart}
          events={visibleEvents}
          onEditEvent={openEdit}
          onCreateEvent={openCreate}
        />
      )}

      <EventModal
        open={modalOpen}
        event={editEvent}
        defaultDate={defaultDate}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
