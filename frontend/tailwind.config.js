/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bohriumBg: '#0F1115',
        bohriumCard: '#1C1F26',
        bohriumBorder: '#2D323B',
        bohriumPrimary: '#4DA6FF', // Bright blue accent
        bohriumText: '#E2E8F0',
        bohriumMuted: '#94A3B8',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
