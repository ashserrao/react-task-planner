import React from "react";
import { format } from "date-fns";

function capitalize(value) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function fromSheetRow(row) {
  const dt = new Date(row["task date time"]);
  return {
    id: row.rowNumber,
    date: format(dt, "yyyy-MM-dd"),
    startHour: dt.getHours(),
    name: row["Task title"] || "Untitled task",
    description: row["Task description"] || "",
    duration: Number(row["task duration"]) || 1,
    priority: (row["task priority"] || "medium").toLowerCase(),
    category: (row["task category"] || "other").toLowerCase(),
    status: (row["task status"] || "pending").toLowerCase(),
    notes: row["notes"] || "",
  };
}

export function toSheetRow(task) {
  const [year, month, day] = task.date.split("-").map(Number);
  const dt = new Date(year, month - 1, day, task.startHour ?? 0, 0, 0, 0);

  return {
    "Task title": task.name,
    "Task description": task.description || "",
    "task date time": dt.toISOString(),
    "task duration": task.duration,
    "task priority": capitalize(task.priority),
    "task category": capitalize(task.category),
    "task status": capitalize(task.status),
  };
}
