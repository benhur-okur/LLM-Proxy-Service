/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#6366F1",   // indigo-500
        secondary: "#8B5CF6", // violet-500
        accent: "#10B981",    // emerald-500
        danger: "#EF4444",    // red-500
        muted: "#9CA3AF",     // gray-400
        bgLight: "#F3F4F6",   // light background
      },
      boxShadow: {
        card: "0 8px 26px rgba(0,0,0,0.08)",
        navbar: "0 2px 10px rgba(0,0,0,0.06)",
        glow: "0 0 16px rgba(99,102,241,0.45)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-100% 0" },
          "100%": { backgroundPosition: "100% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    // Tailwind v3 ile uyumlu sürüm: 3.x
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
};