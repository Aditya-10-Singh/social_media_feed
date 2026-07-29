/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pulse: {
          pink: '#FF2A85',
          'pink-hover': '#E01E70',
          purple: '#8A2BE2',
          'purple-dark': '#1E1035',
          'bg-dark': '#0B0716',
          'card-dark': '#140D26',
          'border-dark': '#291A47',
          cyan: '#00F5D4',
          violet: '#C084FC',
          text: '#F3F0F8',
          muted: '#9CA3AF'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'pink-glow': '0 0 25px -5px rgba(255, 42, 133, 0.4)',
        'purple-glow': '0 0 25px -5px rgba(138, 43, 226, 0.4)',
        'cyan-glow': '0 0 20px -5px rgba(0, 245, 212, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
