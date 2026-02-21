import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import type {
  MCCalendarEvent,
  MCCalendarEventType,
  MCCalendarEventStatus,
} from "@/types/mission-control";

const TYPE_OPTIONS: { value: MCCalendarEventType; label: string }[] = [
  { value: "task", label: "Task" },
  { value: "meeting", label: "Meeting" },
  { value: "deployment", label: "Deployment" },
  { value: "reminder", label: "Reminder" },
  { value: "milestone", label: "Milestone" },
];

const STATUS_OPTIONS: { value: MCCalendarEventStatus; label: string }[] = [
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

/** Convert epoch ms to datetime-local input value */
function toLocalInput(epoch: number): string {
  const d = new Date(epoch);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convert datetime-local input value to epoch ms */
function fromLocalInput(val: string): number {
  return new Date(val).getTime();
}

interface EventModalProps {
  open: boolean;
  event: MCCalendarEvent | null; // null = create mode
  defaultDate?: Date;
  onClose: () => void;
}

export function EventModal({ open, event, defaultDate, onClose }: EventModalProps) {
  const addEvent = useStore((s) => s.addMCCalendarEvent);
  const updateEvent = useStore((s) => s.updateMCCalendarEvent);
  const removeEvent = useStore((s) => s.removeMCCalendarEvent);
  const activeProjectId = useStore((s) => s.activeProjectId);

  const isEdit = event !== null;

  const [title, setTitle] = useState("");
  const [type, setType] = useState<MCCalendarEventType>("meeting");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<MCCalendarEventStatus>("scheduled");
  const [executionResult, setExecutionResult] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset form when event/open changes
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setType(event.type);
      setStartDate(toLocalInput(event.startDate));
      setEndDate(toLocalInput(event.endDate));
      setStatus(event.status);
      setExecutionResult(event.executionResult);
    } else {
      setTitle("");
      setType("meeting");
      const base = defaultDate ?? new Date();
      const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 9, 0);
      const end = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 10, 0);
      setStartDate(toLocalInput(start.getTime()));
      setEndDate(toLocalInput(end.getTime()));
      setStatus("scheduled");
      setExecutionResult("");
    }
    setConfirmDelete(false);
  }, [event, open, defaultDate]);

  const handleSave = () => {
    if (!title.trim()) return;
    const startMs = fromLocalInput(startDate);
    const endMs = fromLocalInput(endDate);
    if (!startMs || !endMs || endMs < startMs) return;

    if (isEdit) {
      updateEvent(event.id, {
        title: title.trim(),
        type,
        startDate: startMs,
        endDate: endMs,
        status,
        executionResult,
      });
    } else {
      addEvent({
        title: title.trim(),
        type,
        startDate: startMs,
        endDate: endMs,
        status,
        executionResult,
        projectId: activeProjectId,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!isEdit) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    removeEvent(event.id);
    onClose();
  };

  const selectClass =
    "rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-white/20";
  const inputClass =
    "rounded border border-white/10 bg-bg-base/50 px-2.5 py-1.5 text-xs text-text-primary outline-none placeholder:text-text-muted/40 focus:border-white/20";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed left-1/2 top-1/2 z-50 w-[560px] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="overlay-glass rounded-xl border border-white/10 p-6">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-bold text-text-primary">
                  {isEdit ? "Edit Event" : "New Event"}
                </h2>
                <button
                  onClick={onClose}
                  className="text-text-muted transition-colors hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Title */}
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-text-muted">Title</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Event title..."
                    className={inputClass}
                  />
                </label>

                {/* Type + Status row */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Type</span>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as MCCalendarEventType)}
                      className={selectClass}
                    >
                      {TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Status</span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as MCCalendarEventStatus)}
                      className={selectClass}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Start + End Date row */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">Start Date</span>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-text-muted">End Date</span>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                </div>

                {/* Execution Result */}
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase text-text-muted">Execution Result</span>
                  <textarea
                    value={executionResult}
                    onChange={(e) => setExecutionResult(e.target.value)}
                    placeholder="Execution logs / result from AURIA..."
                    rows={3}
                    className={`resize-none ${inputClass}`}
                  />
                </label>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {isEdit && (
                    <button
                      onClick={handleDelete}
                      className={`flex items-center gap-1.5 rounded px-3 py-2 text-xs font-semibold transition-colors ${
                        confirmDelete
                          ? "bg-red-500/20 text-red-400"
                          : "text-red-400/60 hover:text-red-400"
                      }`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {confirmDelete ? "Confirm Delete" : "Delete"}
                    </button>
                  )}

                  <div className="flex-1" />

                  <button
                    onClick={onClose}
                    className="rounded px-4 py-2 text-xs text-text-muted transition-colors hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!title.trim()}
                    className="rounded bg-mc-accent px-4 py-2 text-xs font-bold text-bg-base transition-colors hover:bg-mc-accent/80 disabled:opacity-30"
                  >
                    {isEdit ? "Save" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
