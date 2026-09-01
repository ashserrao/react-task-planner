import React, { useMemo, useState } from "react";
import HiveBackground from "./HiveBackground";
import {
    format,
    parseISO,
    subDays,
    isSameDay,
    eachDayOfInterval,
} from "date-fns";
import { Plus, Flame, ListChecks } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { CATEGORIES } from "../lib/types"; // CATEGORIES: assumed export
import { useTimeTracking } from "../lib/time-tracking-context";
import { TaskFormDialog } from "./ui/task-form-dialog";

const DONE_STATUSES = new Set(["completed", "done"]);
const isTaskDone = (task) =>
    DONE_STATUSES.has(String(task.status || "").toLowerCase());

const HEATMAP_DAYS = 30; // last 30 days shown per habit
const MINI_DAYS = 7; // compact row shown on each habit card

function computeStreak(doneDateSet) {
    // Counts consecutive days ending today (or yesterday, so a habit not
    // yet logged today doesn't show a broken streak prematurely).
    let streak = 0;
    let cursor = new Date();
    if (!doneDateSet.has(format(cursor, "yyyy-MM-dd"))) {
        cursor = subDays(cursor, 1);
    }
    while (doneDateSet.has(format(cursor, "yyyy-MM-dd"))) {
        streak += 1;
        cursor = subDays(cursor, 1);
    }
    return streak;
}

