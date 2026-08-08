/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tg: {
          bg: 'var(--tg-theme-bg-color, #0f172a)',
          text: 'var(--tg-theme-text-color, #f8fafc)',
          hint: 'var(--tg-theme-hint-color, #94a3b8)',
          link: 'var(--tg-theme-link-color, #38bdf8)',
          button: 'var(--tg-theme-button-color, #3b82f6)',
          buttonText: 'var(--tg-theme-button-text-color, #ffffff)',
          secondaryBg: 'var(--tg-theme-secondary-bg-color, #1e293b)',
        },
        vpn: {
          active: '#10b981',
          inactive: '#64748b',
          accent: '#6366f1',
          glow: 'rgba(99, 102, 241, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.5s infinite ease-in-out',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9', boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)' },
          '50%': { transform: 'scale(1.03)', opacity: '1', boxShadow: '0 0 45px rgba(16, 185, 129, 0.7)' },
        }
      }
    },
  },
  plugins: [],
}
