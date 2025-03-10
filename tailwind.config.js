import path from "path";

const screens = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1240,
  "2xl": 1440,
};

Object.entries(screens).forEach(([key, value]) => {
  screens[key] = `${value}px`;
});

/** @type {import('tailwindcss').Config} */
export default {
  content: [path.resolve(__dirname, "**/*.{js,vue,liquid,scss}")],
  theme: {
    fontFamily: {
      primary: ["var(--font-family-primary)", "sans-serif"],
      secondary: ["var(--font-family-secondary)", "monospace"],
    },
    fontSize: {
      lg: "var(--font-size-lg)",
      base: "var(--font-size)",
      sm: "var(--font-size-sm)",
      xs: "var(--font-size-xs)",
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      "primary-100": "var(--color-primary-100)",
      "primary-200": "var(--color-primary-200)",
      "primary-300": "var(--color-primary-300)",
      "primary-400": "var(--color-primary-400)",
      "primary-500": "var(--color-primary-500)",
      "primary-600": "var(--color-primary-600)",
      "primary-700": "var(--color-primary-700)",
      "primary-800": "var(--color-primary-800)",
      "primary-900": "var(--color-primary-900)",

      "secondary-100": "var(--color-secondary-100)",
      "secondary-200": "var(--color-secondary-200)",
      "secondary-300": "var(--color-secondary-300)",
      "secondary-400": "var(--color-secondary-400)",
      "secondary-500": "var(--color-secondary-500)",
      "secondary-600": "var(--color-secondary-600)",
      "secondary-700": "var(--color-secondary-700)",
      "secondary-800": "var(--color-secondary-800)",
      "secondary-900": "var(--color-secondary-900)",

      "tertiary-100": "var(--color-tertiary-100)",
      "tertiary-200": "var(--color-tertiary-200)",
      "tertiary-300": "var(--color-tertiary-300)",
      "tertiary-400": "var(--color-tertiary-400)",
      "tertiary-500": "var(--color-tertiary-500)",
      "tertiary-600": "var(--color-tertiary-600)",
      "tertiary-700": "var(--color-tertiary-700)",
      "tertiary-800": "var(--color-tertiary-800)",
      "tertiary-900": "var(--color-tertiary-900)",

      "grey-100": "var(--color-grey-100)",
      "grey-200": "var(--color-grey-200)",
      "grey-300": "var(--color-grey-300)",
      "grey-400": "var(--color-grey-400)",
      "grey-500": "var(--color-grey-500)",
      "grey-600": "var(--color-grey-600)",
      "grey-700": "var(--color-grey-700)",
      "grey-800": "var(--color-grey-800)",
      "grey-900": "var(--color-grey-900)",

      "bg-primary": "var(--bg-primary)",
      "bg-inverse-primary": "var(--bg-inverse-primary)",
      "bg-inverse-secondary": "var(--bg-inverse-secondary)",

      "text-primary": "var(--text-primary)",
      "text-secondary": "var(--text-secondary)",
      "text-inverse-primary": "var(--text-inverse-primary)",
      "text-inverse-secondary": "var(--text-inverse-secondary)",
      "text-highlight": "var(--color-util-red)",

      "stroke-primary": "var(--stroke-primary)",
      "stroke-secondary": "var(--stroke-secondary)",
      "stroke-secondary-darker": "var(--stroke-secondary-darker)",
      "stroke-inverse-primary": "var(--stroke-inverse-primary)",
      "stroke-inverse-secondary": "var(--stroke-inverse-secondary)",

      "surfaces-glass": "var(--surfaces-glass)",
      "surfaces-dark": "var(--surfaces-dark)",
      "surfaces-dark-hover": "var(--surfaces-dark-hover)",
      "surfaces-light": "var(--surfaces-light)",
      "surfaces-light-hover": "var(--surfaces-light-hover)",

      red: "var(--color-util-red)",
      green: "var(--color-util-green)",
      yellow: "var(--color-util-yellow)",
      grey: "var(--grey)",
      white: "var(--white)",
      "real-white": "var(--real-white)",
      "white-75": "var(--white-75)",
      "white-50": "var(--white-50)",
      "white-25": "var(--white-25)",
      "white-33": "var(--white-33)",
      black: "var(--black)",
      "black-75": "var(--black-75)",
      "black-50": "var(--black-50)",
      "black-25": "var(--black-25)",
    },
    extend: {
      animation: {
        skeleton: "skeleton 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      aspectRatio: {
        landscape: "1 / 0.625",
        portrait: "0.85 / 1",
        square: "1 / 1",
      },
      fontSize: {
        sizeInherit: "inherit",
      },
      keyframes: {
        skeleton: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "32px",
        xl: "64px",
      },
    },
    screens,
  },
  plugins: [],
  safelist: [
    "aspect-square",
    "aspect-video",
    "aspect-portrait",
    "h-full",
    "w-full",
    "object-cover",
    "object-center",
    "absolute",
    "order-1",
    "order-2",
    "mb-1",
    "text-sizeInherit",
  ],
}

