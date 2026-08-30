import React from "react";
import { cn } from "../../lib/utils";
import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const Field = forwardRef(function Field(
  { label, icon, type = "text", className, id, ...props },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const isPassword = type === "password";
  const [reveal, setReveal] = useState(false);
  const inputType = isPassword ? (reveal ? "text" : "password") : type;

  return (
    <div className="group flex flex-col gap-1.5">
      <label
        htmlFor={fieldId}
        className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-accent">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={fieldId}
          type={inputType}
          className={cn(
            "w-full rounded-lg border border-input bg-secondary/40 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40",
            "transition-all duration-200 outline-none",
            "focus:border-accent/60 focus:bg-secondary/70 focus:ring-2 focus:ring-accent/25",
            icon ? "pl-10" : "pl-3.5",
            isPassword ? "pr-10" : "pr-3.5",
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground/60 transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {reveal ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
});
