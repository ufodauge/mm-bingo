import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    dts({
      tsconfigPath: resolve(__dirname, "./tsconfig.app.json"),
      include: ["src/libs/**/*.ts", "src/features/store/versions/*.ts"],
      entryRoot: resolve(__dirname, "./src"),
      bundleTypes: {
        extractorConfig: {
          compiler: {
            overrideTsconfig: undefined,
          },
        },
        invokeOptions: {
          typescriptCompilerFolder: undefined,
        },
      },
    }),
  ],
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "./src/libs/tasks/index.ts"),
      name: "Task",
      formats: ["es"],
      fileName: "task",
    },
  },
  base: command === "serve" ? "/" : "/mm-bingo",
}));
