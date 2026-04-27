import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211f",
        mist: "#f5f7f4",
        leaf: "#2f7d63",
        coral: "#d8644a",
        sun: "#e3aa38",
        sky: "#4f7fbf",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 33, 31, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
