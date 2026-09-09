import {
  CircleAlert,
  CircleCheck,
  Info,
  Loader2,
  TriangleAlert,
} from "lucide-react";

// Icon and colors for each notification type, shared by the pop-up toasts
// and the notification centre.
export const notificationTypes = {
  success: {
    label: "Success",
    icon: CircleCheck,
    iconClass: "bg-emerald-500/15 text-emerald-400",
    barClass: "bg-emerald-500",
  },
  error: {
    label: "Error",
    icon: CircleAlert,
    iconClass: "bg-rose-500/15 text-rose-400",
    barClass: "bg-rose-500",
  },
  warning: {
    label: "Warning",
    icon: TriangleAlert,
    iconClass: "bg-amber-500/15 text-amber-400",
    barClass: "bg-amber-500",
  },
  info: {
    label: "Info",
    icon: Info,
    iconClass: "bg-sky-500/15 text-sky-400",
    barClass: "bg-sky-500",
  },
  loading: {
    label: "In progress",
    icon: Loader2,
    iconClass: "bg-brand-soft text-brand-fg [&_svg]:animate-spin",
    barClass: "bg-brand",
  },
};

export function getNotificationType(type) {
  return notificationTypes[type] ?? notificationTypes.info;
}
