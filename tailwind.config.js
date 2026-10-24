/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "surface": "#111418",
        "surface-container": "#1d2024",
        "primary-fixed": "#d6e3ff",
        "on-primary-fixed": "#001b3e",
        "secondary-fixed": "#d7e2ff",
        "on-secondary-fixed": "#0c006a",
        "tertiary-fixed": "#fbd7ff",
        "on-tertiary-fixed": "#2d003a",
        "primary-accent": "#ADC6FF",
        "secondary-accent": "#BCC5FF",
        school: {
          primary: 'var(--school-primary)',
          secondary: 'var(--school-secondary)',
        }
      },
      borderColor: {
        school: 'var(--school-border-color)',
      },
      borderRadius: {
        school: 'var(--school-radius)',
      },
      borderWidth: {
        school: 'var(--school-border-weight)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        "progress-indeterminate": {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-quick": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
      },
      animation: {
        "progress-indeterminate": "progress-indeterminate 1.5s infinite linear",
        "pulse-quick": "pulse-quick 0.5s ease-in-out 4",
      },
    },
  },
  plugins: [],
};
