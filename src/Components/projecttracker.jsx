import React, { useMemo, useState } from "react";
import HiveBackground from "./HiveBackground";
import { format, parseISO } from "date-fns";
import { Plus, Pencil, Trash2, FolderKanban } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import {
    CATEGORIES, // assumed export: full list of category definitions
    formatHour,
    getTaskHourRange,
} from "../lib/types";
import { useTimeTracking } from "../lib/time-tracking-context";
import { TaskFormDialog } from "./ui/task-form-dialog";

const DONE_STATUSES = new Set(["completed", "done"]);
const isTaskDone = (task) =>
    DONE_STATUSES.has(String(task.status || "").toLowerCase());

function ProjectPlanner({ onEditTask }) {
    const { getAllTasks, addTask, updateTask, deleteTask } = useTimeTracking();

    const allTasks = useMemo(() => getAllTasks?.() || [], [getAllTasks]);

    // Projects = categories. Every category shows up as a project card,
    // even with zero tasks, so the planner can be set up ahead of time.
    const projects = useMemo(() => {
        return CATEGORIES.map((category) => {
            const tasks = allTasks.filter((t) => t.category === category.id);
            const completed = tasks.filter(isTaskDone).length;
            const progress = tasks.length
                ? Math.round((completed / tasks.length) * 100)
                : 0;
            return { category, tasks, completed, progress };
        });
    }, [allTasks]);

    const [selectedProjectId, setSelectedProjectId] = useState(
        () => projects[0]?.category.id ?? null,
    );
    const selectedProject =
        projects.find((p) => p.category.id === selectedProjectId) ?? projects[0];

    const [dialogState, setDialogState] = useState(null);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    const sortedProjectTasks = useMemo(() => {
        if (!selectedProject) return [];
        return [...selectedProject.tasks].sort((a, b) => {
            const aTime = (a.date ? parseISO(a.date).getTime() : 0) +
                (a.startHour || 0) * 3600000;
            const bTime = (b.date ? parseISO(b.date).getTime() : 0) +
                (b.startHour || 0) * 3600000;
            return aTime - bTime;
        });
    }, [selectedProject]);

    const openAddDialog = () => {
        setDialogState({
            task: null,
            category: selectedProject?.category.id,
            date: format(new Date(), "yyyy-MM-dd"),
        });
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
            const date = formValues.date || dialogState?.date;
            addTask(date, { ...formValues, category: dialogState?.category });
        }
        closeDialog();
    };

    const handleDialogDelete = (taskId) => {
        deleteTask(taskId);
        closeDialog();
    };

    const handleQuickDelete = (taskId) => {
        if (pendingDeleteId !== taskId) {
            setPendingDeleteId(taskId);
            return;
        }
        deleteTask(taskId);
        setPendingDeleteId(null);
    };

    return (
        <section id="projects" className="min-h-screen bg-[#000000]">
            <HiveBackground hexRadius={60} viewWidth={900} viewHeight={600} />
            <div className="container mx-auto px-4 pb-8 md:px-6">
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <FolderKanban className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <h3 className="font-semibold text-card-foreground">
                                    Project Planner
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {projects.length} projects
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
                        {/* Project cards */}
                        <div className="max-h-[75vh] overflow-y-auto border-r border-border/50 p-3">
                            <div className="space-y-2">
                                {projects.map(({ category, tasks, completed, progress }) => {
                                    const isSelected = category.id === selectedProject?.category.id;
                                    return (
                                        <button
                                            type="button"
                                            key={category.id}
                                            onClick={() => setSelectedProjectId(category.id)}
                                            className={cn(
                                                "w-full rounded-lg border border-border/60 p-3 text-left transition-colors hover:bg-secondary/40",
                                                isSelected && "border-primary/50 bg-primary/10",
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        "h-2.5 w-2.5 flex-shrink-0 rounded-full",
                                                        category?.solidBgColor || "",
                                                    )}
                                                />
                                                <span className="truncate text-sm font-medium text-card-foreground">
                                                    {category.label}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                                <span>
                                                    {completed}/{tasks.length} done
                                                </span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full",
                                                        category?.solidBgColor || "",
                                                    )}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Selected project detail */}
                        <div className="flex flex-col">
                            {selectedProject ? (
                                <>
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={cn(
                                                    "h-3 w-3 flex-shrink-0 rounded-full",
                                                    selectedProject.category?.solidBgColor || "",
                                                )}
                                            />
                                            <div>
                                                <h4 className="font-medium text-card-foreground">
                                                    {selectedProject.category.label}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedProject.completed}/
                                                    {selectedProject.tasks.length} tasks complete •{" "}
                                                    {selectedProject.progress}%
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" onClick={openAddDialog}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add task
                                        </Button>
                                    </div>

                                    <div className="max-h-[65vh] overflow-y-auto sm:max-h-[70vh]">
                                        {sortedProjectTasks.length === 0 && (
                                            <div className="p-6 text-center text-sm text-muted-foreground">
                                                No tasks under this project yet.
                                            </div>
                                        )}

                                        {sortedProjectTasks.map((task) => {
                                            const [startHour, endHour] = getTaskHourRange(task);
                                            const isArmedForDelete = pendingDeleteId === task.id;
                                            const done = isTaskDone(task);

                                            return (
                                                <div
                                                    key={task.id}
                                                    className="group flex items-center gap-3 border-b border-border/50 px-4 py-2.5 last:border-0 hover:bg-secondary/30"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className={cn(
                                                                "truncate text-sm font-medium text-card-foreground",
                                                                done && "text-muted-foreground line-through",
                                                            )}
                                                        >
                                                            {task.name}
                                                        </p>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {task.date &&
                                                                `${format(parseISO(task.date), "MMM d, yyyy")} • `}
                                                            {formatHour(startHour)} – {formatHour(endHour)}
                                                            {task.priority && ` • ${task.priority} priority`}
                                                        </p>
                                                    </div>

                                                    {task.status && (
                                                        <span className="hidden flex-shrink-0 rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-xs capitalize text-muted-foreground sm:inline-block">
                                                            {task.status}
                                                        </span>
                                                    )}

                                                    <div className="flex flex-shrink-0 items-center gap-1 opacity-100 transition-opacity xl:opacity-0 xl:group-hover:opacity-100">
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
                                </>
                            ) : (
                                <div className="p-6 text-center text-sm text-muted-foreground">
                                    No projects available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <TaskFormDialog
                open={Boolean(dialogState)}
                task={dialogState?.task ?? null}
                defaultHour={dialogState?.hour}
                defaultCategory={dialogState?.category}
                defaultDate={dialogState?.date}
                existingTasks={selectedProject?.tasks ?? []}
                onClose={closeDialog}
                onSubmit={handleDialogSubmit}
                onDelete={handleDialogDelete}
            />
        </section>
    );
}

export default ProjectPlanner;