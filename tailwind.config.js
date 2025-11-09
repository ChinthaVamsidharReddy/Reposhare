/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          600: '#475569',
        },
        // Improved dark theme colors for better readability
        dark: {
          bg: '#1a1a1a',        // Main background (lighter dark gray)
          surface: '#2d2d2d',   // Cards and surfaces (medium dark gray)
          card: '#333333',      // Card backgrounds (lighter than surface)
          hover: '#404040',     // Hover states (light gray)
          input: '#3a3a3a',     // Input fields (medium gray)
          border: '#4a4a4a',    // Borders (visible gray)
          text: '#ffffff',      // Primary text (pure white)
          textSecondary: '#b3b3b3', // Secondary text (light gray)
          textMuted: '#888888', // Muted text (medium gray)
          accent: '#10b981',    // Green accent (emerald)
          accentHover: '#059669', // Accent hover state
        }
      }
    },
  },
  plugins: [],
}
