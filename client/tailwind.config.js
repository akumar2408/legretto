/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ligrettoRed: "#ff3c38",
        ligrettoBlue: "#2d7fe4",
        ligrettoGreen: "#00c48c",
        ligrettoYellow: "#ffbf1f",
        table: "#0b1021",
        card: "#0f172a",
      },
      fontFamily: {
        display: ['"Bungee"', "sans-serif"],
        body: ['"Nunito"', "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 18px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
