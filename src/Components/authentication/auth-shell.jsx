import React from "react";
import BrandPanel from "./brand-panel";
import HiveBackground from "../HiveBackground";

function AuthShell({ children }) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background p-4 sm:p-6">
      <HiveBackground hexRadius={40} viewWidth={1200} viewHeight={800} />

      {/* subtle page-wide glow so the view isn't flat */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-aurora absolute -right-24 top-1/4 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div
          className="animate-aurora absolute -left-24 bottom-0 size-80 rounded-full bg-glow/10 blur-3xl"
          style={{ animationDelay: "-5s" }}
        />
      </div>

      {/* Single unified card — banner + form live together, sized to its content */}
      <div className="animate-fade-up grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-black/40 lg:grid-cols-2">
        <BrandPanel />
        <section className="flex items-center justify-center px-5 py-8 sm:px-8">
          {children}
        </section>
      </div>
    </main>
  );
}

export default AuthShell;
