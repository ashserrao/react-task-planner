// src/lib/notify.js
//
// App-wide notification service. It is a plain store (no React needed), so it
// can be called from components, contexts or API helpers alike:
//
//   notify.success("Profile saved");
//   notify.error("Couldn't save", { description: "Check your connection." });
//   notify.info("Role changed", { action: { label: "Undo", onClick: undo } });
//   notify.promise(saveUser(), {
//     loading: "Saving…",
//     success: "Saved",
//     error: (err) => err.message,
//   });
//
// Options (all optional):
//   description  second line of text
//   duration     ms before it closes; Infinity keeps it open
//   action       { label, onClick } — a button that also closes the toast
//   id           reuse an id to update a toast in place instead of stacking
//   save         true → also keep it in the notification centre (the bell)
//   href         page to open when the saved notification is clicked
//
// Pop-ups are rendered by <Toaster /> (Components/ui/toaster.jsx). The
// notification centre is per user and persisted in localStorage — see
// Components/ui/notification-service.jsx for how it follows the signed-in account.
import { useSyncExternalStore } from "react";

export const NOTIFICATION_TYPES = [
  "success",
  "error",
  "warning",
  "info",
  "loading",
];

const DEFAULT_DURATION = {
  success: 4000,
  info: 5000,
  warning: 6000,
  error: 8000,
  loading: Infinity,
};
const MAX_VISIBLE_TOASTS = 4;
const EXIT_ANIMATION_MS = 200;
const INBOX_LIMIT = 50;
const INBOX_KEY_PREFIX = "taskplanner.notifications.inbox.";
const PREFS_KEY = "taskplanner.notifications.prefs";
const DEFAULT_PREFS = { popups: true };

/* ---------- storage helpers ---------- */

function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable — changes last until the page is closed
  }
}

function createId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
}

/* ---------- store ---------- */

let toasts = [];
let inbox = [];
let inboxKey = null;
let prefs = { ...DEFAULT_PREFS, ...readJSON(PREFS_KEY, {}) };
let snapshot = { toasts, inbox, prefs };
const listeners = new Set();
const removalTimers = new Map();

