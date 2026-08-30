import React from "react";
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function getTaskHourRange(task) {
  const start = task.startHour;
  const end = Math.min(start + (task.duration || 1), HOURS.length);
  return [start, end];
}

export function tasksOverlap(a, b) {
  const [aStart, aEnd] = getTaskHourRange(a);
  const [bStart, bEnd] = getTaskHourRange(b);
  return aStart < bEnd && bStart < aEnd;
}

export function formatHour(hour) {
  const normalized = ((Math.round(hour) % 24) + 24) % 24;
  const period = normalized >= 12 ? "PM" : "AM";
  const displayHour = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${displayHour}:00 ${period}`;
}

export const TASK_CATEGORIES = [
  {
    id: "work",
    name: "Work",
    color: "text-sky-300",
    bgColor: "bg-sky-500/20",
  },
  {
    id: "personal",
    name: "Personal",
    color: "text-emerald-300",
    bgColor: "bg-emerald-500/20",
  },
  {
    id: "study",
    name: "Study",
    color: "text-amber-300",
    bgColor: "bg-amber-500/20",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    color: "text-fuchsia-300",
    bgColor: "bg-fuchsia-500/20",
  },
  {
    id: "ashtro",
    name: "Ashtro",
    color: "text-cyan-300",
    bgColor: "bg-cyan-500/20",
  },
  {
    id: "other",
    name: "Other",
    color: "text-slate-300",
    bgColor: "bg-slate-500/20",
  },
];

const FALLBACK_CATEGORY = TASK_CATEGORIES[TASK_CATEGORIES.length - 1];

export function getCategoryById(id) {
  if (!id) return FALLBACK_CATEGORY;
  const normalized = id.toLowerCase();
  const known = TASK_CATEGORIES.find((category) => category.id === normalized);
  if (known) return known;
  // Sheet categories are freeform text — show unrecognized ones under their own name instead of mislabeling as "Other".
  return {
    ...FALLBACK_CATEGORY,
    id: normalized,
    name: id.charAt(0).toUpperCase() + id.slice(1),
  };
}

export const PRIORITY_CONFIG = {
  low: { label: "Low", color: "text-slate-300", bgColor: "bg-slate-500/20" },
  medium: {
    label: "Medium",
    color: "text-amber-300",
    bgColor: "bg-amber-500/20",
  },
  high: { label: "High", color: "text-rose-300", bgColor: "bg-rose-500/20" },
};

export const STATUS_CONFIG = {
  pending: { label: "Pending" },
  ongoing: { label: "Ongoing" },
  completed: { label: "Completed" },
};
