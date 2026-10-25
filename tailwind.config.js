/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/renderer/**/*.{ts,tsx,html}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Dark, charcoal/black base — independently chosen, not sampled from
        // any third-party asset.
        surface: {
          0: "#09090b",
          1: "#111113",
          2: "#18181b",
          3: "#222226",
          border: "#2a2a30",
        },
        accent: {
          DEFAULT: "#f59e0b", // amber — distinct "gaming" accent for this product
          dim: "#b45309",
          soft: "#fde68a",
        },
        state: {
          success: "#22c55e",
          warning: "#f59e0b",
          danger: "#ef4444",
          info: "#38bdf8",
        },
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
      borderRadius: {
        xl2: "0.875rem",
      },
    },
  },
  plugins: [],
};
