import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";
import {
  HOURS,
  TASK_CATEGORIES,
  PRIORITY_CONFIG,
  formatHour,
  tasksOverlap,
} from "../../lib/types";

const EMPTY_FORM = {
  name: "",
  description: "",
  category: TASK_CATEGORIES[0].id,
  priority: "medium",
  startHour: 9,
  duration: 1,
  notes: "",
};

const inputClass =
  "w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

export function TaskFormDialog({
  open,
  task,
  defaultHour,
  existingTasks = [],
  onClose,
  onSubmit,
  onDelete,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

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
            startHour: task.startHour ?? defaultHour ?? 9,
            duration: task.duration || 1,
            notes: task.notes || "",
          }
        : { ...EMPTY_FORM, startHour: defaultHour ?? 9 },
    );
  }, [open, task, defaultHour]);

  if (!open) return null;

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setError("");
    setForm((prev) => ({
      ...prev,
      [field]:
        field === "startHour" || field === "duration" ? Number(value) : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    const conflict = existingTasks.find(
      (other) => other.id !== task?.id && tasksOverlap(form, other),
    );
    if (conflict) {
      setError(
        `This overlaps with "${conflict.name}" (${formatHour(conflict.startHour)}).`,
      );
      return;
    }

    onSubmit(form);
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
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>
                    {formatHour(hour)}
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
                min={1}
                max={12}
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
