import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import NotificationBell from "./notification-bell";
import { getNavLinks } from "../lib/navigation";
import { useAuth } from "./authentication/AuthContext";
import { notify } from "../lib/notify";
import { cn } from "../lib/utils";

function BrandMark({ className }) {
  return (
    // <div
    //   className={cn(
    //     "h-6 w-6 shrink-0 rounded-md bg-brand-gradient-accent ring-1 ring-border",
    //     className,
    //   )}
    // />
    <img
      src="/assets/logo no bg.svg"
      alt="Logo"
      className="h-12 w-12 shrink-0"
    />
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const navLinks = getNavLinks(isAdmin);
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "Guest";
  const initials =
    displayName
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  function handleLogout() {
    setOpen(false);
    logout();
    notify.info("You've been signed out");
    navigate("/login", { replace: true });
  }

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2.5 md:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5"
          aria-label="Ashtro Planner"
        >
          <BrandMark />
          <span className="truncate font-display text-lg font-semibold tracking-tight text-brand-gradient">
            Ashtro Planner
          </span>
        </Link>

        {/* Center links (desktop) */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <li key={l.label}>
              <NavLink
                to={l.to}
                end
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center rounded-md px-3 py-2 text-sm capitalize text-muted-foreground transition-colors",
                    "hover:text-foreground",
                    isActive && "bg-white/10 font-medium text-glow",
                  )
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right side actions */}
        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                aria-label="Open profile menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-strong text-xs font-semibold text-white">
                  {initials}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col px-2 py-1.5 text-sm font-medium">
                <span className="truncate">{displayName}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2"
                onClick={() => navigate("/notifications")}
              >
                <Bell className="h-4 w-4 text-muted-foreground" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4 text-muted-foreground" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[18rem] gap-0 p-0">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <SheetDescription className="sr-only">
                Site navigation links
              </SheetDescription>
              <div className="border-b border-border px-4 pb-3 pt-4">
                <div className="flex items-center gap-2">
                  <BrandMark />
                  <span className="font-display text-base font-semibold tracking-tight">
                    Ashtro Planner
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 p-2">
                {navLinks.map((l) => (
                  <NavLink
                    key={l.label}
                    to={l.to}
                    end
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm capitalize transition-colors",
                        isActive
                          ? "bg-brand-gradient text-white"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )
                    }
                    onClick={() => setOpen(false)}
                  >
                    <l.icon className="h-4 w-4 shrink-0" />
                    {l.label}
                  </NavLink>
                ))}
              </div>
              <div className="mt-auto border-t border-border p-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign out
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* Thin gradient accent */}
      <div className="h-[2px] w-full bg-brand-gradient-accent" />
    </nav>
  );
}
