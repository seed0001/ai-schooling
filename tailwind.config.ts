import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "ui-rounded",
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          50: "#eef1ff",
          100: "#e0e5ff",
          200: "#c6cfff",
          300: "#a3b0ff",
          400: "#7d87fb",
          500: "#5f5df3",
          600: "#4a3fe0",
          700: "#3d31bd",
          800: "#332c98",
          900: "#2d2a79",
        },
        // Per-track accent hues.
        teaching: "#0ea5e9",
        coaching: "#10b981",
        selfdirected: "#8b5cf6",
        course: "#f59e0b",
      },
      backgroundImage: {
        "dot-grid":
          "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.18) 1px, transparent 0)",
        "brand-sheen":
          "linear-gradient(135deg, #5f5df3 0%, #8b5cf6 45%, #0ea5e9 100%)",
      },
      backgroundSize: {
        dots: "22px 22px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        float: "float 9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
