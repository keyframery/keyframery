import { expect, test } from "./kit"

test("the switch turns Keyframery off and on for the whole page", async ({ page }) => {
  await page.goto("/")
  const sw = page.getByTestId("cuts-switch")
  await expect(sw).toHaveAttribute("aria-checked", "true")
  await sw.click()
  await expect(sw).toHaveAttribute("aria-checked", "false")
  expect(await page.evaluate(() => document.documentElement.hasAttribute("data-kf"))).toBe(false)
  await sw.click()
  expect(await page.evaluate(() => document.documentElement.hasAttribute("data-kf"))).toBe(true)
})

test("slow-mo slows every cut down four times", async ({ page }) => {
  await page.goto("/")
  await page.getByTestId("slowmo").click()
  await expect(page.getByTestId("slowmo")).toHaveAttribute("aria-pressed", "true")
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue("--kf-pace"))).toBe("4")
})

test("a cut that plays lands on the timeline as a clip on its track", async ({ page }) => {
  await page.goto("/")
  await page.getByTestId("wall").getByRole("button", { name: "Edit profile" }).click()
  await expect(page.locator('[data-clip][data-track="top"]').first()).toBeVisible()
  await expect(page.locator("[data-clip]").first()).toContainText("Rack focus")
})

test("the timecode runs", async ({ page }) => {
  await page.goto("/")
  const a = await page.getByTestId("timecode").textContent()
  await page.waitForTimeout(400)
  expect(await page.getByTestId("timecode").textContent()).not.toBe(a)
  expect(a).toMatch(/^\d\d:\d\d:\d\d:\d\d$/)
})
