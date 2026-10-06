import { expect, test } from "./kit"

test("changing a menu and a slider updates the code, and Share restores it", async ({ page, context }, info) => {
  test.skip(info.project.name !== "chromium", "clipboard permissions are Chromium-only in Playwright")
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await page.goto("/theme")
  await page.getByRole("radio", { name: "punch-in" }).first().click()
  await expect(page.getByTestId("theme-jsx")).toHaveText('<Cuts dialog="punch-in" />')
  await page.getByRole("button", { name: "Share" }).click()
  const url = await page.evaluate(() => navigator.clipboard.readText())
  expect(url).toContain("/theme?dialog=punch-in")
  await page.goto(url)
  await expect(page.getByTestId("theme-jsx")).toHaveText('<Cuts dialog="punch-in" />')
  expect(await page.evaluate(() => document.documentElement.getAttribute("data-kf-dialog"))).toBe("punch-in")
})

test("leaving the Theme page puts the site's own cuts back", async ({ page }) => {
  await page.goto("/theme?dialog=fade&pace=2")
  expect(await page.evaluate(() => document.documentElement.getAttribute("data-kf-dialog"))).toBe("fade")
  await page.getByRole("link", { name: "Docs" }).first().click()
  await expect(page).toHaveURL(/\/docs/)
  await expect.poll(() => page.evaluate(() => document.documentElement.getAttribute("data-kf-dialog"))).toBe("rack-focus")
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue("--kf-pace"))).toBe("")
})

test("Copy gives the <Cuts> line and the CSS", async ({ page, context }, info) => {
  test.skip(info.project.name !== "chromium", "clipboard permissions are Chromium-only in Playwright")
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await page.goto("/theme?blur=4&tabs=whip")
  await page.getByRole("button", { name: "Copy the code" }).click()
  const text = await page.evaluate(() => navigator.clipboard.readText())
  expect(text).toContain('<Cuts tabs="whip" />')
  expect(text).toContain("--kf-blur: 4px;")
})
