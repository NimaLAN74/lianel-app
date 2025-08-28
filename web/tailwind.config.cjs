/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2563eb",
          blueLight: "#3b82f6",
          blueDark: "#1d4ed8",
          green: "#16a34a",
          greenLight: "#22c55e",
          greenDark: "#15803d"
        }
      }
    }
  },
  plugins: []
};