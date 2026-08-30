import React from "react";
import { Sparkles } from "lucide-react";

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden border-r border-border bg-card lg:flex lg:flex-col lg:justify-between lg:p-8">
      {/* Animated ambient glow — company banner backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-aurora absolute -left-24 -top-24 size-72 rounded-full bg-glow/25 blur-3xl" />
        <div
          className="animate-aurora absolute -bottom-28 -right-16 size-80 rounded-full bg-accent/15 blur-3xl"
          style={{ animationDelay: "-6s" }}
        />
        <div
          className="animate-aurora absolute left-1/3 top-1/2 size-64 rounded-full bg-primary/25 blur-3xl"
          style={{ animationDelay: "-3s" }}
        />
      </div>

      {/* Top: logo lockup — swap for your company banner/logo */}
      <div className="animate-fade-up flex items-center gap-3">
        <span className="animate-glow-pulse flex size-11 items-center justify-center rounded-xl border border-glow/40 bg-badge">
          <Sparkles className="size-5 text-badge-foreground" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            Ashtro Dev
          </span>
          <span className="text-xs text-accent">Aim Driven Tech</span>
        </div>
      </div>

      {/* Middle: banner headline */}
      <div
        className="animate-fade-up max-w-md"
        style={{ animationDelay: "0.1s" }}
      >
        <span className="inline-flex items-center rounded-full border border-glow/30 bg-badge px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-badge-foreground">
          Build your idea
        </span>
        <h2 className="mt-5 text-balance font-display text-3xl font-bold leading-tight text-foreground">
          Turning your vision into reality.
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          One secure sign-in for every Ashtro Dev tool.
        </p>
      </div>

      {/* Bottom: trust line */}
      <div
        className="animate-fade-up flex items-center gap-4 text-sm text-muted-foreground"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex -space-x-2">
          {["#4fd1c5", "#6b8fa3", "#7a2938"].map((c) => (
            <span
              key={c}
              className="size-8 rounded-full border-2 border-card"
              style={{ backgroundColor: c }}
              aria-hidden="true"
            />
          ))}
        </div>
        <span>Trusted by developers worldwide</span>
      </div>
    </aside>
  );
}

export default BrandPanel;
