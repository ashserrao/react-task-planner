import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchTasks,
  createTaskRequest,
  updateTaskRequest,
  deleteTaskRequest,
} from "./api";
import { useNotifications } from "../Components/ui/notification-service";

const STORAGE_KEY = "taskplanner:tasks";

const TimeTrackingContext = createContext(null);

function loadCachedTasks() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function TimeTrackingProvider({ children }) {
  const [tasks, setTasks] = useState(loadCachedTasks);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const { notify } = useNotifications();

  const refreshTasks = useCallback(async () => {
    try {
      const remoteTasks = await fetchTasks();
      if (Array.isArray(remoteTasks)) {
        const validTasks = remoteTasks.filter(Boolean);
        setTasks(validTasks);
        notify(
          "success",
          `Loaded ${validTasks.length} task${validTasks.length === 1 ? "" : "s"} from the timeline.`,
        );
        return validTasks;
      }
    } catch (error) {
      console.warn("Timeline sheet unavailable, using cached tasks:", error);
      notify(
        "failure",
        error.message || "The timeline API could not be reached.",
      );
    }
  }, [notify]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  useEffect(() => {
    // Cache locally so the timeline still works while the sheet API is incomplete/unreachable.
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  const getTasksForDate = useCallback(
    (dateString) =>
      tasks
        .filter((task) => task.date === dateString)
        .sort((a, b) => (a.startHour || 0) - (b.startHour || 0)),
    [tasks],
  );

  const addTask = useCallback(
    (dateString, taskData) => {
      const tempId = crypto.randomUUID();
      const task = {
        id: tempId,
        date: dateString,
        status: "pending",
        duration: 1,
        ticketType: "task",
        userName: "ashserrao@ashtro.dev",
        userType: "admin",
        logTime: new Date().toISOString(),
        ...taskData,
      };
      setTasks((prev) => [...prev, task]);
      createTaskRequest(task)
        .then((created) => {
          const realId =
            created?.["ticket id"] ??
            created?.ticketId ??
            created?.rowNumber ??
            created?.id;
          const rowNumber = created?.rowNumber;
          const ticketId =
            created?.["ticket id"] ?? created?.ticketId ?? realId;
          if (realId !== undefined && realId !== null) {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === tempId
                  ? {
                      ...t,
                      id: realId,
                      ticketId: ticketId ?? t.ticketId,
                      rowNumber: rowNumber ?? t.rowNumber,
                    }
                  : t,
              ),
            );
          }
          notify("success", "Task created successfully.");
        })
        .catch((error) => {
          console.warn("Failed to sync new task to sheet:", error);
          notify(
            "failure",
            error.message || "The task could not be created in the timeline.",
          );
        });
      return task;
    },
    [notify],
  );

  const updateTask = useCallback(
    (taskId, updates) => {
      setTasks((prev) => {
        const next = prev.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task,
        );
        const merged = next.find((task) => task.id === taskId);
        if (merged) {
          updateTaskRequest(taskId, merged)
            .then(() => notify("success", "Task updated successfully."))
            .catch((error) => {
              console.warn("Failed to sync task update to sheet:", error);
              notify(
                "failure",
                error.message ||
                  "The task could not be updated in the timeline.",
              );
            });
        }
        return next;
      });
    },
    [notify],
  );

  const deleteTask = useCallback(
    (taskId) => {
      const taskToDelete = tasks.find((task) => task.id === taskId);
      setTasks((prev) => {
        return prev.filter((task) => task.id !== taskId);
      });
      deleteTaskRequest(taskId, taskToDelete || {})
        .then(() => notify("success", "Task deleted successfully."))
        .catch((error) => {
          console.warn("Failed to sync task delete to sheet:", error);
          notify(
            "failure",
            error.message || "The task could not be deleted from the timeline.",
          );
        });
    },
    [tasks, notify],
  );

  const moveTask = useCallback(
    (taskId, newHour) => updateTask(taskId, { startHour: newHour }),
    [updateTask],
  );

  const getAllTasks = useCallback(() => tasks, [tasks]);

  const value = useMemo(
    () => ({
      selectedDate,
      setSelectedDate,
      getTasksForDate,
      getAllTasks,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      refreshTasks,
    }),
    [
      selectedDate,
      getTasksForDate,
      getAllTasks,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      refreshTasks,
    ],
  );

  return (
    <TimeTrackingContext.Provider value={value}>
      {children}
    </TimeTrackingContext.Provider>
  );
}

export function useTimeTracking() {
  const context = useContext(TimeTrackingContext);
  if (!context) {
    throw new Error(
      "useTimeTracking must be used within a TimeTrackingProvider",
    );
  }
  return context;
}
