import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

const VARIANTS = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-border bg-transparent hover:bg-secondary",
  ghost: "bg-transparent hover:bg-secondary/60",
  destructive: "bg-destructive text-white hover:bg-destructive/90",
};

const SIZES = {
  default: "h-10 px-4 py-2",
  sm: "h-8 px-3 text-xs",
  lg: "h-11 px-6",
  icon: "h-8 w-8 p-0",
};

export const Button = forwardRef(function Button(
  {
    className,
    type = "button",
    variant = "default",
    size = "default",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold",
        "transition-transform duration-200",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        VARIANTS[variant] || VARIANTS.default,
        SIZES[size] || SIZES.default,
        className,
      )}
      {...props}
    />
  );
});

export default Button;
