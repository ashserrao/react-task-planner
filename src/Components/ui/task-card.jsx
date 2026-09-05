"use client";

import React, { useState } from "react";
import {
  Clock,
  GripVertical,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Play,
  Check,
  Circle,
} from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import { cn } from "../../lib/utils";
import { getCategoryById, getPriorityConfig, formatHour } from "../../lib/types";
import { useTimeTracking } from "../../lib/time-tracking-context";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function TaskCard({ task, onEdit, isDraggable = true }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { updateTask, deleteTask } = useTimeTracking();
  const category = getCategoryById(task.category);
  const priority = getPriorityConfig(task.priority);


  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleStatusChange = (newStatus) => {
    updateTask(task.id, { status: newStatus });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "task-card group relative rounded-xl border border-border bg-card p-4 transition-all",
        isDragging && "opacity-50 shadow-2xl",
        task.status === "completed" && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        {isDraggable && (
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab opacity-100 transition-opacity touch-none xl:opacity-0 xl:group-hover:opacity-100"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
        )}

        {/* Status Indicator */}
        <button
          onClick={() => {
            const nextStatus =
              task.status === "pending"
                ? "ongoing"
                : task.status === "ongoing"
                  ? "completed"
                  : "pending";
            handleStatusChange(nextStatus);
          }}
          className={cn(
            "mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
            task.status === "completed"
              ? "border-emerald-500 bg-emerald-500 text-white"
              : task.status === "ongoing"
                ? "border-amber-500 bg-amber-500/20"
                : "border-muted-foreground/50 hover:border-primary",
          )}
        >
          {task.status === "completed" && <Check className="h-3 w-3" />}
          {task.status === "ongoing" && (
            <Play className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4
                className={cn(
                  "font-medium text-card-foreground truncate",
                  task.status === "completed" && "line-through",
                )}
              >
                {task.name}
              </h4>
              {task.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                  {task.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-100 transition-opacity xl:opacity-0 xl:group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusChange("pending")}>
                  <Circle className="mr-2 h-4 w-4" />
                  Mark as Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("ongoing")}>
                  <Play className="mr-2 h-4 w-4" />
                  Mark as Ongoing
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("completed")}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Mark as Completed
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => deleteTask(task.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Meta Info */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {task.ticketId !== undefined && task.ticketId !== null && (
              <Badge
                variant="outline"
                className="text-xs font-mono text-muted-foreground border-border/60"
              >
                #{task.ticketId}
              </Badge>
            )}
            <Badge
              variant="secondary"
              className={cn("text-xs", category?.bgColor, category?.color)}
            >
              {category?.name || "Other"}
            </Badge>
            <Badge
              variant="secondary"
              className={cn("text-xs", priority?.bgColor, priority?.color)}
            >
              {priority?.label || "Medium"}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {formatHour(task.startHour)} -{" "}
                {formatHour(task.startHour + task.duration)}
              </span>
            </div>
          </div>


          {/* Expandable Notes */}
          {task.notes && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="mr-1 h-3 w-3" />
                      Hide notes
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-1 h-3 w-3" />
                      Show notes
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  {task.notes}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>

      {/* Category color indicator */}
      <div
        className={cn(
          "absolute left-0 top-4 bottom-4 w-1 rounded-full",
          category?.solidBgColor || "",
        )}
      />
    </div>
  );
}

export function MiniTaskCard({ task, onClick }) {
  const category = getCategoryById(task.category);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border border-border bg-card/50 p-2 transition-colors hover:bg-card",
        task.status === "completed" && "opacity-60",
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            category?.solidBgColor || "",
          )}
        />
        <span
          className={cn(
            "text-sm font-medium truncate flex-1",
            task.status === "completed" && "line-through",
          )}
        >
          {task.name}
        </span>
      </div>
    </button>
  );
}
