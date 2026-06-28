import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        scheduled: "#eab308",
        progress: "#3b82f6",
        completed: "#22c55e",
        cancelled: "#ef4444",
      },
    },
  },
  plugins: [],
};
export default config;
