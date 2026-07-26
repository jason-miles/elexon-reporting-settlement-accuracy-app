/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#FF3621",
        "accent-foreground": "#F9F7F4",
        primary: "#FF3621",
        destructive: "#98102A",
      },
    },
  },
  plugins: [],
};
