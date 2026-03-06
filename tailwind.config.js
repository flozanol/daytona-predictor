/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                premium: {
                    blue: "#0A192F",
                    gold: "#D4AF37",
                    goldLight: "#F9E2AF",
                }
            },
        },
    },
    plugins: [],
};
