/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- เพิ่มบรรทัดนี้ลงไป
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        prompt: ['Prompt', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}