function HobbyTracker({ onEditTask }) {
    const { getAllTasks, addTask, updateTask, deleteTask } = useTimeTracking();

    const allTasks = useMemo(() => getAllTasks?.() || [], [getAllTasks]);

    // Habits = categories, same convention as Project Planner. A habit's
    // "check-in" for a day is any completed task in that category on that date.
    const habits = useMemo(() => {
        return CATEGORIES.map((category) => {
            const tasks = allTasks.filter((t) => t.category === category.id);
            const doneDateSet = new Set(
                tasks.filter(isTaskDone).map((t) => t.date).filter(Boolean),
            );
            return {
                category,
                tasks,
                doneDateSet,
                streak: computeStreak(doneDateSet),
            };
        });
    }, [allTasks]);

    const [selectedHabitId, setSelectedHabitId] = useState(
        () => habits[0]?.category.id ?? null,
    );
    const selectedHabit =
        habits.find((h) => h.category.id === selectedHabitId) ?? habits[0];

    const [dialogState, setDialogState] = useState(null);

    const today = new Date();
    const heatmapDays = useMemo(
        () =>
            eachDayOfInterval({
                start: subDays(today, HEATMAP_DAYS - 1),
                end: today,
            }),
        [], // eslint-disable-line react-hooks/exhaustive-deps
    );
    const miniDays = heatmapDays.slice(-MINI_DAYS);

    const logToday = (habit) => {
        const dateKey = format(new Date(), "yyyy-MM-dd");
        const existingToday = habit.tasks.find((t) => t.date === dateKey);
        if (existingToday) {
            // Already have an entry today — just mark it done instead of duplicating.
            updateTask(existingToday.id, { status: "completed" });
            return;
        }
        setDialogState({
            task: null,
            category: habit.category.id,
            date: dateKey,
        });
    };

    const closeDialog = () => setDialogState(null);

    const handleDialogSubmit = (formValues) => {
        if (dialogState?.task) {
            updateTask(dialogState.task.id, formValues);
        } else {
            const date = formValues.date || dialogState?.date;
            addTask(date, {
                ...formValues,
                category: dialogState?.category,
                status: formValues.status || "completed",
            });
        }
        closeDialog();
    };

    const handleDialogDelete = (taskId) => {
        deleteTask(taskId);
        closeDialog();
    };

    return (
        <section id="habits" className="min-h-screen bg-[#000000]">
            <HiveBackground hexRadius={60} viewWidth={900} viewHeight={600} />
            <div className="container mx-auto px-4 pb-8 md:px-6">
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Flame className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <h3 className="font-semibold text-card-foreground">
                                    Habit Tracker
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {habits.length} habits • last {HEATMAP_DAYS} days shown
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Habit cards */}
                    <div className="grid grid-cols-1 gap-3 border-b border-border/50 p-3 sm:grid-cols-2 lg:grid-cols-3">
                        {habits.map((habit) => {
                            const isSelected = habit.category.id === selectedHabit?.category.id;
                            return (
                                <button
                                    type="button"
                                    key={habit.category.id}
                                    onClick={() => setSelectedHabitId(habit.category.id)}
                                    className={cn(
                                        "rounded-lg border border-border/60 p-3 text-left transition-colors hover:bg-secondary/40",
                                        isSelected && "border-primary/50 bg-primary/10",
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span
                                                className={cn(
                                                    "h-2.5 w-2.5 flex-shrink-0 rounded-full",
                                                    habit.category?.solidBgColor || "",
                                                )}
                                            />
                                            <span className="truncate text-sm font-medium text-card-foreground">
                                                {habit.category.label}
                                            </span>
                                        </div>
                                        <span className="flex flex-shrink-0 items-center gap-1 text-xs font-medium text-amber-500">
                                            <Flame className="h-3 w-3" />
                                            {habit.streak}
                                        </span>
                                    </div>

                                    {/* Mini 7-day heatmap */}
                                    <div className="mt-2 flex items-center gap-1">
                                        {miniDays.map((day) => {
                                            const dateKey = format(day, "yyyy-MM-dd");
                                            const done = habit.doneDateSet.has(dateKey);
                                            return (
                                                <span
                                                    key={dateKey}
                                                    title={format(day, "MMM d")}
                                                    className={cn(
                                                        "h-3.5 w-3.5 flex-1 rounded-sm",
                                                        done
                                                            ? habit.category?.solidBgColor || ""
                                                            : "bg-muted/30",
                                                    )}
                                                />
                                            );
                                        })}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Selected habit detail */}
                    {selectedHabit && (
                        <div className="p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h4 className="font-medium text-card-foreground">
                                        {selectedHabit.category.label}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedHabit.streak}-day streak •{" "}
                                        {selectedHabit.doneDateSet.size} check-ins in last{" "}
                                        {HEATMAP_DAYS} days
                                    </p>
                                </div>
                                <Button size="sm" onClick={() => logToday(selectedHabit)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Log today
                                </Button>
                            </div>

                            {/* 30-day heatmap grid */}
                            <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-[repeat(15,minmax(0,1fr))] lg:grid-cols-[repeat(30,minmax(0,1fr))]">
                                {heatmapDays.map((day) => {
                                    const dateKey = format(day, "yyyy-MM-dd");
                                    const done = selectedHabit.doneDateSet.has(dateKey);
                                    const isToday = isSameDay(day, today);
                                    return (
                                        <div
                                            key={dateKey}
                                            title={`${format(day, "EEE, MMM d")}${done ? " • done" : ""}`}
                                            className={cn(
                                                "aspect-square rounded-sm",
                                                done
                                                    ? selectedHabit.category?.solidBgColor || ""
                                                    : "bg-muted/30",
                                                isToday && "ring-1 ring-primary",
                                            )}
                                        />
                                    );
                                })}
                            </div>

                            {/* Recent check-ins list */}
                            <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-card-foreground">
                                <ListChecks className="h-4 w-4 text-muted-foreground" />
                                Recent entries
                            </div>
                            <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-border/50">
                                {selectedHabit.tasks.length === 0 && (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No entries logged for this habit yet.
                                    </div>
                                )}
                                {[...selectedHabit.tasks]
                                    .sort((a, b) => (a.date < b.date ? 1 : -1))
                                    .slice(0, 20)
                                    .map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between gap-2 border-b border-border/50 px-3 py-2 text-sm last:border-0"
                                        >
                                            <span className="text-muted-foreground">
                                                {task.date && format(parseISO(task.date), "EEE, MMM d")}
                                            </span>
                                            <span className="truncate text-card-foreground">
                                                {task.name}
                                            </span>
                                            <span
                                                className={cn(
                                                    "flex-shrink-0 rounded-full border px-2 py-0.5 text-xs capitalize",
                                                    isTaskDone(task)
                                                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-500"
                                                        : "border-border bg-secondary/40 text-muted-foreground",
                                                )}
                                            >
                                                {task.status || "logged"}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <TaskFormDialog
                open={Boolean(dialogState)}
                task={dialogState?.task ?? null}
                defaultCategory={dialogState?.category}
                defaultDate={dialogState?.date}
                existingTasks={selectedHabit?.tasks ?? []}
                onClose={closeDialog}
                onSubmit={handleDialogSubmit}
                onDelete={handleDialogDelete}
            />
        </section>
    );
}

export default HobbyTracker;