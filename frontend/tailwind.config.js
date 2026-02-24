/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                base: "#0B0F14",
                surface: "#121821",
                elevated: "#1A2230",
                emerald: "#00C896",
                teal: "#00A3A3",
                cyan: "#00D1FF",
                crimson: "#FF3B3B",
                electric: "#2F80FF",
                silver: "#C9D1D9",
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                glowEmerald: "0 0 20px rgba(0,200,150,0.4)",
                glowCyan: "0 0 25px rgba(0,209,255,0.4)",
                glowCrimson: "0 0 25px rgba(255,59,59,0.4)",
                glowElectric: "0 0 20px rgba(47,128,255,0.3)",
                glass: "0 8px 32px rgba(0,0,0,0.4)",
                card: "0 4px 24px rgba(0,0,0,0.3)",
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                'glow': 'glowAnim 2s ease-in-out infinite alternate',
                'float': 'float 6s ease-in-out infinite',
                'spin-slow': 'spin 20s linear infinite',
            },
            keyframes: {
                glowAnim: {
                    '0%': { boxShadow: '0 0 5px rgba(0,200,150,0.2)' },
                    '100%': { boxShadow: '0 0 25px rgba(0,200,150,0.6)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
}
