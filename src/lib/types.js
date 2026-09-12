export const HOURS = Array.from({ length: 24 }, (_, i) => i);
export const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => i / 4);
export const TIME_SLOTS = TIME_OPTIONS.map((time, index) => ({ time, index }));

export function getTaskSlotRange(task) {
  const start = Math.max(0, Math.round(Number(task.startHour || 0) * 4));
  const duration = Math.max(0.25, Number(task.duration) || 1);
  const end = Math.min(
    TIME_SLOTS.length,
    start + Math.max(1, Math.ceil(duration * 4)),
  );
  return [start, end];
}

export function getTaskHourRange(task) {
  const [startSlot, endSlot] = getTaskSlotRange(task);
  const start = startSlot / 4;
  const end = Math.min(endSlot / 4, HOURS.length);
  return [start, end];
}

export function tasksOverlap(a, b) {
  if (a.date && b.date && a.date !== b.date) {
    return false;
  }
  const [aStart, aEnd] = getTaskHourRange(a);
  const [bStart, bEnd] = getTaskHourRange(b);
  return aStart < bEnd && bStart < aEnd;
}

export function formatHour(hour) {
  const totalMinutes = ((Math.round(Number(hour) * 60) % 1440) + 1440) % 1440;
  const normalized = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = normalized >= 12 ? "PM" : "AM";
  const displayHour = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

export const TASK_CATEGORIES = [
  {
    id: "work",
    name: "Work",
    label: "Work",
    color: "text-sky-300",
    bgColor: "bg-sky-500/20",
    solidBgColor: "bg-sky-500",
  },
  {
    id: "personal",
    name: "Personal",
    label: "Personal",
    color: "text-emerald-300",
    bgColor: "bg-emerald-500/20",
    solidBgColor: "bg-emerald-500",
  },
  {
    id: "learning",
    name: "Learning",
    label: "Learning",
    color: "text-lime-300",
    bgColor: "bg-lime-500/20",
    solidBgColor: "bg-lime-500",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    label: "Entertainment",
    color: "text-fuchsia-300",
    bgColor: "bg-fuchsia-500/20",
    solidBgColor: "bg-fuchsia-500",
  },
  {
    id: "ashtro",
    name: "Ashtro",
    label: "Ashtro",
    color: "text-rose-300",
    bgColor: "bg-rose-500/20",
    solidBgColor: "bg-rose-500",
  },
  {
    id: "health",
    name: "health",
    label: "health",
    color: "text-orange-300",
    bgColor: "bg-orange-500/20",
    solidBgColor: "bg-orange-500",
  },
  {
    id: "other",
    name: "Other",
    label: "Other",
    color: "text-slate-300",
    bgColor: "bg-slate-500/20",
    solidBgColor: "bg-slate-500",
  },
];

export const CATEGORIES = TASK_CATEGORIES;

const FALLBACK_CATEGORY = TASK_CATEGORIES[TASK_CATEGORIES.length - 1];

export function getCategoryById(id) {
  if (!id) return FALLBACK_CATEGORY;
  const normalized = String(id).trim().toLowerCase();
  const known = TASK_CATEGORIES.find((category) => category.id === normalized);
  if (known) return known;
  const capitalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return {
    ...FALLBACK_CATEGORY,
    id: normalized,
    name: capitalized,
    label: capitalized,
    solidBgColor: "bg-slate-500",
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

export function getPriorityConfig(priority) {
  if (!priority) return PRIORITY_CONFIG.medium;
  const key = String(priority).trim().toLowerCase();
  return (
    PRIORITY_CONFIG[key] || {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      color: "text-slate-300",
      bgColor: "bg-slate-500/20",
    }
  );
}

export const STATUS_CONFIG = {
  pending: { label: "Pending" },
  ongoing: { label: "Ongoing" },
  completed: { label: "Completed" },
  done: { label: "Completed" },
  "in-progress": { label: "Ongoing" },
  "in progress": { label: "Ongoing" },
};

export function getStatusConfig(status) {
  if (!status) return STATUS_CONFIG.pending;
  const key = String(status).trim().toLowerCase();
  return (
    STATUS_CONFIG[key] || {
      label: key.charAt(0).toUpperCase() + key.slice(1),
    }
  );
}
