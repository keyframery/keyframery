import AxeBuilder from "@axe-core/playwright"

import { expect, noHorizontalScroll, test } from "./kit"

const PAGES = ["/", "/cuts", "/theme", "/pro", "/docs", "/docs/installation", "/docs/components/dialog", "/docs/helpers/list-cut", "/docs/compatibility"]

for (const path of PAGES) {
  test(`${path}: no errors, no horizontal scroll, no serious accessibility problems`, async ({ page, errors }) => {
    await page.goto(path)
    await expect(page.locator("main").first()).toBeVisible()
    expect(await noHorizontalScroll(page)).toBe(true)
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()
    expect(axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([])
    expect(errors).toEqual([])
  })
}

test("the site has metadata, a sitemap, robots and an Open Graph image", async ({ page, request }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/Keyframery/)
  expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toBeTruthy()
  expect(await (await request.get("/sitemap.xml")).text()).toContain("/docs/helpers/list-cut")
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap:")
  expect((await request.get("/opengraph-image")).headers()["content-type"]).toContain("image/png")
})

test("the wall's controls are reachable with the keyboard", async ({ page, browserName }, info) => {
  test.skip(info.project.name === "phone", "keyboard")
  await page.goto("/?demo=off")
  await page.getByTestId("wall-stock").focus()
  await page.keyboard.press("Space")
  await expect(page.getByTestId("wall-stock")).toHaveAttribute("aria-pressed", "true")
  // Safari on macOS only tabs to buttons with Option+Tab (unless "Press Tab to highlight each item" is on).
  const tab = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab"
  await page.keyboard.press(tab)
  await expect(page.getByTestId("wall-kf")).toBeFocused()
  await page.keyboard.press(tab)
  await expect(page.getByTestId("slowmo")).toBeFocused()
})
