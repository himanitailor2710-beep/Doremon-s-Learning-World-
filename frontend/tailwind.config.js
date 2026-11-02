/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dora: {
          blue: '#0288D1',
          'blue-light': '#E0F2FE',
          'blue-dark': '#01579B',
          red: '#E53935',
          'red-light': '#FFEBEE',
          yellow: '#FFD600',
          'yellow-light': '#FFFDE7',
          pocket: '#F8FAFC',
        }
      }
    },
  },
  plugins: [],
}
