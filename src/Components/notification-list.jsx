import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BellOff, Check, CircleDot, X } from "lucide-react";
import { useNotifications } from "./ui/notification-service";
import { getNotificationType } from "../lib/notification-types";
import { formatRelativeTime } from "../lib/format";
import { cn } from "../lib/utils";

// Re-render every minute so "5 minutes ago" stays accurate.
function useNow(interval = 60 * 1000) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(timer);
  }, [interval]);
  return now;
}

// Notification centre list, used by the navbar bell and the inbox page.
export default function NotificationList({
  items,
  onNavigate,
  emptyTitle = "You're all caught up",
  emptyDescription = "New notifications will show up here.",
  className,
}) {
  const now = useNow();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand-fg">
          <BellOff className="h-5 w-5" />
        </span>
        <p className="text-sm font-semibold">{emptyTitle}</p>
        <p className="text-xs text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <ul className={cn("divide-y divide-border", className)}>
      {items.map((item) => (
        <NotificationItem
          key={item.id}
          item={item}
          now={now}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  );
}

function NotificationItem({ item, now, onNavigate }) {
  const { markRead, markUnread, remove } = useNotifications();
  const { icon: Icon, iconClass, label } = getNotificationType(item.type);
  const unread = !item.read;

  const body = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          iconClass,
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="sr-only">
          {unread ? "Unread" : "Read"} {label.toLowerCase()} notification:{" "}
        </span>
        <span
          className={cn(
            "block text-sm leading-snug",
            unread ? "font-semibold" : "font-medium text-muted-foreground",
          )}
        >
          {item.title}
        </span>
        {item.description && (
          <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
            {item.description}
          </span>
        )}
        <time
          dateTime={new Date(item.createdAt).toISOString()}
          title={new Date(item.createdAt).toLocaleString()}
          className="mt-1 block text-xs text-muted-foreground/80"
        >
          {formatRelativeTime(item.createdAt, now)}
        </time>
      </span>
    </>
  );

  const rowClass = cn(
    "flex w-full items-start gap-3 py-3 pl-4 pr-20 text-left outline-none transition-colors",
    "hover:bg-white/5 focus-visible:bg-white/5",
    unread && "bg-brand-soft/60",
  );

  return (
    <li className="group relative">
      {item.href ? (
        <Link
          to={item.href}
          className={rowClass}
          onClick={() => {
            markRead(item.id);
            onNavigate?.();
          }}
        >
          {body}
        </Link>
      ) : (
        <button
          type="button"
          className={rowClass}
          onClick={() => markRead(item.id)}
        >
          {body}
        </button>
      )}

      {/* Unread dot; swaps for actions on hover / keyboard focus */}
      {unread && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-4 h-2 w-2 rounded-full bg-brand-fg group-focus-within:opacity-0 group-hover:opacity-0"
        />
      )}
      <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
        <ItemAction
          label={unread ? "Mark as read" : "Mark as unread"}
          onClick={() => (unread ? markRead(item.id) : markUnread(item.id))}
        >
          {unread ? <Check /> : <CircleDot />}
        </ItemAction>
        <ItemAction label="Remove notification" onClick={() => remove(item.id)}>
          <X />
        </ItemAction>
      </div>
    </li>
  );
}

function ItemAction({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-md p-1.5 text-muted-foreground outline-none transition-colors hover:bg-white/10 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-brand-fg/40 [&_svg]:h-4 [&_svg]:w-4"
    >
      {children}
    </button>
  );
}
