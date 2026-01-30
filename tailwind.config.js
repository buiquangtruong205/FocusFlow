/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0F0F13', // A deep, premium dark background
                surface: '#1E1E24',
                primary: '#6366F1', // Indigo
                secondary: '#EC4899', // Pink
                accent: '#8B5CF6', // Violet
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // You might want to import this font in index.html or style.css
            }
        },
    },
    plugins: [],
}
