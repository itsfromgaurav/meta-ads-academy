/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05050A',
        surface: '#0B0B12',
        indigo: { DEFAULT: '#6366F1', soft: '#818CF8', deep: '#4F46E5' },
        muted: '#9CA3AF',
        faint: '#6B7280',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Geist Sans"', 'Geist', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '2px' },
      boxShadow: {
        lift: '0 22px 60px -20px rgba(0,0,0,0.7), 0 6px 18px -8px rgba(99,102,241,0.25)',
      },
      keyframes: {
        breathe: { '0%,100%': { opacity: '0.35' }, '50%': { opacity: '0.7' } },
        floatup: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        breathe: 'breathe 6s ease-in-out infinite',
        floatup: 'floatup 0.3s cubic-bezier(0.4,0,0.2,1)',
      },
    },
  },
  plugins: [],
}
