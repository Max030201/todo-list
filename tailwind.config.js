 /** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
        xxs: "420px",
        xxxs: "370px",
      },
    },
  },
  plugins: [],
  safelist: [
    "bg-red-500",
    "bg-green-500",
    "bg-yellow-400",
    "bg-gray-200",
    "bg-gray-500",
  ],
};