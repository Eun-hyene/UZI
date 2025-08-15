/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3B82F6',
          700: '#1E40AF',
        },
        accent: {
          500: '#F59E0B',
        },
        success: {
          500: '#10B981',
        },
        warning: {
          500: '#F59E0B',
        },
        error: {
          500: '#EF4444',
        },
        text: {
          800: '#1E293B',
        },
        background: {
          50: '#F8FAFC',
        }
      },
      fontFamily: {
        'sans': ['Pretendard', 'Noto Sans KR', 'sans-serif'],
        'display': ['Pretendard', 'sans-serif'],
      }
    },
  },
  plugins: [],
} 