/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          950: "#020617",
          900: "#0b1220",
          800: "#111b2e",
          700: "#15253f",
        },
        neon: {
          cyan: "#22d3ee",
          green: "#22c55e",
          blue: "#38bdf8",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34, 211, 238, 0.25), 0 20px 40px -24px rgba(56, 189, 248, 0.55)",
      },
      keyframes: {
        pulseGrid: {
          "0%, 100%": { opacity: "0.28" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        pulseGrid: "pulseGrid 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
