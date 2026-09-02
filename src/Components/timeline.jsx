import React, { useMemo, useState } from "react";
import HiveBackground from "./HiveBackground";
import { format, addDays, subDays, isSameDay, parseISO } from "date-fns";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import {
  HOURS,
  formatHour,
  getTaskHourRange,
  tasksOverlap,
  getCategoryById,
} from "../lib/types";
import { useTimeTracking } from "../lib/time-tracking-context";
import { TaskCard } from "./ui/task-card";
import { TaskFormDialog } from "./ui/task-form-dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

function Timeline({ onEditTask, onAddTask }) {
  const {
    selectedDate,
    setSelectedDate,
    getTasksForDate,
    moveTask,
    addTask,
    updateTask,
    deleteTask,
  } = useTimeTracking();
  const dateString = format(selectedDate, "yyyy-MM-dd");
  const isToday = isSameDay(selectedDate, new Date());

  const [dialogState, setDialogState] = useState(null);

  const goToPreviousDay = () => setSelectedDate((prev) => subDays(prev, 1));
  const goToNextDay = () => setSelectedDate((prev) => addDays(prev, 1));
  const goToToday = () => setSelectedDate(new Date());
  const handleDateInputChange = (event) => {
    if (!event.target.value) return;
    setSelectedDate(parseISO(event.target.value));
  };

  const openAddDialog = (hour) => {
    if (onAddTask) return onAddTask(hour);
    setDialogState({ task: null, hour });
  };

  const findNextFreeHour = (startFrom) => {
    for (let i = 0; i < HOURS.length; i++) {
      const candidate = (startFrom + i) % HOURS.length;
      if (!occupiedHours.has(candidate)) return candidate;
    }
    return startFrom;
  };

  const openEditDialog = (task) => {
    if (onEditTask) return onEditTask(task);
    setDialogState({ task, hour: task.startHour });
  };

  const closeDialog = () => setDialogState(null);

  const handleDialogSubmit = (formValues) => {
    if (dialogState?.task) {
      updateTask(dialogState.task.id, formValues);
    } else {
      addTask(dateString, formValues);
    }
    closeDialog();
  };

  const handleDialogDelete = (taskId) => {
    deleteTask(taskId);
    closeDialog();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const tasks = useMemo(
    () => getTasksForDate(dateString),
    [getTasksForDate, dateString],
  );

  const tasksByHour = useMemo(() => {
    const grouped = {};
    HOURS.forEach((hour) => {
      grouped[hour] = tasks.filter((task) => task.startHour === hour);
    });
    return grouped;
  }, [tasks]);

  const occupiedHours = useMemo(() => {
    const map = new Map();
    tasks.forEach((task) => {
      const [start, end] = getTaskHourRange(task);
      for (let hour = start; hour < end; hour++) {
        if (!map.has(hour)) map.set(hour, { task, isStart: hour === start });
      }
    });
    return map;
  }, [tasks]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const overHour = parseInt(over.id);
    if (isNaN(overHour)) return;

    const draggedTask = tasks.find((task) => task.id === taskId);
    if (!draggedTask) return;

    const candidate = { ...draggedTask, startHour: overHour };
    const hasConflict = tasks.some(
      (task) => task.id !== taskId && tasksOverlap(candidate, task),
    );
    if (hasConflict) return;

    moveTask(taskId, overHour);
  };

  const currentHour = new Date().getHours();

  return (
    <section id="home" className="min-h-screen bg-[#000000]">
      <HiveBackground hexRadius={60} viewWidth={900} viewHeight={600} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="container mx-auto px-4 pb-8 md:px-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
              <div>
                <h3 className="font-semibold text-card-foreground">
                  Daily Timeline
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, "EEEE, MMMM d")} • {tasks.length} tasks
                  scheduled
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPreviousDay}
                  aria-label="Previous day"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <input
                  type="date"
                  value={dateString}
                  onChange={handleDateInputChange}
                  className="h-8 rounded-lg border border-border bg-secondary/40 px-2 text-sm text-foreground [color-scheme:dark] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                />
                <button
                  type="button"
                  onClick={goToNextDay}
                  aria-label="Next day"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                {!isToday && (
                  <Button variant="ghost" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                )}
              </div>

              <Button
                size="sm"
                onClick={() => openAddDialog(findNextFreeHour(currentHour))}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add task
              </Button>
            </div>

            {/* Timeline Grid */}
            <div className="max-h-[65vh] overflow-y-auto sm:max-h-[70vh] xl:max-h-[calc(100vh-320px)]">
              {HOURS.map((hour) => {
                const hourTasks = tasksByHour[hour] || [];
                const occupied = occupiedHours.get(hour);
                const isBlockedContinuation = occupied && !occupied.isStart;
                const isCurrentHour =
                  currentHour === hour &&
                  format(new Date(), "yyyy-MM-dd") === dateString;

                return (
                  <div
                    key={hour}
                    id={hour.toString()}
                    className={cn(
                      "group relative flex border-b border-border/50 last:border-0",
                      isCurrentHour && "bg-primary/5",
                    )}
                  >
                    {/* Time Label */}
                    <div
                      className={cn(
                        "w-20 flex-shrink-0 border-r border-border/50 p-3 text-right",
                        isCurrentHour && "text-primary font-medium",
                      )}
                    >
                      <span className="text-sm">{formatHour(hour)}</span>
                    </div>

                    {/* Current time indicator */}
                    {isCurrentHour && (
                      <div className="absolute left-20 right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <div className="h-px flex-1 bg-primary" />
                        </div>
                      </div>
                    )}

                    {/* Task Area */}
                    <div className="flex-1 min-h-[80px] p-3">
                      <SortableContext
                        items={hourTasks.map((t) => t.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {hourTasks.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onEdit={openEditDialog}
                            />
                          ))}
                        </div>
                      </SortableContext>

                      {/* Blocked: hour falls inside another task's duration */}
                      {hourTasks.length === 0 && isBlockedContinuation && (
                        <div className="flex h-8 items-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 text-xs text-muted-foreground">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              getCategoryById(
                                occupied.task.category,
                              )?.solidBgColor || "",
                            )}
                          />
                          {occupied.task.name} continues
                        </div>
                      )}

                      {/* Add task button (revealed on hover on desktop; always visible on touch) */}
                      {hourTasks.length === 0 && !isBlockedContinuation && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAddDialog(hour)}
                          className="h-8 w-full border border-dashed border-border text-muted-foreground opacity-100 transition-opacity hover:text-foreground xl:opacity-0 xl:group-hover:opacity-100"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add task at {formatHour(hour)}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <TaskFormDialog
          open={Boolean(dialogState)}
          task={dialogState?.task ?? null}
          defaultHour={dialogState?.hour}
          existingTasks={tasks}
          onClose={closeDialog}
          onSubmit={handleDialogSubmit}
          onDelete={handleDialogDelete}
        />
      </DndContext>
    </section>
  );
}

export default Timeline;
