// tailwind.config.ts
/** @type {import('tailwindcss').Config} */
const palette = {
  sp_eggshell: "#dad7cd",
  sp_lightgreen: "#a3b18a",
  sp_green: "#3a5a40",
  sp_midgreen: "#588157",
  sp_darkgreen: "#344e41",
};

module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        ...palette,

        // Light mode defaults
        background: palette.sp_eggshell,
        foreground: palette.sp_darkgreen,

        // Dark mode
        sp_dark_bg: palette.sp_darkgreen,
        sp_dark_surface: palette.sp_eggshell,
        sp_dark_text: palette.sp_darkgreen,
        sp_dark_muted: palette.sp_midgreen,

        card: {
          DEFAULT: "#ffffff",
          foreground: palette.sp_darkgreen,
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: palette.sp_darkgreen,
        },
        primary: {
          DEFAULT: palette.sp_green,
          foreground: palette.sp_eggshell,
        },
        secondary: {
          DEFAULT: palette.sp_lightgreen,
          foreground: palette.sp_darkgreen,
        },
        muted: {
          DEFAULT: palette.sp_lightgreen,
          foreground: palette.sp_midgreen,
        },
        accent: {
          DEFAULT: palette.sp_midgreen,
          foreground: palette.sp_eggshell,
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: palette.sp_lightgreen,
        input: palette.sp_lightgreen,
        ring: palette.sp_green,

        chart: {
          1: palette.sp_green,
          2: palette.sp_midgreen,
          3: palette.sp_lightgreen,
          4: palette.sp_darkgreen,
          5: palette.sp_eggshell,
        },
      },

      fontFamily: {
        sans: ["Quicksand", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
