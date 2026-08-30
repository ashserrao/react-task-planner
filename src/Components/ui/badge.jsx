import React from "react";
import { cn } from "../../lib/utils";

const VARIANTS = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-border text-foreground",
  destructive: "bg-destructive text-white",
};

export function Badge({ variant = "default", className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        VARIANTS[variant] || VARIANTS.default,
        className,
      )}
      {...props}
    />
  );
}

export default Badge;
