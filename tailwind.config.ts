import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        canvas: "#eceff3",
        ink: "#0f172a",
        muted: "#7b8696",
        line: "#e6eaef",
        // status palette, matches the Carwaj design system
        scheduled: { text: "#b45309", bg: "#fff4e5", dot: "#f59e0b" },
        progress: { text: "#1d4ed8", bg: "#e8f0fe", dot: "#2563eb" },
        completed: { text: "#15803d", bg: "#e7f7ee", dot: "#16a34a" },
        cancelled: { text: "#b91c1c", bg: "#fdecec", dot: "#ef4444" },
      },
      borderRadius: {
        card: "20px",
        control: "13px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
export default config;
