/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#1f2937',
        accent: '#f59e0b',
        calm: '#10b981',
        alert: '#ef4444',
        neutral: '#6b7280',
        background: 'var(--bg-main)',
        foreground: 'var(--text-main)',
        surface: 'var(--bg-card)',
        borderglass: 'var(--border-main)',
        glass: 'var(--bg-glass)',
        muted: 'var(--text-muted)',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
