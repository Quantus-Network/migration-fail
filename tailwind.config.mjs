/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        void: "#0e0e0e",
        flare: "#ff6b35",
        content: "#e8e6e0",
        surface: "#181818",
        muted: "rgba(232, 230, 224, 0.42)",
        border: "rgba(232, 230, 224, 0.08)",
        "border-med": "rgba(232, 230, 224, 0.16)",
        "content-70": "rgba(232, 230, 224, 0.7)",
        "content-60": "rgba(232, 230, 224, 0.6)",
        "content-40": "rgba(232, 230, 224, 0.4)",
        "content-20": "rgba(232, 230, 224, 0.2)",
        "content-10": "rgba(232, 230, 224, 0.1)",
        "content-4": "rgba(232, 230, 224, 0.04)",
        "flare-50": "rgba(255, 107, 53, 0.5)",
        "flare-20": "rgba(255, 107, 53, 0.2)",
        "flare-10": "rgba(255, 107, 53, 0.1)",
        sage: "#6dbf8a",
        "sage-20": "rgba(109, 191, 138, 0.2)",
        "sage-10": "rgba(109, 191, 138, 0.1)",
        // Medium/warning register, sitting between sage (safe) and flare
        // (exposed). Currently used only by the Exhibit C risk verdict.
        gamboge: "#E8960C",
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
