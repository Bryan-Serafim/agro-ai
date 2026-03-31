/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'forest-green': '#004445',
        'teal': '#004445',
        'teal-light': '#6B9C9D',
        'golden-yellow': '#F5F2ED',
        'beige': '#F5F2ED',
        'gray-light': '#F0F0F0',
        'gray-dark': '#1A1A1A',
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
