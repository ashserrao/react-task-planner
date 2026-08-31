import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HiveBackground from "./HiveBackground";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday as isDateToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { getCategoryById } from "../lib/types";
import { useTimeTracking } from "../lib/time-tracking-context";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MAX_DOTS = 4;

function CalendarView() {
  const navigate = useNavigate();
  const { selectedDate, setSelectedDate, getTasksForDate } = useTimeTracking();

  // The month currently being displayed (independent from the selected day)
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(selectedDate || new Date()),
  );
  const [activeDay, setActiveDay] = useState(selectedDate || new Date());

  const goToPreviousMonth = () => setVisibleMonth((prev) => subMonths(prev, 1));
  const goToNextMonth = () => setVisibleMonth((prev) => addMonths(prev, 1));
  const goToCurrentMonth = () => setVisibleMonth(startOfMonth(new Date()));

  const handleMonthSelect = (event) => {
    const newMonth = Number(event.target.value);
    setVisibleMonth((prev) => new Date(prev.getFullYear(), newMonth, 1));
  };

  const handleYearSelect = (event) => {
    const newYear = Number(event.target.value);
    setVisibleMonth((prev) => new Date(newYear, prev.getMonth(), 1));
  };

  // Grid always shows full weeks, including leading/trailing days
  // from the previous/next month.
  const daysInGrid = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth));
    const end = endOfWeek(endOfMonth(visibleMonth));
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);

  // Map of "yyyy-MM-dd" -> tasks[], built once per grid so we don't
  // call getTasksForDate repeatedly during render for the same day.
  const tasksByDate = useMemo(() => {
    const map = {};
    daysInGrid.forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      map[key] = getTasksForDate(key) || [];
    });
    return map;
  }, [daysInGrid, getTasksForDate]);

  const activeDayKey = format(activeDay, "yyyy-MM-dd");
  const activeDayTasks = tasksByDate[activeDayKey] || [];

  // Distinct categories present on a given day, capped for preview dots
  const getCategoryDotsForDay = (dateKey) => {
    const dayTasks = tasksByDate[dateKey] || [];
    const seen = new Set();
    const dots = [];
    for (const task of dayTasks) {
      if (seen.has(task.category)) continue;
      seen.add(task.category);
      dots.push(getCategoryById(task.category));
      if (dots.length >= MAX_DOTS) break;
    }
    return { dots, overflow: Math.max(0, dayTasks.length - dots.length) };
  };

  const handleDayClick = (day) => {
    setActiveDay(day);
  };

  const handleDayDoubleClick = (day) => {
    setSelectedDate(day);
    navigate("/timeline");
  };

  // Year dropdown: a reasonable window around the current year
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(
    () => Array.from({ length: 21 }, (_, i) => currentYear - 10 + i),
    [currentYear],
  );

  return (
    <section id="calendar" className="min-h-screen bg-[#000000]">
      <HiveBackground hexRadius={60} viewWidth={900} viewHeight={600} />
      <div className="container mx-auto px-4 pb-8 md:px-6">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
            <div>
              <h3 className="font-semibold text-card-foreground">Calendar</h3>
              <p className="text-sm text-muted-foreground">
                {format(visibleMonth, "MMMM yyyy")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousMonth}
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <select
                value={visibleMonth.getMonth()}
                onChange={handleMonthSelect}
                className="h-8 rounded-lg border border-border bg-secondary/40 px-2 text-sm text-foreground [color-scheme:dark] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {MONTH_LABELS.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={visibleMonth.getFullYear()}
                onChange={handleYearSelect}
                className="h-8 rounded-lg border border-border bg-secondary/40 px-2 text-sm text-foreground [color-scheme:dark] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={goToNextMonth}
                aria-label="Next month"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {!isSameMonth(visibleMonth, new Date()) && (
                <Button variant="ghost" size="sm" onClick={goToCurrentMonth}>
                  This month
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
            {/* Calendar grid */}
            <div className="border-r border-border/50">
              {/* Weekday header row */}
              <div className="grid grid-cols-7 border-b border-border/50">
                {WEEKDAY_LABELS.map((label) => (
                  <div
                    key={label}
                    className="p-2 text-center text-xs font-medium text-muted-foreground"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7">
                {daysInGrid.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const inCurrentMonth = isSameMonth(day, visibleMonth);
                  const isSelected = isSameDay(day, activeDay);
                  const isTodayCell = isDateToday(day);
                  const { dots, overflow } = getCategoryDotsForDay(dateKey);
                  const hasTasks = dots.length > 0;

                  return (
                    <button
                      type="button"
                      key={dateKey}
                      onClick={() => handleDayClick(day)}
                      onDoubleClick={() => handleDayDoubleClick(day)}
                      title={
                        hasTasks
                          ? `${dots.length + overflow} task${
                              dots.length + overflow === 1 ? "" : "s"
                            } • double-click to open timeline`
                          : "Double-click to open timeline"
                      }
                      className={cn(
                        "group relative flex h-20 flex-col items-start gap-1 border-b border-r border-border/50 p-2 text-left transition-colors last:border-r-0 hover:bg-secondary/40 sm:h-24",
                        !inCurrentMonth && "opacity-40",
                        isSelected &&
                          "bg-primary/10 ring-1 ring-inset ring-primary/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                          isTodayCell &&
                            "bg-primary font-semibold text-primary-foreground",
                          !isTodayCell && "text-foreground",
                        )}
                      >
                        {format(day, "d")}
                      </span>

                      {/* Task preview dots */}
                      {hasTasks && (
                        <div className="flex flex-wrap items-center gap-1">
                          {dots.map((category, idx) => (
                            <span
                              key={idx}
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                category?.solidBgColor || "",
                              )}
                            />
                          ))}
                          {overflow > 0 && (
                            <span className="text-[10px] leading-none text-muted-foreground">
                              +{overflow}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected day task list */}
            <div className="flex flex-col">
              <div className="border-b border-border/50 px-4 py-3">
                <h4 className="font-medium text-card-foreground">
                  {format(activeDay, "EEEE, MMMM d")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {activeDayTasks.length} task
                  {activeDayTasks.length === 1 ? "" : "s"} scheduled
                </p>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto p-4 max-h-[50vh] lg:max-h-[calc(100vh-320px)]">
                {activeDayTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No tasks for this day.
                  </p>
                )}

                {activeDayTasks.map((task) => {
                  const category = getCategoryById(task.category);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                    >
                      <span
                        className={cn(
                          "h-2 w-2 flex-shrink-0 rounded-full",
                          category?.solidBgColor || "",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-card-foreground">
                          {task.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {category.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border/50 p-3">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleDayDoubleClick(activeDay)}
                >
                  Open in Timeline
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CalendarView;
