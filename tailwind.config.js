/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        'trophy-spin': {
          '0%, 100%': { transform: 'rotate(-10deg) scale(1)' },
          '50%': { transform: 'rotate(10deg) scale(1.5)' },
        },
      },
      animation: {
        'trophy': 'trophy-spin 2s ease-in-out infinite',
      },
    },
  },

  plugins: [],
};
