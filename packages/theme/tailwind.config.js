/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'rgba(244, 162, 97, 1)', // Updated primary color
        'primary-light': 'rgba(244, 162, 97, 0.8)',
        'primary-dark': 'rgba(244, 162, 97, 0.9)',
        'dark-bg': '#1a1a1a',
        'dark-surface': '#2d2d2d',
        'dark-text': '#e5e5e5',
      },
    },
  },
  plugins: [],
};


   