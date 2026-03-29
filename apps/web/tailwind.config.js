/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0D0D0D",
        surface: {
          card: "#1A1A1A",
          elevated: "#242424",
        },
        accent: {
          DEFAULT: "#C9A84C",
          foreground: "#0D0D0D",
        },
        text: {
          primary: "#F5F0E8",
          secondary: "#8A8480",
        },
        success: "#2D6A4F",
        error: "#8B2635",
        border: "#2A2A2A",
        // shadcn/ui semantic aliases
        foreground: "#F5F0E8",
        card: {
          DEFAULT: "#1A1A1A",
          foreground: "#F5F0E8",
        },
        popover: {
          DEFAULT: "#1A1A1A",
          foreground: "#F5F0E8",
        },
        primary: {
          DEFAULT: "#C9A84C",
          foreground: "#0D0D0D",
        },
        secondary: {
          DEFAULT: "#242424",
          foreground: "#F5F0E8",
        },
        muted: {
          DEFAULT: "#1A1A1A",
          foreground: "#8A8480",
        },
        destructive: {
          DEFAULT: "#8B2635",
          foreground: "#F5F0E8",
        },
        input: "#2A2A2A",
        ring: "#C9A84C",
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        sans: ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        input: "8px",
        btn: "6px",
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pulse-gold": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
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
        "fade-in": "fade-in 200ms ease-out",
        "slide-up": "slide-up 300ms ease-out",
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
