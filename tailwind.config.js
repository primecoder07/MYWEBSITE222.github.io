/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: '#FDFBF7',
        foreground: '#1C1917',
        card: '#FFFFFF',
        'card-foreground': '#1C1917',
        primary: '#4F46E5',
        'primary-foreground': '#FFFFFF',
        secondary: '#F97316',
        'secondary-foreground': '#FFFFFF',
        accent: '#14B8A6',
        'accent-foreground': '#FFFFFF',
        muted: '#F3F4F6',
        'muted-foreground': '#6B7280',
        border: '#E5E7EB',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
