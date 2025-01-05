// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'timberwolf': '#dad7cd',
        'sage': '#a3b18a',
        'fern-green': '#588157',
        'hunter-green': '#3a5a40',
        'brunswick-green': '#344e41'
      },
      fontFamily: {
        sans: ['Quicksand', 'sans-serif'],
      }
    },
  },
  plugins: [],
}