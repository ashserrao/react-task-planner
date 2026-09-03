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
    id: "study",
    name: "Study",
    label: "Study",
    color: "text-amber-300",
    bgColor: "bg-amber-500/20",
    solidBgColor: "bg-amber-500",
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
    color: "text-cyan-300",
    bgColor: "bg-cyan-500/20",
    solidBgColor: "bg-cyan-500",
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

