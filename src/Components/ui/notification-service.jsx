import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import "./notification-service.css";

const NotificationContext = createContext(null);

const TEMPLATES = {
  success: {
    icon: CheckCircle2,
    title: "Success",
    className: "notification-success",
  },
  failure: {
    icon: XCircle,
    title: "Something went wrong",
    className: "notification-failure",
  },
  warning: {
    icon: AlertTriangle,
    title: "Warning",
    className: "notification-warning",
  },
  info: {
    icon: Info,
    title: "Information",
    className: "notification-info",
  },
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const dismiss = useCallback((id) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );
  }, []);

  const notify = useCallback((type, message, options = {}) => {
    const notification = {
      id: `${Date.now()}-${Math.random()}`,
      type: TEMPLATES[type] ? type : "info",
      message,
      duration: options.duration ?? 5000,
    };
    setNotifications((current) => [...current, notification]);
    return notification.id;
  }, []);

  useEffect(() => {
    const timers = notifications
      .filter((notification) => notification.duration > 0)
      .map((notification) =>
        window.setTimeout(
          () => dismiss(notification.id),
          notification.duration,
        ),
      );
    return () => timers.forEach(window.clearTimeout);
  }, [notifications, dismiss]);

  const value = {
    notify,
    dismiss,
    success: (message, options) => notify("success", message, options),
    failure: (message, options) => notify("failure", message, options),
    warning: (message, options) => notify("warning", message, options),
    info: (message, options) => notify("info", message, options),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div
        className="notification-region"
        role="region"
        aria-label="Notifications"
      >
        {notifications.map((notification) => {
          const template = TEMPLATES[notification.type];
          const Icon = template.icon;
          return (
            <div
              className={cn("notification", template.className)}
              key={notification.id}
              role={notification.type === "failure" ? "alert" : "status"}
            >
              <Icon className="notification-icon" aria-hidden="true" />
              <div className="notification-content">
                <strong>{template.title}</strong>
                <span>{notification.message}</span>
              </div>
              <button
                className="notification-dismiss"
                type="button"
                onClick={() => dismiss(notification.id)}
                aria-label="Dismiss notification"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
