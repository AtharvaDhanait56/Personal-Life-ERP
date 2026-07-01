/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        panel: "var(--color-panel)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        teal: "#2dd4bf",
        coral: "#fb7185",
        amber: "#fbbf24",
        violet: "#a78bfa"
      },
      boxShadow: {
        glass: "0 18px 70px rgba(0,0,0,0.32)"
      }
    }
  },
  plugins: []
};