function emit() {
  snapshot = { toasts, inbox, prefs };
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

/* ---------- toasts ---------- */

function show(type, title, options = {}) {
  const {
    id = createId(),
    description,
    duration = DEFAULT_DURATION[type] ?? DEFAULT_DURATION.info,
    action,
    save = false,
    href,
  } = options;

  if (save) {
    addNotification({ type, title, description, href });
  }

  const existing = toasts.find((t) => t.id === id);

  // With pop-ups turned off only errors interrupt; everything else is quiet.
  if (!prefs.popups && type !== "error") {
    if (existing) dismiss(id);
    return id;
  }

  const toast = {
    id,
    type,
    title,
    description,
    duration,
    action,
    open: true,
    // Bumped on every update so the auto-close timer restarts.
    version: (existing?.version ?? 0) + 1,
  };

  if (existing) {
    clearTimeout(removalTimers.get(id));
    removalTimers.delete(id);
    toasts = toasts.map((t) => (t.id === id ? toast : t));
  } else {
    toasts = [...toasts, toast];
    // Too many on screen → close the oldest ones.
    const open = toasts.filter((t) => t.open);
    open
      .slice(0, Math.max(0, open.length - MAX_VISIBLE_TOASTS))
      .forEach((t) => dismiss(t.id, { silent: true }));
  }

  emit();
  return id;
}

// Close one toast (or all of them when no id is given). It animates out
// first, then is removed.
function dismiss(id, { silent = false } = {}) {
  const targets = toasts.filter((t) => t.open && (id == null || t.id === id));
  if (targets.length === 0) return;

  const ids = new Set(targets.map((t) => t.id));
  toasts = toasts.map((t) => (ids.has(t.id) ? { ...t, open: false } : t));

  ids.forEach((targetId) => {
    clearTimeout(removalTimers.get(targetId));
    removalTimers.set(
      targetId,
      setTimeout(() => {
        removalTimers.delete(targetId);
        toasts = toasts.filter((t) => t.id !== targetId || t.open);
        emit();
      }, EXIT_ANIMATION_MS),
    );
  });

  if (!silent) emit();
}

function resolveMessage(message, value) {
  return typeof message === "function" ? message(value) : message;
}

// Shows a loading toast that turns into success or error when the promise
// settles. Returns the original promise so callers can still await it.
function promise(task, messages = {}, options = {}) {
  const id = show("loading", messages.loading ?? "Working…", options);
  const { save, href } = options;

  const pending = Promise.resolve(typeof task === "function" ? task() : task);
  pending.then(
    (value) => {
      show("success", resolveMessage(messages.success ?? "Done", value), {
        id,
        save,
        href,
      });
    },
    (error) => {
      show(
        "error",
        resolveMessage(
          messages.error ?? (error?.message || "Something went wrong"),
          error,
        ),
        { id, save, href },
      );
    },
  );

  return pending;
}

/* ---------- notification centre (inbox) ---------- */

function persistInbox() {
  if (inboxKey) writeJSON(inboxKey, inbox);
}

function setInbox(next) {
  inbox = next;
  persistInbox();
  emit();
}

// Point the inbox at a user's saved notifications. `seed` fills a brand-new
// inbox (e.g. a welcome message). Pass `null` when signing out.
export function setInboxScope(scope, seed = []) {
  const nextKey = scope ? `${INBOX_KEY_PREFIX}${scope}` : null;
  if (nextKey === inboxKey) return;

  inboxKey = nextKey;
  if (!inboxKey) {
    inbox = [];
  } else {
    const saved = readJSON(inboxKey, null);
    if (Array.isArray(saved)) {
      inbox = saved;
    } else {
      inbox = seed.map((item) => ({
        id: createId(),
        read: false,
        createdAt: Date.now(),
        ...item,
      }));
      persistInbox();
    }
  }
  emit();
}

export function addNotification({ type = "info", title, description, href }) {
  const item = {
    id: createId(),
    type: type === "loading" ? "info" : type,
    title: String(title),
    description: description == null ? undefined : String(description),
    href,
    read: false,
    createdAt: Date.now(),
  };
  setInbox([item, ...inbox].slice(0, INBOX_LIMIT));
  return item.id;
}

export function setNotificationRead(id, read = true) {
  setInbox(inbox.map((n) => (n.id === id ? { ...n, read } : n)));
}

export function markAllNotificationsRead() {
  if (inbox.every((n) => n.read)) return;
  setInbox(inbox.map((n) => (n.read ? n : { ...n, read: true })));
}

export function removeNotification(id) {
  setInbox(inbox.filter((n) => n.id !== id));
}

export function clearNotifications() {
  setInbox([]);
}

// Put back a list returned earlier (e.g. to undo "Clear all").
export function restoreNotifications(items) {
  setInbox(items);
}

/* ---------- preferences ---------- */

export function setNotificationPrefs(changes) {
  prefs = { ...prefs, ...changes };
  writeJSON(PREFS_KEY, prefs);
  if (!prefs.popups) {
    toasts.filter((t) => t.type !== "error").forEach((t) => dismiss(t.id));
  }
  emit();
}

// Keep other tabs in sync (read state, new notifications, preferences).
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (inboxKey && event.key === inboxKey) {
      inbox = readJSON(inboxKey, []);
      emit();
    } else if (event.key === PREFS_KEY) {
      prefs = { ...DEFAULT_PREFS, ...readJSON(PREFS_KEY, {}) };
      emit();
    }
  });
}

/* ---------- public API ---------- */

export const notify = Object.assign(
  (title, options) => show("info", title, options),
  {
    success: (title, options) => show("success", title, options),
    error: (title, options) => show("error", title, options),
    warning: (title, options) => show("warning", title, options),
    info: (title, options) => show("info", title, options),
    loading: (title, options) => show("loading", title, options),
    promise,
    dismiss: (id) => dismiss(id),
  },
);

export function useNotificationStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
