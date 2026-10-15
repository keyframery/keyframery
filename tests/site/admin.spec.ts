import { expect, test } from "@playwright/test"

// The same password playwright.site.config.ts gives the test server.
const PASSWORD = "site-tests-admin-password-0123456789"

test("admin asks for the password, keeps the numbers behind it, and signs out", async ({ page }) => {
  const response = await page.goto("/admin")
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow")
  await expect(page.getByRole("heading", { name: "Keyframery admin" })).toBeVisible()
  await expect(page.getByText("Installs (CLI)")).toHaveCount(0)

  await page.getByLabel("Password").fill("not-the-password")
  await page.getByRole("button", { name: "Open admin" }).click()
  // Next.js keeps its own empty role="alert" route announcer on the page, so look for ours by its text.
  await expect(page.getByRole("alert").filter({ hasText: "That password isn't right." })).toBeVisible()
  await expect(page.getByText("Installs (CLI)")).toHaveCount(0)

  await page.getByLabel("Password").fill(PASSWORD)
  await page.getByRole("button", { name: "Open admin" }).click()
  await expect(page.getByText("Installs (CLI)")).toBeVisible({ timeout: 20_000 })
  await expect(page.getByRole("heading", { name: "Setup" })).toBeVisible()
  // A source without its settings says so on its own card instead of breaking the page.
  await expect(page.getByText("Not available: DATABASE_URL isn't set.").first()).toBeVisible()

  await page.getByRole("link", { name: "7 days" }).click()
  await expect(page).toHaveURL(/\/admin\?days=7$/)
  await expect(page.getByText(/^Last 7 days/)).toBeVisible({ timeout: 20_000 })

  await page.getByRole("button", { name: "Sign out" }).click()
  await expect(page.getByLabel("Password")).toBeVisible()
  await expect(page.getByText("Installs (CLI)")).toHaveCount(0)
})

test("robots and the sitemap leave admin out", async ({ request }) => {
  expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /admin")
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/admin")
})
