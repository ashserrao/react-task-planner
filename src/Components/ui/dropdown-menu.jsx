import React, {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../lib/utils";

const DropdownMenuContext = createContext(null);

export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={rootRef} className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ asChild, children, ...props }) {
  const { open, setOpen } = useContext(DropdownMenuContext);
  const onClick = (event) => {
    children.props.onClick?.(event);
    props.onClick?.(event);
    setOpen(!open);
  };

  if (asChild) {
    return cloneElement(children, { ...props, onClick });
  }

  return (
    <button type="button" {...props} onClick={onClick}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({ align = "start", className, children }) {
  const { open } = useContext(DropdownMenuContext);
  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-[10rem] rounded-lg border border-border bg-card p-1 shadow-xl",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ className, onClick, children, ...props }) {
  const { setOpen } = useContext(DropdownMenuContext);
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-secondary",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator({ className }) {
  return <div className={cn("my-1 h-px bg-border", className)} />;
}
