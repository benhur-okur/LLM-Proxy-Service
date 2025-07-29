/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}", // React bileşenlerini tarar
    ],
    darkMode: 'class', // class tabanlı dark mode (tema geçişi için)
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        },
        colors: {
          primary: '#4F46E5',   // indigo-600
          secondary: '#6366F1', // indigo-500
          accent: '#10B981',    // emerald-500
          muted: '#9CA3AF',     // gray-400
          danger: '#EF4444',    // red-500
        },
        boxShadow: {
          card: '0 4px 12px rgba(0, 0, 0, 0.1)',
          navbar: '0 1px 2px rgba(0, 0, 0, 0.06)',
        },
        spacing: {
          72: '18rem',
          84: '21rem',
          96: '24rem',
        },
      },
    },
    plugins: [],
  };
  