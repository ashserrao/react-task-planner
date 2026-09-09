// Connects the notification service (lib/notify.js) to the app:
//  - mounts the <Toaster /> that shows pop-ups on every page
//  - switches the notification centre to the signed-in user's saved inbox
//  - exposes `useNotifications()` for the bell and the inbox page
//
// To raise a notification from anywhere, import `notify` from lib/notify.
import React, { useLayoutEffect, useMemo } from "react";
import { useAuth } from "../authentication/AuthContext";
import { Toaster } from "./toaster";
import {
  addNotification,
  clearNotifications,
  markAllNotificationsRead,
  notify,
  removeNotification,
  restoreNotifications,
  setInboxScope,
  setNotificationPrefs,
  setNotificationRead,
  useNotificationStore,
} from "../../lib/notify";

const MINUTE = 60 * 1000;

// What a brand-new account finds in its inbox.
function welcomeNotifications() {
  const now = Date.now();
  return [
    {
      type: "info",
      title: "Welcome to Ashtro Planner",
      description:
        "Plan your day in the Time Planner and track progress in Project Track.",
      href: "/time-planner",
      createdAt: now - 2 * MINUTE,
    },
  ];
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const scope = user?.email ?? user?.username ?? null;

  // Layout effect so the bell never flashes the previous user's inbox.
  useLayoutEffect(() => {
    setInboxScope(scope, scope ? welcomeNotifications() : []);
  }, [scope]);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}

export function useNotifications() {
  const { inbox, prefs } = useNotificationStore();
  const unreadCount = useMemo(
    () => inbox.filter((n) => !n.read).length,
    [inbox],
  );

  return {
    notifications: inbox,
    unreadCount,
    prefs,
    notify,
    addNotification,
    markRead: (id) => setNotificationRead(id, true),
    markUnread: (id) => setNotificationRead(id, false),
    markAllRead: markAllNotificationsRead,
    remove: removeNotification,
    clearAll: clearNotifications,
    restore: restoreNotifications,
    setPrefs: setNotificationPrefs,
  };
}
