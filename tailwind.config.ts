import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB", deep: "#1E3A8A", light: "#EFF6FF", sky: "#38BDF8",
        mint: "#F0FDFA", bg: "#F8FAFC", ink: "#1E293B", muted: "#64748B",
      },
      fontFamily: { sans: ["var(--font-inter)", "var(--font-cairo)", "sans-serif"] },
      boxShadow: { soft: "0 8px 30px rgba(37,99,235,0.08)" },
      keyframes: { fadein: { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "none" } } },
      animation: { fadein: "fadein .4s ease both" },
    },
  },
  plugins: [],
} satisfies Config;
