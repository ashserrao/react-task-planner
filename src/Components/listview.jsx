import React, { useMemo, useState } from "react";
import HiveBackground from "./HiveBackground";
import { format, parseISO } from "date-fns";
import {
    Plus,
    Pencil,
    Trash2,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    X,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { formatHour, getTaskHourRange, getCategoryById } from "../lib/types";
import { useTimeTracking } from "../lib/time-tracking-context";
import { TaskFormDialog } from "./ui/task-form-dialog";

const ALL = "all";

// Fallback styling for priority/status values that don't match a known
// keyword. Known keywords get a semantic color; anything else still
// renders (as a neutral badge) instead of breaking.
const PRIORITY_STYLES = {
    high: "bg-destructive/15 text-destructive border-destructive/30",
    medium: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    low: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
};

const STATUS_STYLES = {
    completed: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    done: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    "in-progress": "bg-blue-500/15 text-blue-500 border-blue-500/30",
    "in progress": "bg-blue-500/15 text-blue-500 border-blue-500/30",
    pending: "bg-muted text-muted-foreground border-border",
    cancelled: "bg-muted text-muted-foreground border-border line-through",
};

const DEFAULT_BADGE = "bg-secondary/40 text-foreground border-border";

function Badge({ value, styleMap }) {
    if (!value) return <span className="text-xs text-muted-foreground">—</span>;
    const key = String(value).toLowerCase();
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
                styleMap[key] || DEFAULT_BADGE,
            )}
        >
            {value}
        </span>
    );
}

