/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface hierarchy - light mode only
        surface: "#f8f9fa",
        "surface-container-low": "#ffffff",
        "surface-container": "#f5f5f5",
        "surface-container-high": "#eeeeee",
        "surface-container-highest": "#e8e8e8",
        "surface-bright": "#ffffff",
        "surface-tint": "#8dedec",

        // Primary colors (Teal)
        primary: "#8dedec",
        "primary-container": "#4dafaf",
        "on-primary": "#ffffff",
        "on-primary-container": "#ffffff",

        // Secondary colors (Amber)
        secondary: "#ffbf00",
        "secondary-container": "#795900",
        "on-secondary": "#000000",
        "on-secondary-container": "#ffffff",

        // Tertiary (Additional teal variant)
        tertiary: "#83fff6",
        "tertiary-container": "#04dcff",
        "on-tertiary": "#000000",
        "on-tertiary-container": "#ffffff",

        // Semantic colors
        error: "#ff6b6b",
        "error-container": "#9f0519",
        "on-error": "#ffffff",
        "on-error-container": "#ffffff",

        // Text colors - light mode
        "on-surface": "#1a1a1a",
        "on-surface-variant": "#666666",
        "outline-variant": "#e0e0e0",

        // Background colors
        background: "#f8f9fa",
        "on-background": "#1a1a1a",
      },
      fontFamily: {
        headline: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Manrope', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'headline-lg': ['2rem', { lineHeight: '1.2' }],
        'body-lg': ['1rem', { lineHeight: '1.5' }],
        'label-md': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
      },
      borderRadius: {
        'DEFAULT': '1rem',
        'lg': '2rem',
        'xl': '3rem',
        'full': '9999px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      backdropBlur: {
        'xl': '24px',
      },
      boxShadow: {
        'editorial': '0 24px 48px -12px rgba(0, 0, 0, 0.4)',
        'ambient': '0 0 40px rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8dedec 0%, #4dafaf 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #ffbf00 0%, #795900 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}