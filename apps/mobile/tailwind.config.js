const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#fafafa",
        primary: "#7c2bca",
        "primary-light": "#9c69ed",
        "primary-glow": "#ceb3f6",
        muted: "#27272a",
        "muted-foreground": "#a1a1aa",
        border: "#3f3f46",
        card: "#0f0c14",
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  plugins: [],
};
