import { expect, test } from "./kit"

test("the footer credits the maker and links contact, privacy and terms", async ({ page }) => {
  await page.goto("/")
  const footer = page.getByRole("contentinfo")
  await expect(footer.getByRole("link", { name: "Briyan Hingrajiya" })).toHaveAttribute("href", "https://x.com/briyan_dev")
  await expect(footer.getByRole("link", { name: "briyan@keyframery.com" })).toHaveAttribute("href", "mailto:briyan@keyframery.com")
  await footer.getByRole("link", { name: "Privacy" }).click()
  await expect(page).toHaveURL(/\/privacy$/)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy")
  await page.getByRole("contentinfo").getByRole("link", { name: "Terms" }).click()
  await expect(page).toHaveURL(/\/terms$/)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Terms")
})

test("privacy says what is collected, and both pages are in the sitemap", async ({ page, request }) => {
  await page.goto("/privacy")
  await expect(page.getByText("Vercel Web Analytics")).toBeVisible()
  await expect(page.getByText("waitlist", { exact: false }).first()).toBeVisible()
  const map = await (await request.get("/sitemap.xml")).text()
  expect(map).toContain("https://keyframery.com/privacy")
  expect(map).toContain("https://keyframery.com/terms")
})
