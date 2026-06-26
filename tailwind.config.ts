import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      colors: {
        ink: {
          950: "#0a0b0e",
          900: "#0f1115",
          800: "#161a21",
          700: "#1f2530",
          600: "#2b3240",
        },
      },
    },
  },
  plugins: [],
};

export default config;
