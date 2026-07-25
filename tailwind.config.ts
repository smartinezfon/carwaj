import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      // Values live in src/app/globals.css as --carwaj-* custom properties,
      // mirroring the Figma variables. The -rgb channel form is used so
      // opacity modifiers (bg-canvas/50) still work.
      colors: {
        canvas: "rgb(var(--carwaj-bg-canvas-rgb) / <alpha-value>)",
        ink: "rgb(var(--carwaj-text-primary-rgb) / <alpha-value>)",
        muted: "rgb(var(--carwaj-text-muted-rgb) / <alpha-value>)",
        line: "rgb(var(--carwaj-border-default-rgb) / <alpha-value>)",
        // status palette, matches the Carwaj design system
        scheduled: {
          text: "rgb(var(--carwaj-status-scheduled-text-rgb) / <alpha-value>)",
          bg: "rgb(var(--carwaj-status-scheduled-bg-rgb) / <alpha-value>)",
          dot: "rgb(var(--carwaj-status-scheduled-dot-rgb) / <alpha-value>)",
        },
        progress: {
          text: "rgb(var(--carwaj-status-progress-text-rgb) / <alpha-value>)",
          bg: "rgb(var(--carwaj-status-progress-bg-rgb) / <alpha-value>)",
          dot: "rgb(var(--carwaj-status-progress-dot-rgb) / <alpha-value>)",
        },
        completed: {
          text: "rgb(var(--carwaj-status-completed-text-rgb) / <alpha-value>)",
          bg: "rgb(var(--carwaj-status-completed-bg-rgb) / <alpha-value>)",
          dot: "rgb(var(--carwaj-status-completed-dot-rgb) / <alpha-value>)",
        },
        cancelled: {
          text: "rgb(var(--carwaj-status-cancelled-text-rgb) / <alpha-value>)",
          bg: "rgb(var(--carwaj-status-cancelled-bg-rgb) / <alpha-value>)",
          dot: "rgb(var(--carwaj-status-cancelled-dot-rgb) / <alpha-value>)",
        },
      },
      borderRadius: {
        card: "var(--carwaj-radius-card)",
        control: "var(--carwaj-radius-control)",
        pill: "var(--carwaj-radius-full)",
      },
    },
  },
  plugins: [],
};
export default config;
