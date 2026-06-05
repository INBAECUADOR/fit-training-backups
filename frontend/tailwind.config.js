/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gym: {
          900: '#0a0a0a',
          800: '#131313',
          700: '#1a1a2e',
          600: '#16213e',
          500: '#0f3460',
          400: '#e94560',
          300: '#f5a623',
          200: '#4ecca3',
          100: '#ffffff',
        }
      }
    },
  },
  plugins: [],
}
