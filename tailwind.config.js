/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f1117",
        panel: "#161922",
        panel2: "#1d2230",
        border: "#262b3a",
        accent: "#6c63ff",
        accent2: "#8b80ff",
        ink: "#e6e8ee",
        muted: "#8a90a3",
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(108,99,255,0.35), 0 8px 28px -10px rgba(108,99,255,0.5)",
      },
    },
  },
  plugins: [],
};
