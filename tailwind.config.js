module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        badge: {
          DEFAULT: "rgb(var(--badge) / <alpha-value>)",
          foreground: "rgb(var(--badge-foreground) / <alpha-value>)",
        },
        glow: "rgb(var(--glow) / <alpha-value>)",
        destructive: "rgb(var(--destructive) / <alpha-value>)",
      },
      keyframes: {
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.6" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        aurora: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(3%, -4%) scale(1.08)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgb(var(--glow) / 0.35)" },
          "50%": { boxShadow: "0 0 0 6px rgb(var(--glow) / 0)" },
        },
      },
      animation: {
        ripple: "ripple 0.6s ease-out",
        "fade-up": "fadeUp 0.6s ease-out both",
        aurora: "aurora 12s ease-in-out infinite",
        "glow-pulse": "glowPulse 2.4s ease-in-out infinite",
      },
    },
    screens: {
      sm: "350px",
      // => @media (min-width: 640px) { ... }

      md: "640px",
      // => @media (min-width: 768px) { ... }

      lg: "768px",
      // => @media (min-width: 1024px) { ... }

      xl: "1024px",
      // => @media (min-width: 1280px) { ... }

      "2xl": "1280px",
      // => @media (min-width: 1536px) { ... }
    },
  },
  plugins: [],
};
