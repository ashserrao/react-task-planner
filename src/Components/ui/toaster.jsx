import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { notify, useNotificationStore } from "../../lib/notify";
import { getNotificationType } from "../../lib/notification-types";
import { cn } from "../../lib/utils";

// Renders the pop-ups created with `notify.*`. Mounted once by
// NotificationProvider. Timers pause while the pointer or keyboard focus is
// on a toast, and while the browser tab is in the background.
export function Toaster() {
  const { toasts } = useNotificationStore();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tabHidden, setTabHidden] = useState(
    () => typeof document !== "undefined" && document.hidden,
  );

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Nothing left to hover once the last toast is gone.
  useEffect(() => {
    if (toasts.length === 0) {
      setHovered(false);
      setFocused(false);
    }
  }, [toasts.length]);

  const paused = hovered || focused || tabHidden;

  return (
    <section
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center p-4 md:inset-x-auto md:right-0 md:p-6"
    >
      <ol
        className="flex w-full flex-col gap-2 md:w-[380px]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} paused={paused} />
        ))}
      </ol>
    </section>
  );
}

function ToastItem({ toast, paused }) {
  const { icon: Icon, iconClass, barClass } = getNotificationType(toast.type);
  const timed = Number.isFinite(toast.duration);
  const close = () => notify.dismiss(toast.id);

  return (
    <li
      role={toast.type === "error" ? "alert" : "status"}
      aria-atomic="true"
      data-state={toast.open ? "open" : "closed"}
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
      className={cn(
        "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl p-4 pr-11 shadow-lg",
        "bg-card ring-1 ring-border",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 md:data-[state=open]:slide-in-from-right-8",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:fill-mode-forwards",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          iconClass,
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>

      <div className="min-w-0 flex-1 pt-1">
        <p className="text-sm font-semibold leading-snug text-foreground">
          {toast.title}
        </p>
        {toast.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action.onClick?.();
              close();
            }}
            className="-ml-2 mt-2 rounded-md px-2 py-1 text-sm font-semibold text-brand-fg outline-none transition-colors hover:bg-brand-soft focus-visible:ring-[3px] focus-visible:ring-brand-fg/40"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={close}
        aria-label="Dismiss notification"
        className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground outline-none transition-colors hover:bg-white/10 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-brand-fg/40"
      >
        <X className="h-4 w-4" />
      </button>

      {/* The shrinking bar is also the auto-close timer: when its animation
          ends the toast closes, and pausing the animation pauses the timer. */}
      {timed && toast.open && (
        <span
          key={toast.version}
          aria-hidden="true"
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          className={cn(
            "absolute bottom-0 left-0 h-[3px] w-full origin-left opacity-70",
            barClass,
          )}
          style={{
            animation: `toast-timer ${toast.duration}ms linear forwards`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      )}
    </li>
  );
}
