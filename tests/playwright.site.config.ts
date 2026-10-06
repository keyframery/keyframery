import { defineConfig, devices } from "@playwright/test"

const browsers = process.env.KF_BROWSERS?.split(",")
const all = [
  { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
  { name: "webkit", use: { ...devices["Desktop Safari"], viewport: { width: 1280, height: 800 } } },
  { name: "firefox", use: { ...devices["Desktop Firefox"], viewport: { width: 1280, height: 800 } } },
  { name: "phone", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
]

export default defineConfig({
  testDir: "site",
  fullyParallel: true,
  workers: 4,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "../.reports/site" }]],
  use: { baseURL: "http://localhost:4500", trace: "retain-on-failure" },
  projects: all.filter((p) => !browsers || browsers.includes(p.name)),
  webServer: { command: "pnpm -C ../apps/web start -p 4500", url: "http://localhost:4500", reuseExistingServer: true, timeout: 60_000 },
})
