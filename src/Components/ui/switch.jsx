import React from "react";
import { cn } from "../../lib/utils";

// Accessible on/off toggle styled with the brand color.
export function Switch({
  checked,
  onChange,
  disabled,
  labelledBy,
  describedBy,
  label,
  className,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-brand-fg/40",
        "disabled:cursor-not-allowed",
        checked ? "bg-brand-fg" : "bg-muted-foreground/50",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
