/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          500: '#22C55E',
          600: '#16A34A', // Primary green
          700: '#15803D',
          800: '#166534', // Dark green
          900: '#14532D',
        },
        hazard: {
          red: '#DC2626',
          amber: '#F59E0B',
        }
      }
    },
  },
  plugins: [],
}
