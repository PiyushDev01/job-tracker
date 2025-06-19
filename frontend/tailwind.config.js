/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6fcf5',
          100: '#c3fae8',
          200: '#96f2d7',
          300: '#63e6be',
          400: '#38d9a9',
          500: '#20c997',
          600: '#12b886',
          700: '#0ca678',
          800: '#099268',
          900: '#087f5b',
        },
        secondary: {
          50: '#fff8f1',
          100: '#feecdc',
          200: '#fcd9bd',
          300: '#fdba8c',
          400: '#ff8a4c',
          500: '#ff5a1f',
          600: '#d03801',
          700: '#b43403',
          800: '#8a2c0d',
          900: '#771d1d',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #087f5b 0%, #20c997 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #b43403 0%, #ff5a1f 100%)',
        'gradient-accent': 'linear-gradient(135deg, #099268 0%, #38d9a9 100%)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-in-out',
        'pulse': 'pulse 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      }
    },
  },
  plugins: [],
};