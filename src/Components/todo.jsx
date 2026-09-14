import React, { useMemo, useState } from "react";
import HiveBackground from "./HiveBackground";
import { format, addDays, subDays, isSameDay, parseISO } from "date-fns";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { TaskCard } from "./ui/task-card";
import { useTimeTracking } from "../lib/time-tracking-context";
import { TaskFormDialog } from "./ui/task-form-dialog";

const DONE_STATUSES = new Set(["completed", "done"]);
const isTaskDone = (task) =>
  DONE_STATUSES.has(String(task.status || "").toLowerCase());

function ToDoList({ onEditTask, onAddTask }) {
  const {
    selectedDate,
    setSelectedDate,
    getTasksForDate,
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

  const tasks = useMemo(
    () => getTasksForDate(dateString),
    [getTasksForDate, dateString],
  );

  // Flat checklist order: earliest start time first, undone items above
  // done items so the day's remaining work stays at the top.
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aDone = isTaskDone(a) ? 1 : 0;
      const bDone = isTaskDone(b) ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      return a.startHour - b.startHour;
    });
  }, [tasks]);

  const completedCount = tasks.filter(isTaskDone).length;

  const openAddDialog = () => {
    if (onAddTask) return onAddTask(new Date().getHours());
    setDialogState({ task: null, hour: new Date().getHours() });
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
      addTask(formValues.date || dateString, formValues);
    }
    closeDialog();
  };

  const handleDialogDelete = (taskId) => {
    deleteTask(taskId);
    closeDialog();
  };

  return (
    <section id="todo" className="min-h-full bg-[#000000]">
      <HiveBackground hexRadius={60} viewWidth={900} viewHeight={600} />
      <div className="container mx-auto px-3 pb-6 sm:px-4 sm:pb-8 md:px-6">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
            <div>
              <h3 className="font-semibold text-card-foreground">To-Do List</h3>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "EEEE, MMMM d")} • {completedCount}/
                {tasks.length} done
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

            <Button size="sm" onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add task
            </Button>
          </div>

          {/* Progress bar */}
          {tasks.length > 0 && (
            <div className="h-1 w-full bg-muted/30">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${Math.round((completedCount / tasks.length) * 100)}%`,
                }}
              />
            </div>
          )}

          {/* Checklist */}
          <div className="max-h-[calc(100dvh-13rem)] overflow-y-auto sm:max-h-[calc(100dvh-15rem)]">
            {sortedTasks.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Nothing on the list for this day. Add a task to get started.
              </div>
            )}

            <div className="space-y-2 p-3 sm:p-4">
              {sortedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={openEditDialog}
                  isDraggable={false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <TaskFormDialog
        open={Boolean(dialogState)}
        task={dialogState?.task ?? null}
        defaultHour={dialogState?.hour}
        defaultDate={dateString}
        existingTasks={tasks}
        onClose={closeDialog}
        onSubmit={handleDialogSubmit}
        onDelete={handleDialogDelete}
      />
    </section>
  );
}

export default ToDoList;
