import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        red: { //alpha-value : 투명도 값
          700: "rgb(var(--color-red-700) / <alpha-value>)",
          600: "rgb(var(--color-red-600) / <alpha-value>)",
          500: "rgb(var(--color-red-500) / <alpha-value>)",
          400: "rgb(var(--color-red-400) / <alpha-value>)",
          200: "rgb(var(--color-red-200) / <alpha-value>)",
          100: "rgb(var(--color-red-100) / <alpha-value>)",
        },
        green: {
          700: "rgb(var(--color-green-700) / <alpha-value>)",
          600: "rgb(var(--color-green-600) / <alpha-value>)",
          500: "rgb(var(--color-green-500) / <alpha-value>)",
          400: "rgb(var(--color-green-400) / <alpha-value>)",
          300: "rgb(var(--color-green-300) / <alpha-value>)",
          200: "rgb(var(--color-green-200) / <alpha-value>)",
          100: "rgb(var(--color-green-100) / <alpha-value>)",
        },
        neutral: {
          900: "rgb(var(--color-neutral-900) / <alpha-value>)",
          800: "rgb(var(--color-neutral-800) / <alpha-value>)",
          700: "rgb(var(--color-neutral-700) / <alpha-value>)",
          600: "rgb(var(--color-neutral-600) / <alpha-value>)",
          500: "rgb(var(--color-neutral-500) / <alpha-value>)",
          400: "rgb(var(--color-neutral-400) / <alpha-value>)",
          300: "rgb(var(--color-neutral-300) / <alpha-value>)",
          200: "rgb(var(--color-neutral-200) / <alpha-value>)",
          100: "rgb(var(--color-neutral-100) / <alpha-value>)",
          50: "rgb(var(--color-neutral-50) / <alpha-value>)",
        },
        brand: {
          neutral: "rgb(var(--color-neutral) / <alpha-value>)",
          primary: "rgb(var(--color-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
