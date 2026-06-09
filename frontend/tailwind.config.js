/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gym: {
          900: '#060608',
          800: '#0c0c12',
          700: '#14141c',
          600: '#1c1c28',
          500: '#28283a',
          400: '#e94560',
          300: '#f5a623',
          200: '#4ecca3',
          100: '#f1f5f9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(233, 69, 96, 0.15)',
        'glow-lg': '0 0 40px rgba(233, 69, 96, 0.2)',
        'card': '0 2px 8px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #e94560, #f5a623)',
        'gradient-success': 'linear-gradient(135deg, #4ecca3, #38bdf8)',
      }
    },
  },
  plugins: [],
}
