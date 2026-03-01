/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme palette
        pageBg: '#FAFAFA',
        cardBg: '#FFFFFF',
        darkCard: '#121212',
        darkCardAlt: '#1C1C1C',
        border: '#E5E7EB',
        borderDark: '#D1D5DB',
        primary: '#2563EB',       // Vibrant blue CTA
        primaryHover: '#1D4ED8',
        primaryLight: '#EFF6FF',  // Light blue tint
        textPrimary: '#1A1A1A',
        textSecondary: '#6B7280',
        textMuted: '#9CA3AF',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        emerald: '#059669',
        orange: '#EA580C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.04)',
        'cardHover': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'float': '0 12px 40px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
