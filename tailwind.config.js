/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Islamic Serenity Color Palette
        primary: {
          DEFAULT: '#1B4D3E', // Koyu zümrüt yeşili
          light: '#2D7A5E', // Orta yeşil
          dark: '#0F2E25', // Çok koyu yeşil
        },
        secondary: {
          DEFAULT: '#C9A227', // Altın sarısı
          light: '#E8C547',
        },
        accent: {
          teal: '#0D9488', // Turkuaz
          emerald: '#059669', // Zümrüt
          gold: '#D4AF37', // Altın
        },
        background: '#F8F6F0', // Krem arka plan
        surface: '#FFFFFF',
        muted: '#6B7280',
      },
      fontFamily: {
        arabic: ['Amiri', 'serif'],
        heading: ['Crimson Pro', 'serif'],
        body: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
