import React from "react";
import "./App.css";
import Portfolio from "./portfolio";
import { AuthProvider } from "./Components/authentication/AuthContext";
import { TimeTrackingProvider } from "./lib/time-tracking-context";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <TimeTrackingProvider>
          <Portfolio />
        </TimeTrackingProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
