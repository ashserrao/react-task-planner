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

  useEffect(() => {
    fetchTasks()
      .then((remoteTasks) => {
        if (Array.isArray(remoteTasks)) setTasks(remoteTasks);
      })
      .catch((error) => {
        console.warn("Timeline sheet unavailable, using cached tasks:", error);
      });
  }, []);

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
        .sort((a, b) => a.startHour - b.startHour),
    [tasks],
  );

  const addTask = useCallback((dateString, taskData) => {
    const tempId = crypto.randomUUID();
    const task = {
      id: tempId,
      date: dateString,
      status: "pending",
      duration: 1,
      ...taskData,
    };
    setTasks((prev) => [...prev, task]);
    createTaskRequest(task)
      .then((created) => {
        const realId = created?.rowNumber ?? created?.id;
        if (realId) {
          setTasks((prev) =>
            prev.map((t) => (t.id === tempId ? { ...t, id: realId } : t)),
          );
        }
      })
      .catch((error) =>
        console.warn("Failed to sync new task to sheet:", error),
      );
    return task;
  }, []);

  const updateTask = useCallback((taskId, updates) => {
    setTasks((prev) => {
      const next = prev.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task,
      );
      const merged = next.find((task) => task.id === taskId);
      if (merged) {
        updateTaskRequest(taskId, merged).catch((error) =>
          console.warn("Failed to sync task update to sheet:", error),
        );
      }
      return next;
    });
  }, []);

  const deleteTask = useCallback((taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    deleteTaskRequest(taskId).catch((error) =>
      console.warn("Failed to sync task delete to sheet:", error),
    );
  }, []);

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
    }),
    [selectedDate, getTasksForDate, getAllTasks, addTask, updateTask, deleteTask, moveTask],
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
