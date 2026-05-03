/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
      colors: {
        // Cohere Brand & Accent
        "cohere-black": "#000000",
        "cohere-primary": "#17171c",
        "cohere-green": "#003c33",
        "cohere-navy": "#071829",
        "cohere-blue": "#1863dc",
        "cohere-coral": "#ff7759",
        "cohere-coral-soft": "#ffad9b",
        
        // Cohere Surface & Background
        "cohere-white": "#ffffff",
        "cohere-stone": "#eeece7",
        "cohere-green-wash": "#edfce9",
        "cohere-blue-wash": "#f1f5ff",
        
        // Cohere Text & Rules
        "cohere-ink": "#212121",
        "cohere-slate": "#93939f",
        "cohere-slate-muted": "#75758a",
        "cohere-hairline": "#d9d9dd",
        "cohere-border": "#e5e7eb",
        
        // Semantic
        "cohere-focus": "#4c6ee6",
        "cohere-error": "#b30000",
        
        // Legacy fallback
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
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
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "22px",
        xl: "30px",
        pill: "32px",
        full: "9999px",
      },
      spacing: {
        2: "2px",
        6: "6px",
        10: "10px",
        22: "22px",
        56: "56px",
        60: "60px",
        64: "64px",
        80: "80px",
      },
      fontSize: {
        "hero-display": ["96px", { lineHeight: "1.00", letterSpacing: "-1.92px" }],
        "product-display": ["72px", { lineHeight: "1.00", letterSpacing: "-1.44px" }],
        "section-display": ["60px", { lineHeight: "1.00", letterSpacing: "-1.2px" }],
        "section-heading": ["48px", { lineHeight: "1.20", letterSpacing: "-0.48px" }],
        "card-heading": ["32px", { lineHeight: "1.20", letterSpacing: "-0.32px" }],
        "feature-heading": ["24px", { lineHeight: "1.30" }],
        "body-large": ["18px", { lineHeight: "1.40" }],
        body: ["16px", { lineHeight: "1.50" }],
        "button-label": ["14px", { lineHeight: "1.71", fontWeight: "500" }],
        caption: ["14px", { lineHeight: "1.40" }],
        "mono-label": ["14px", { lineHeight: "1.40", letterSpacing: "0.28px" }],
        micro: ["12px", { lineHeight: "1.40" }],
      },
      fontFamily: {
        display: ["CohereText", "Space Grotesk", "Inter", "ui-sans-serif", "system-ui"],
        body: ["Unica77", "Inter", "Arial", "ui-sans-serif", "system-ui"],
        mono: ["CohereMono", "Arial", "ui-sans-serif", "system-ui"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        indeterminate: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        indeterminate: "indeterminate 1.2s ease-in-out infinite",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};





