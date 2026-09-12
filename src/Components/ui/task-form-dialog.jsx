import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarPlus, X } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";
import {
  TIME_OPTIONS,
  TASK_CATEGORIES,
  PRIORITY_CONFIG,
  formatHour,
  tasksOverlap,
} from "../../lib/types";
import { useTimeTracking } from "../../lib/time-tracking-context";
import { DEFAULT_REMINDER_MINUTES } from "../../lib/sheet-mapper";
import { useAuth } from "../authentication/AuthContext";

const REMINDER_OPTIONS = [
  { value: 0, label: "At start time" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 120, label: "2 hours before" },
  { value: 1440, label: "1 day before" },
];

const EMPTY_FORM = {
  date: format(new Date(), "yyyy-MM-dd"),
  name: "",
  description: "",
  category: TASK_CATEGORIES[0].id,
  priority: "medium",
  startHour: 9,
  duration: 1,
  notes: "",
  calendarSync: false,
  reminderMinutes: DEFAULT_REMINDER_MINUTES,
};

const inputClass =
  "w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

export function TaskFormDialog({
  open,
  task,
  defaultHour,
  defaultDate,
  existingTasks = [],
  onClose,
  onSubmit,
  onDelete,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  // Google Calendar sync is admin-only; demo accounts never reach the API.
  const { isAdmin } = useAuth();
  let getAllTasks;
  try {
    const context = useTimeTracking();
    getAllTasks = context.getAllTasks;
  } catch (e) {
    // If used outside of provider, fallback to existingTasks
  }

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      task
        ? {
            name: task.name || "",
            description: task.description || "",
            category: task.category || TASK_CATEGORIES[0].id,
            priority: task.priority || "medium",
            date: task.date || defaultDate || format(new Date(), "yyyy-MM-dd"),
            startHour: task.startHour ?? defaultHour ?? 9,
            duration: task.duration || 1,
            notes: task.notes || "",
            calendarSync: Boolean(task.calendarSync),
            reminderMinutes:
              task.reminderMinutes ?? DEFAULT_REMINDER_MINUTES,
          }
        : {
            ...EMPTY_FORM,
            date: defaultDate || format(new Date(), "yyyy-MM-dd"),
            startHour: defaultHour ?? 9,
          },
    );
  }, [open, task, defaultHour, defaultDate]);

  if (!open) return null;

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setError("");
    setForm((prev) => ({
      ...prev,
      [field]:
        field === "startHour" ||
        field === "duration" ||
        field === "reminderMinutes"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    const conflictTasks = typeof getAllTasks === 'function' ? getAllTasks() : existingTasks;

    const conflict = conflictTasks.find(
      (other) => other.id !== task?.id && tasksOverlap(form, other),
    );
    if (conflict) {
      setError(
        `This overlaps with "${conflict.name}" (${formatHour(conflict.startHour)}).`,
      );
      return;
    }

    onSubmit(isAdmin ? form : { ...form, calendarSync: false });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center">
      <div className="my-8 max-h-[calc(100vh-4rem)] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-2xl sm:my-0">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-card-foreground">
            {task ? "Edit Task" : "Add Task"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Name
            </label>
            <input
              className={inputClass}
              value={form.name}
              onChange={handleChange("name")}
              placeholder="Task name"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Description
            </label>
            <input
              className={inputClass}
              value={form.description}
              onChange={handleChange("description")}
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Date
              </label>
              <input
                type="date"
                className={inputClass}
                value={form.date}
                onChange={handleChange("date")}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Category
              </label>
              <select
                className={cn(inputClass, "appearance-none")}
                value={form.category}
                onChange={handleChange("category")}
              >
                {TASK_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Priority
              </label>
              <select
                className={cn(inputClass, "appearance-none")}
                value={form.priority}
                onChange={handleChange("priority")}
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Start time
              </label>
              <select
                className={cn(inputClass, "appearance-none")}
                value={form.startHour}
                onChange={handleChange("startHour")}
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {formatHour(time)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Duration (hrs)
              </label>
              <input
                type="number"
                min={0.25}
                max={12}
                step={0.25}
                className={inputClass}
                value={form.duration}
                onChange={handleChange("duration")}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Notes
            </label>
            <textarea
              className={cn(inputClass, "min-h-[70px] resize-none")}
              value={form.notes}
              onChange={handleChange("notes")}
              placeholder="Optional notes"
            />
          </div>

          <div className="rounded-lg border border-border bg-secondary/20 p-3">
            <label
              className={cn(
                "flex items-center gap-2 text-sm text-foreground",
                isAdmin ? "cursor-pointer" : "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-current"
                disabled={!isAdmin}
                checked={isAdmin && form.calendarSync}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    calendarSync: event.target.checked,
                  }))
                }
              />
              <CalendarPlus className="h-4 w-4 text-muted-foreground" />
              Add to Google Calendar
            </label>
            {!isAdmin && (
              <p className="mt-2 text-xs text-muted-foreground">
                Not available with a demo account.
              </p>
            )}
            {isAdmin && form.calendarSync && (
              <div className="mt-3">
                <label className="mb-1 block text-xs text-muted-foreground">
                  Reminder
                </label>
                <select
                  className={cn(inputClass, "appearance-none")}
                  value={form.reminderMinutes}
                  onChange={handleChange("reminderMinutes")}
                >
                  {REMINDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            {task && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onDelete(task.id)}
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {task ? "Save" : "Add task"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskFormDialog;
