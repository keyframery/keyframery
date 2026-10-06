import { defineConfig, devices } from "@playwright/test"

const BASES = [
  { base: "base", url: "http://localhost:4401", stock: "http://localhost:4403" },
  { base: "radix", url: "http://localhost:4402", stock: "http://localhost:4404" },
] as const
const BROWSERS = [
  { name: "chromium", device: devices["Desktop Chrome"] },
  { name: "webkit", device: devices["Desktop Safari"] },
  { name: "firefox", device: devices["Desktop Firefox"] },
] as const
const browsers = process.env.KF_BROWSERS?.split(",")
const motions = (process.env.KF_MOTION ? [process.env.KF_MOTION] : ["full", "reduced"]) as ("full" | "reduced")[]

export default defineConfig({
  testDir: ".",
  testMatch: process.env.KF_FRAMES ? "frames/**/*.spec.ts" : "e2e/**/*.spec.ts",
  fullyParallel: true,
  workers: 4, // more contends for the CPU with the four fixture servers and flakes timing checks
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "../.reports/e2e" }]],
  use: { trace: "retain-on-failure" },
  projects: BASES.flatMap((b) =>
    BROWSERS.filter((br) => !browsers || browsers.includes(br.name)).flatMap((br) =>
      motions.map((motion) => ({
        name: `${b.base}-${br.name}-${motion}`,
        use: {
          ...br.device,
          viewport: { width: 1280, height: 800 },
          baseURL: b.url,
          reducedMotion: motion === "reduced" ? ("reduce" as const) : ("no-preference" as const),
        },
        metadata: { base: b.base, stock: b.stock, motion, browser: br.name },
      })),
    ),
  ),
  webServer: [
    { command: "node ../registry/scripts/serve.mjs", url: "http://localhost:4400/r/cuts.json", reuseExistingServer: true },
    { command: "npm --prefix ../fixtures/next-base run start -- -p 4401", url: "http://localhost:4401", reuseExistingServer: true },
    { command: "npm --prefix ../fixtures/next-radix run start -- -p 4402", url: "http://localhost:4402", reuseExistingServer: true },
    { command: "npm --prefix ../fixtures/next-base-stock run start -- -p 4403", url: "http://localhost:4403", reuseExistingServer: true },
    { command: "npm --prefix ../fixtures/next-radix-stock run start -- -p 4404", url: "http://localhost:4404", reuseExistingServer: true },
  ],
})