function ListView({ onEditTask, onAddTask }) {
    const {
        getAllTasks, // assumed context API — rename here if yours differs
        addTask,
        updateTask,
        deleteTask,
    } = useTimeTracking();

    const [dialogState, setDialogState] = useState(null);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    const [categoryFilter, setCategoryFilter] = useState(ALL);
    const [priorityFilter, setPriorityFilter] = useState(ALL);
    const [statusFilter, setStatusFilter] = useState(ALL);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [sortDirection, setSortDirection] = useState("asc"); // "asc" | "desc"

    const allTasks = useMemo(() => getAllTasks?.() || [], [getAllTasks]);

    // Option lists are derived from the actual data so the filters never
    // fall out of sync with whatever categories/priorities/statuses exist.
    const categoryOptions = useMemo(() => {
        const seen = new Map();
        allTasks.forEach((task) => {
            if (!seen.has(task.category)) {
                seen.set(task.category, getCategoryById(task.category));
            }
        });
        return Array.from(seen.entries());
    }, [allTasks]);

    const priorityOptions = useMemo(
        () => Array.from(new Set(allTasks.map((t) => t.priority).filter(Boolean))),
        [allTasks],
    );

    const statusOptions = useMemo(
        () => Array.from(new Set(allTasks.map((t) => t.status).filter(Boolean))),
        [allTasks],
    );

    const hasActiveFilters =
        categoryFilter !== ALL ||
        priorityFilter !== ALL ||
        statusFilter !== ALL ||
        dateFrom ||
        dateTo;

    const clearFilters = () => {
        setCategoryFilter(ALL);
        setPriorityFilter(ALL);
        setStatusFilter(ALL);
        setDateFrom("");
        setDateTo("");
    };

    const filteredTasks = useMemo(() => {
        return allTasks.filter((task) => {
            if (categoryFilter !== ALL && task.category !== categoryFilter)
                return false;
            if (priorityFilter !== ALL && task.priority !== priorityFilter)
                return false;
            if (statusFilter !== ALL && task.status !== statusFilter) return false;
            if (dateFrom && task.date < dateFrom) return false;
            if (dateTo && task.date > dateTo) return false;
            return true;
        });
    }, [allTasks, categoryFilter, priorityFilter, statusFilter, dateFrom, dateTo]);

    const sortedTasks = useMemo(() => {
        const withSortKey = filteredTasks.map((task) => {
            const dateMs = task.date ? parseISO(task.date).getTime() : 0;
            return { task, sortKey: dateMs + (task.startHour || 0) * 3600000 };
        });
        withSortKey.sort((a, b) =>
            sortDirection === "asc" ? a.sortKey - b.sortKey : b.sortKey - a.sortKey,
        );
        return withSortKey.map(({ task }) => task);
    }, [filteredTasks, sortDirection]);

    const toggleSortDirection = () =>
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));

    const openAddDialog = () => {
        if (onAddTask) return onAddTask();
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
        } else if (dialogState?.task === null && formValues.date) {
            addTask(formValues.date, formValues);
        }
        closeDialog();
    };

    const handleDialogDelete = (taskId) => {
        deleteTask(taskId);
        closeDialog();
    };

    const handleQuickDelete = (taskId) => {
        if (pendingDeleteId !== taskId) {
            // First click arms the delete; avoids accidental removal with no
            // separate confirm dialog in a dense list.
            setPendingDeleteId(taskId);
            return;
        }
        deleteTask(taskId);
        setPendingDeleteId(null);
    };

    return (
        <section id="list" className="min-h-screen bg-[#000000]">
            <HiveBackground hexRadius={60} viewWidth={900} viewHeight={600} />
            <div className="container mx-auto px-4 pb-8 md:px-6">
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
                        <div>
                            <h3 className="font-semibold text-card-foreground">
                                All Tasks
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {sortedTasks.length} of {allTasks.length} tasks
                            </p>
                        </div>

                        <Button size="sm" onClick={openAddDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add task
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-border/50 px-4 py-3">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="h-8 rounded-lg border border-border bg-secondary/40 px-2 text-sm text-foreground [color-scheme:dark] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                        >
                            <option value={ALL}>All categories</option>
                            {categoryOptions.map(([id, category]) => (
                                <option key={id} value={id}>
                                    {category.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="h-8 rounded-lg border border-border bg-secondary/40 px-2 text-sm text-foreground capitalize [color-scheme:dark] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                        >
                            <option value={ALL}>All priorities</option>
                            {priorityOptions.map((priority) => (
                                <option key={priority} value={priority} className="capitalize">
                                    {priority}
                                </option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-8 rounded-lg border border-border bg-secondary/40 px-2 text-sm text-foreground capitalize [color-scheme:dark] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                        >
                            <option value={ALL}>All statuses</option>
                            {statusOptions.map((status) => (
                                <option key={status} value={status} className="capitalize">
                                    {status}
                                </option>
                            ))}
                        </select>

                        <div className="flex items-center gap-1">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                aria-label="From date"
                                className="h-8 rounded-lg border border-border bg-secondary/40 px-2 text-sm text-foreground [color-scheme:dark] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                            />
                            <span className="text-xs text-muted-foreground">to</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                aria-label="To date"
                                className="h-8 rounded-lg border border-border bg-secondary/40 px-2 text-sm text-foreground [color-scheme:dark] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={toggleSortDirection}
                            className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            aria-label={`Sort by date ${sortDirection === "asc" ? "ascending" : "descending"}`}
                        >
                            {sortDirection === "asc" ? (
                                <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                                <ArrowDown className="h-3.5 w-3.5" />
                            )}
                            Date
                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                        </button>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="flex h-8 items-center gap-1 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                                Clear filters
                            </button>
                        )}
                    </div>

                    {/* Column headers (desktop only) */}
                    <div className="hidden border-b border-border/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:grid lg:grid-cols-[1fr_10rem_9rem_6.5rem_7rem_5rem]">
                        <span>Title</span>
                        <span>Date &amp; Time</span>
                        <span>Category</span>
                        <span>Priority</span>
                        <span>Status</span>
                        <span className="text-right">Actions</span>
                    </div>

                    {/* Task rows */}
                    <div className="max-h-[65vh] overflow-y-auto sm:max-h-[70vh] xl:max-h-[calc(100vh-360px)]">
                        {sortedTasks.length === 0 && (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                {allTasks.length === 0
                                    ? "No tasks yet."
                                    : "No tasks match the current filters."}
                            </div>
                        )}

                        {sortedTasks.map((task) => {
                            const category = getCategoryById(task.category);
                            const [startHour, endHour] = getTaskHourRange(task);
                            const isArmedForDelete = pendingDeleteId === task.id;

                            return (
                                <div
                                    key={task.id}
                                    className="group grid grid-cols-1 gap-2 border-b border-border/50 px-4 py-3 last:border-0 hover:bg-secondary/30 lg:grid-cols-[1fr_10rem_9rem_6.5rem_7rem_5rem] lg:items-center lg:gap-2"
                                >
                                    {/* Title */}
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span
                                            className={cn(
                                                "h-2 w-2 flex-shrink-0 rounded-full lg:hidden",
                                                category?.solidBgColor || "",
                                            )}
                                        />
                                        <p className="truncate text-sm font-medium text-card-foreground">
                                            {task.name}
                                        </p>
                                    </div>

                                    {/* Date & time */}
                                    <div className="text-sm text-muted-foreground">
                                        {task.date && (
                                            <span className="mr-1.5">
                                                {format(parseISO(task.date), "MMM d, yyyy")}
                                            </span>
                                        )}
                                        <span>
                                            {formatHour(startHour)} – {formatHour(endHour)}
                                        </span>
                                    </div>

                                    {/* Category */}
                                    <div className="hidden items-center gap-1.5 lg:flex">
                                        <span
                                            className={cn(
                                                "h-1.5 w-1.5 flex-shrink-0 rounded-full",
                                                category?.solidBgColor || "",
                                            )}
                                        />
                                        <span className="truncate text-sm text-muted-foreground">
                                            {category.label}
                                        </span>
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        <Badge value={task.priority} styleMap={PRIORITY_STYLES} />
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <Badge value={task.status} styleMap={STATUS_STYLES} />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 lg:justify-end">
                                        <button
                                            type="button"
                                            onClick={() => openEditDialog(task)}
                                            aria-label={`Edit ${task.name}`}
                                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickDelete(task.id)}
                                            onBlur={() => setPendingDeleteId(null)}
                                            aria-label={
                                                isArmedForDelete
                                                    ? `Confirm delete ${task.name}`
                                                    : `Delete ${task.name}`
                                            }
                                            className={cn(
                                                "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                                                isArmedForDelete
                                                    ? "bg-destructive/20 text-destructive"
                                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                                            )}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
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
                existingTasks={allTasks}
                onClose={closeDialog}
                onSubmit={handleDialogSubmit}
                onDelete={handleDialogDelete}
            />
        </section>
    );
}

export default ListView;