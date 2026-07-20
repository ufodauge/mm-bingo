import { defineConfig, devices } from "@playwright/test";

// A fixed, uncommon port (not Vite's default 5173) so this doesn't collide
// with a dev server the person running these might already have open.
const PORT = 5183;
const BASE_URL = `http://localhost:${PORT}`;

// Trystero's default (Nostr) strategy has no signaling server of our own —
// two browser contexts here reach each other over the same public relays
// production traffic uses (see trysteroConfig.ts). That makes these true
// black-box tests of the real app, but also means they need real network
// access and can take a few seconds per peer connection to settle; the
// generous timeouts below are for that, not slow app code.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    headless: true,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Explicit loopback host (not Vite's default host-detection) so this
    // never binds an all-interfaces socket — on a Windows machine running
    // node for the first time, an all-interfaces listener is what triggers
    // the "Windows Defender Firewall has blocked some features of this
    // app" prompt, which then blocks the run until a human clicks through.
    command: `pnpm exec vite --port ${PORT} --strictPort --host 127.0.0.1`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
