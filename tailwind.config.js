/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'star-blue': '#1769E8',
        'star-navy': '#12213F',
        'star-soft': '#EAF3FF',
        'star-bg': '#F7FAFF',
        'star-green': '#16B978',
        'star-amber': '#F5A623',
        'star-red': '#E94B5F',
        'star-purple': '#7657E8',
        'star-slate': '#53657A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'star-card': '0px 4px 20px rgba(18, 33, 63, 0.05)',
        'star-hover': '0px 8px 30px rgba(23, 105, 232, 0.12)',
      }
    },
  },
  plugins: [],
}
