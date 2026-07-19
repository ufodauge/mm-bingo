import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset({ target: "19" })] }),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        ["popup-card"]: resolve(__dirname, "popup-card.html"),
        ["popup-row"]: resolve(__dirname, "popup-row.html"),
        ["popup-room-stats"]: resolve(__dirname, "popup-room-stats.html"),
      },
    },
  },
  base: command === "serve" ? "/" : "/mm-bingo",
}));
