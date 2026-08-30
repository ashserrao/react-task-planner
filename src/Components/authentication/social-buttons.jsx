import React from "react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function GitlabIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#E24329" d="m12 21.42 3.68-11.33H8.32L12 21.42Z" />
      <path fill="#FC6D26" d="M12 21.42 8.32 10.09H3.16L12 21.42Z" />
      <path
        fill="#FCA326"
        d="M3.16 10.09 2.04 13.5a.76.76 0 0 0 .28.85L12 21.42 3.16 10.09Z"
      />
      <path
        fill="#E24329"
        d="M3.16 10.09h5.16L6.1 3.26a.38.38 0 0 0-.72 0L3.16 10.09Z"
      />
      <path fill="#FC6D26" d="M12 21.42 15.68 10.09h5.16L12 21.42Z" />
      <path
        fill="#FCA326"
        d="M20.84 10.09 21.96 13.5a.76.76 0 0 1-.28.85L12 21.42l8.84-11.33Z"
      />
      <path
        fill="#E24329"
        d="M20.84 10.09h-5.16l2.22-6.83a.38.38 0 0 1 .72 0l2.22 6.83Z"
      />
    </svg>
  );
}

function WindowsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#F25022" d="M3 3h8.5v8.5H3V3Z" />
      <path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5V3Z" />
      <path fill="#00A4EF" d="M3 12.5h8.5V21H3v-8.5Z" />
      <path fill="#FFB900" d="M12.5 12.5H21V21h-8.5v-8.5Z" />
    </svg>
  );
}

const providers = [
  { name: "Google", icon: <GoogleIcon /> },
  { name: "GitLab", icon: <GitlabIcon /> },
  { name: "Windows", icon: <WindowsIcon /> },
];

export function SocialButtons({ action }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {providers.map((p) => (
        <button
          key={p.name}
          type="button"
          aria-label={`${action} with ${p.name}`}
          className="group flex items-center justify-center gap-2 rounded-lg border border-input bg-secondary/40 px-3 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-glow/50 hover:bg-secondary/70 hover:shadow-[0_8px_24px_-12px_rgba(107,143,163,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {p.icon}
          <span className="hidden sm:inline">{p.name}</span>
        </button>
      ))}
    </div>
  );
}
