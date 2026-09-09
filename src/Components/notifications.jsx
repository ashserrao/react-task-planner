import React, { useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import NotificationList from "./notification-list";
import { useNotifications } from "./ui/notification-service";
import { notify } from "../lib/notify";
import { cn } from "../lib/utils";

const cardClass = "rounded-xl border border-border bg-card";

const filterOptions = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "success", label: "Success" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warnings" },
  { value: "error", label: "Errors" },
];

function Notifications() {
  const {
    notifications,
    unreadCount,
    markAllRead,
    clearAll,
    restore,
    prefs,
    setPrefs,
  } = useNotifications();
  const [filter, setFilter] = useState("all");

  const items = notifications.filter((n) =>
    filter === "all" ? true : filter === "unread" ? !n.read : n.type === filter,
  );

  function handleClear() {
    const previous = notifications;
    clearAll();
    notify.info("Notifications cleared", {
      action: { label: "Undo", onClick: () => restore(previous) },
    });
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
          Notifications
        </h1>
        <p className="text-sm text-muted-foreground">
          Task sync results and other updates
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Inbox */}
        <section className={cn(cardClass, "overflow-hidden xl:col-span-2")}>
          <div className="px-6 pb-4 pt-5">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Bell className="h-4 w-4 text-brand-fg" />
              Inbox
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-fg">
                  {unreadCount} unread
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Kept in this browser for your account. The newest 50 are saved.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border px-6 py-3">
            <div
              role="group"
              aria-label="Filter notifications"
              className="flex flex-wrap gap-1"
            >
              {filterOptions.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={filter === f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-brand-fg/40",
                    filter === f.value
                      ? "bg-brand-soft text-brand-fg ring-1 ring-brand-fg/25"
                      : "text-muted-foreground hover:bg-white/10 hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </Button>
            </div>
          </div>

          <NotificationList
            items={items}
            emptyTitle={
              notifications.length === 0
                ? "You're all caught up"
                : "Nothing matches this filter"
            }
            emptyDescription={
              notifications.length === 0
                ? "New notifications will show up here."
                : "Try a different filter."
            }
          />
        </section>

        {/* Preferences */}
        <section className={cn(cardClass, "self-start p-6")}>
          <h2 className="text-base font-semibold">Preferences</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose how notifications reach you
          </p>
          <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <div>
              <div id="popups-label" className="text-sm font-medium">
                Pop-up notifications
              </div>
              <p id="popups-desc" className="text-xs text-muted-foreground">
                When off, only errors pop up. Your inbox still fills up as
                usual.
              </p>
            </div>
            <Switch
              checked={prefs.popups}
              onChange={(popups) => setPrefs({ popups })}
              labelledBy="popups-label"
              describedBy="popups-desc"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default Notifications;
