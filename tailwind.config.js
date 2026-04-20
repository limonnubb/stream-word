/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#06060d',
        'bg-secondary': '#0c0c18',
        'bg-card': '#121222',
        'bg-elevated': '#1a1a30',
        'border': '#1e1e3a',
        'border-light': '#2a2a50',
        'text-primary': '#eeeef5',
        'text-secondary': '#9090b0',
        'text-muted': '#50506a',
        'accent-purple': '#b44aff',
        'accent-blue': '#00d4ff',
        'accent-pink': '#ff3366',
        'accent-green': '#00ff88',
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        ui: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}