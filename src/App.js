import React from "react";
import "./App.css";
import Portfolio from "./portfolio";
import { AuthProvider } from "./Components/authentication/AuthContext";
import { TimeTrackingProvider } from "./lib/time-tracking-context";
import { NotificationProvider } from "./Components/ui/notification-service";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <NotificationProvider>
          <TimeTrackingProvider>
            <Portfolio />
          </TimeTrackingProvider>
        </NotificationProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
