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
        // primary: {
        //   400: "rgb(var(--color-primary-400) / <alpha-value>)",
        //   500: "rgb(var(--color-primary-500) / <alpha-value>)",
        //   600: "rgb(var(--color-primary-600) / <alpha-value>)",
        //   700: "rgb(var(--color-primary-700) / <alpha-value>)",
        // },
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
