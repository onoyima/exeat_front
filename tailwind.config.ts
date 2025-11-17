import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
        'montserrat': ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.875rem', { lineHeight: '1.25rem' }],        // 14px
        'sm': ['1rem', { lineHeight: '1.5rem' }],             // 16px
        'base': ['1.125rem', { lineHeight: '1.625rem' }],     // 18px
        'lg': ['1.25rem', { lineHeight: '1.75rem' }],         // 20px
        'xl': ['1.375rem', { lineHeight: '1.875rem' }],       // 22px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],            // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],       // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],         // 36px
        '5xl': ['3rem', { lineHeight: '1.2' }],               // 48px
        '6xl': ['3.75rem', { lineHeight: '1.2' }],            // 60px
      },
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        university: {
          light: "#F5F7F6",
          DEFAULT: "#114629",
          primary: "var(--primary)",
          secondary: "var(--secondary)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderColor: {
        DEFAULT: "var(--border)",
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
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        blob: "blob 7s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;