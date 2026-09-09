import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import NotificationList from "./notification-list";
import { useNotifications } from "./ui/notification-service";
import { cn } from "../lib/utils";

const filters = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
];

// Navbar bell with unread count; opens the notification centre.
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const items =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-strong px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-background"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="w-[min(24rem,calc(100vw-2rem))] overflow-hidden p-0"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-fg">
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-fg outline-none transition-colors hover:bg-brand-soft focus-visible:ring-[3px] focus-visible:ring-brand-fg/40 disabled:pointer-events-none disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all as read
          </button>
        </div>

        <div
          role="group"
          aria-label="Filter notifications"
          className="flex gap-1 border-b border-border px-3 py-2"
        >
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-brand-fg/40",
                filter === f.value
                  ? "bg-white/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
          <NotificationList
            items={items}
            onNavigate={() => setOpen(false)}
            emptyTitle={
              filter === "unread" ? "No unread notifications" : undefined
            }
          />
        </div>

        <div className="border-t border-border p-2">
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-center text-sm font-medium text-brand-fg outline-none transition-colors hover:bg-brand-soft focus-visible:ring-[3px] focus-visible:ring-brand-fg/40"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
