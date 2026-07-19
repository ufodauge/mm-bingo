import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // The task-generation suite runs 100k seeds per task version; the
    // default 5s per-test timeout isn't enough headroom for that.
    testTimeout: 60_000,
    // e2e/*.spec.ts are Playwright tests (run via `playwright test`, see
    // playwright.config.ts) — they'd otherwise also match vitest's default
    // "*.spec.ts" glob and fail immediately outside a Playwright runner.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
