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
import { notify } from "./notify";
import { clearDemoTasks, loadDemoTasks, saveDemoTasks } from "./demo-data";
import { useAuth } from "../Components/authentication/AuthContext";

const STORAGE_KEY = "taskplanner:tasks";
const NO_TASKS = [];

const TimeTrackingContext = createContext(null);

function loadCachedTasks() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// "admin" → Google Sheet API, "demo" → sandbox (lib/demo-data.js), "none" → signed out.
function loadTasksFor(mode) {
  if (mode === "admin") return loadCachedTasks();
  if (mode === "demo") return loadDemoTasks();
  return [];
}

export function TimeTrackingProvider({ children }) {
  const { user, isAdmin } = useAuth();
  const mode = !user ? "none" : isAdmin ? "admin" : "demo";

  // Tasks are tagged with the mode they were loaded for, so a late API
  // response or a stale render can never leak one account's data into another.
  const [store, setStore] = useState(() => ({
    mode,
    tasks: loadTasksFor(mode),
  }));
  const tasks = store.mode === mode ? store.tasks : NO_TASKS;
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const setTasksFor = useCallback((forMode, updater) => {
    setStore((prev) =>
      prev.mode !== forMode
        ? prev
        : {
            mode: prev.mode,
            tasks: typeof updater === "function" ? updater(prev.tasks) : updater,
          },
    );
  }, []);

  // The sheet save can succeed while the Google Calendar sync fails.
  const notifyCalendarError = useCallback(
    (response) => {
      if (response?.calendarError) {
        notify.error(
          `Google Calendar sync failed: ${response.calendarError}`,
          { save: true },
        );
      }
    },
    [],
  );

  const refreshTasks = useCallback(async () => {
    if (mode !== "admin") return tasks;
    try {
      const remoteTasks = await fetchTasks();
      if (Array.isArray(remoteTasks)) {
        const validTasks = remoteTasks.filter(Boolean);
        setTasksFor("admin", validTasks);
        notify.success(
          `Loaded ${validTasks.length} task${validTasks.length === 1 ? "" : "s"} from the timeline.`,
        );
        return validTasks;
      }
    } catch (error) {
      console.warn("Timeline sheet unavailable, using cached tasks:", error);
      notify.error(
        error.message || "The timeline API could not be reached.",
        { save: true },
      );
    }
  }, [mode, tasks, setTasksFor]);

  // Load the right data whenever the account changes.
  useEffect(() => {
    setStore((prev) =>
      prev.mode === mode ? prev : { mode, tasks: loadTasksFor(mode) },
    );
    if (mode === "none") {
      // Signed out: discard the demo sandbox and the cached sheet data.
      clearDemoTasks();
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
    if (mode === "demo") {
      notify.info("You're using demo data", {
        description:
          "Changes stay in this tab and are discarded when you sign out.",
      });
    }
    // refreshTasks is left out on purpose: it changes with every task edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (mode === "admin") refreshTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (store.mode === "admin") {
      // Cache locally so the timeline still works while the sheet API is incomplete/unreachable.
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store.tasks));
      } catch {}
    } else if (store.mode === "demo") {
      saveDemoTasks(store.tasks);
    }
  }, [store]);

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

      if (mode !== "admin") {
        const demoTask = {
          ...task,
          userName: user?.email || "demo@ashtro.dev",
          userType: "demo",
          calendarSync: false,
        };
        setTasksFor(mode, (prev) => [...prev, demoTask]);
        notify.success("Task created successfully.");
        return demoTask;
      }

      setTasksFor("admin", (prev) => [...prev, task]);
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
            setTasksFor("admin", (prev) =>
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
          notify.success("Task created successfully.");
          notifyCalendarError(created);
        })
        .catch((error) => {
          console.warn("Failed to sync new task to sheet:", error);
          notify.error(
            error.message || "The task could not be created in the timeline.",
            { save: true },
          );
        });
      return task;
    },
    [mode, user, setTasksFor, notifyCalendarError],
  );

  const updateTask = useCallback(
    (taskId, updates) => {
      if (mode !== "admin") {
        setTasksFor(mode, (prev) =>
          prev.map((task) =>
            task.id === taskId
              ? { ...task, ...updates, calendarSync: false }
              : task,
          ),
        );
        notify.success("Task updated successfully.");
        return;
      }

      setTasksFor("admin", (prev) => {
        const next = prev.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task,
        );
        const merged = next.find((task) => task.id === taskId);
        if (merged) {
          updateTaskRequest(taskId, merged)
            .then((updated) => {
              notify.success("Task updated successfully.");
              notifyCalendarError(updated);
            })
            .catch((error) => {
              console.warn("Failed to sync task update to sheet:", error);
              notify.error(
                error.message || "The task could not be updated in the timeline.",
                { save: true },
              );
            });
        }
        return next;
      });
    },
    [mode, setTasksFor, notifyCalendarError],
  );

  const deleteTask = useCallback(
    (taskId) => {
      const taskToDelete = tasks.find((task) => task.id === taskId);
      setTasksFor(mode, (prev) => prev.filter((task) => task.id !== taskId));

      if (mode !== "admin") {
        notify.success("Task deleted successfully.");
        return;
      }

      deleteTaskRequest(taskId, taskToDelete || {})
        .then(() => notify.success("Task deleted successfully."))
        .catch((error) => {
          console.warn("Failed to sync task delete to sheet:", error);
          notify.error(
            error.message || "The task could not be deleted from the timeline.",
            { save: true },
          );
        });
    },
    [mode, tasks, setTasksFor],
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
