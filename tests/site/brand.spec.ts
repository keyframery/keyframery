import { expect, test } from "./kit"

test("the brand icons are served", async ({ request }) => {
  const svg = await request.get("/icon.svg")
  expect(svg.ok()).toBe(true)
  expect(svg.headers()["content-type"]).toContain("image/svg+xml")
  expect(await svg.text()).toContain("#7c93ff")
  const ico = await request.get("/favicon.ico")
  expect(ico.ok()).toBe(true)
  expect([...(await ico.body()).subarray(0, 4)]).toEqual([0, 0, 1, 0]) // ICO header: reserved 0, type 1
  const apple = await request.get("/apple-icon.png")
  expect(apple.ok()).toBe(true)
  expect(apple.headers()["content-type"]).toContain("image/png")
})

test("pages link the icons, and the header shows the Cut key", async ({ page }) => {
  await page.goto("/")
  expect(await page.locator('link[rel="icon"]').count()).toBeGreaterThan(0)
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1)
  await expect(page.locator("svg[data-logo]").first()).toBeVisible()
})
