import {
  CalendarClock,
  FolderKanban,
  Home,
  Library,
  ListTodo,
} from "lucide-react";

// Single source of truth for app navigation (top bar and mobile menu).
// Add new pages here and register their route in portfolio.jsx.
// `adminOnly` links are hidden from demo accounts (wrap the route in AdminRoute too).
export const navLinks = [
  { label: "home", to: "/", icon: Home },
  { label: "time-planner", to: "/time-planner", icon: CalendarClock },
  { label: "project-track", to: "/project-track", icon: FolderKanban },
  { label: "todo-list", to: "/todo-list", icon: ListTodo },
  { label: "nec-doc", to: "/nec-doc", icon: Library, adminOnly: true },
  { label: "dev-res-admin", to: "/dev-res-admin", icon: Library, adminOnly: true },
];

export function getNavLinks(isAdmin) {
  return navLinks.filter((link) => isAdmin || !link.adminOnly);
}
