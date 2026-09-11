// Sandbox data for non-admin accounts (the demo user and anyone who signs up).
//
// These accounts never touch the Google Apps Script API. They start from
// data/demo-tasks.json, and any changes they make are kept in sessionStorage,
// so they survive a refresh but are discarded on logout or when the tab closes.
import { addDays, format } from "date-fns";
import demoTasks from "../data/demo-tasks.json";
import { DEFAULT_REMINDER_MINUTES } from "./sheet-mapper";

const DEMO_STORAGE_KEY = "taskplanner:demo-tasks";

// Dates in the JSON are relative ("dayOffset" from today) so the demo always
// shows tasks around the current week.
function buildDemoTasks() {
  const today = new Date();
  return demoTasks.map(({ dayOffset = 0, ...task }, index) => ({
    id: `demo-${index + 1}`,
    ticketType: "task",
    userName: "demo@ashtro.dev",
    userType: "demo",
    logTime: today.toISOString(),
    notes: task.description || "",
    ...task,
    date: format(addDays(today, dayOffset), "yyyy-MM-dd"),
    calendarSync: false,
    reminderMinutes: DEFAULT_REMINDER_MINUTES,
  }));
}

export function loadDemoTasks() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(DEMO_STORAGE_KEY) || "null");
    if (Array.isArray(stored)) return stored;
  } catch {}
  return buildDemoTasks();
}

export function saveDemoTasks(tasks) {
  try {
    sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(tasks));
  } catch {}
}

export function clearDemoTasks() {
  try {
    sessionStorage.removeItem(DEMO_STORAGE_KEY);
  } catch {}
}
