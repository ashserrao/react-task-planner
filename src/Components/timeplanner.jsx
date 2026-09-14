import React, { useState } from "react";
import { Clock, Calendar as CalendarIcon, LayoutList } from "lucide-react";
import { cn } from "../lib/utils";
import Timeline from "./timeline";
import CalendarView from "./calendarview";
import ListView from "./listview";

const VIEWS = [
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "list", label: "List", icon: LayoutList },
];

function TimePlanner() {
  const [activeView, setActiveView] = useState("timeline");

  return (
    <div className="min-h-full min-w-0 bg-[#000000]">
      {/* Tab bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-[#000000]/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 md:px-6">
          <div className="flex w-full items-center gap-1 rounded-xl border border-border bg-card p-1 sm:inline-flex sm:w-auto">
            {VIEWS.map(({ id, label, icon: Icon }) => {
              const isActive = activeView === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveView(id)}
                  aria-pressed={isActive}
                  className={cn(
                    "flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors sm:flex-none sm:gap-2 sm:px-3 sm:text-sm",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {activeView === "timeline" && <Timeline />}
      {activeView === "calendar" && (
        <CalendarView onNavigateToTimeline={() => setActiveView("timeline")} />
      )}
      {activeView === "list" && <ListView />}
    </div>
  );
}

export default TimePlanner;
