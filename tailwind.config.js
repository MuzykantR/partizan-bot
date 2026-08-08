/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        partizan: {
          bg: '#121212',
          card: '#1E1E20',
          border: '#3A3A3D',
          red: '#C8372D',
          redHover: '#A52B23',
          cream: '#F4F0EA',
          muted: '#9E9B97',
          mint: '#2A9D8F',
          amber: '#E07A5F',
        },
        tg: {
          bg: 'var(--tg-theme-bg-color, #121212)',
          text: 'var(--tg-theme-text-color, #F4F0EA)',
          hint: 'var(--tg-theme-hint-color, #9E9B97)',
          link: 'var(--tg-theme-link-color, #C8372D)',
          button: 'var(--tg-theme-button-color, #C8372D)',
          buttonText: 'var(--tg-theme-button-text-color, #F4F0EA)',
          secondaryBg: 'var(--tg-theme-secondary-bg-color, #1E1E20)',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-red': 'pulse-red 2.5s infinite ease-in-out',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9', boxShadow: '0 0 25px rgba(200, 55, 45, 0.4)' },
          '50%': { transform: 'scale(1.03)', opacity: '1', boxShadow: '0 0 45px rgba(200, 55, 45, 0.7)' },
        }
      }
    },
  },
  plugins: [],
}
