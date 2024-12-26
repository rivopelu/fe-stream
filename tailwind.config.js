/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#1b769f',
          dark: '#0e5473',
          light: '#2692c2'
        }
      }
    }
  },
  plugins: []
}
