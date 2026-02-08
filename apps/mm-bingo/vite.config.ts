import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss() as unknown as never],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        // scene: resolve(__dirname, 'pages/scene.html'),
      },
      output: {},
    },
  },
});
