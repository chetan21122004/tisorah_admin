import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#323433", // Brand primary dark gray
          foreground: "#F4F4F4", // Brand primary light gray
          50: "#f8f8f8",
          100: "#f0f0f0",
          200: "#e4e4e4",
          300: "#d1d1d1",
          400: "#b4b4b4",
          500: "#9a9a9a",
          600: "#818181",
          700: "#6a6a6a",
          800: "#5a5a5a",
          900: "#323433",
        },
        secondary: {
          DEFAULT: "#AD9660", // Brand gold
          foreground: "#323433",
          50: "#faf9f7",
          100: "#f4f1eb",
          200: "#e8e1d4",
          300: "#d9ccb5",
          400: "#c7b394",
          500: "#b89d78",
          600: "#AD9660",
          700: "#8f7a4f",
          800: "#756344",
          900: "#5f523a",
        },
        accent: {
          DEFAULT: "#1E2A47", // Brand navy
          foreground: "#F4F4F4",
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5dae3",
          300: "#b1bbca",
          400: "#8795ac",
          500: "#677691",
          600: "#526078",
          700: "#434e62",
          800: "#3a4252",
          900: "#1E2A47",
        },
        neutral: {
          DEFAULT: "#E6E2DD", // Brand beige
          foreground: "#323433",
          50: "#faf9f8",
          100: "#f2f0ed",
          200: "#E6E2DD",
          300: "#d4cfc7",
          400: "#C8C2B6", // Brand taupe
          500: "#AB8E76", // Brand brown
          600: "#9a7d68",
          700: "#826856",
          800: "#6b5649",
          900: "#56463c",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
        serif: ["Frank Ruhl Libre", "serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
