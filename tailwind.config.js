/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#F4F6F4',
          100: '#E5E9E5',
          200: '#CBD4CC',
          300: '#A3B4A5',
          400: '#7D9380',
          500: '#5E7561',
          600: '#485C4B',
          700: '#3C4C3F',
          800: '#323E34',
          900: '#2B342D',
          950: '#171D18',
        },
        ivory: {
          50: '#FDFBF7',
          100: '#FAF7F0',
          200: '#F2ECDC',
          300: '#E5DBBF',
          400: '#D2C099',
          500: '#BEAA78',
          600: '#AF9764',
          700: '#927C51',
          800: '#776443',
          900: '#625339',
          950: '#352D1D',
        }
      },
      fontFamily: {
        script: ['Allura', 'Alex Brush', 'cursive'],
        serif: ['Cormorant Garamond', 'Cinzel', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
