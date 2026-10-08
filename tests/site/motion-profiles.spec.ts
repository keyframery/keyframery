import { cssValue, DEFAULTS, encode, PROFILES } from "../../apps/web/lib/theme-url"

import { expect, noHorizontalScroll, test } from "./kit"

test("homepage profiles apply their real cuts and shared timing, and carry them into the builder", async ({ page }) => {
  await page.goto("/?demo=off")
  const preview = page.getByTestId("home-motion-profiles")
  const picker = preview.getByRole("group", { name: "Motion profile" })
  for (const key of ["quiet", "crisp", "expressive"] as const) {
    const profile = PROFILES[key]
    await picker.getByRole("button", { name: profile.label, exact: true }).click()
    await expect(picker.getByRole("button", { name: profile.label, exact: true })).toHaveAttribute("aria-pressed", "true")
    for (const [group, cut] of Object.entries(profile.settings.menus)) {
      await expect(page.locator("html")).toHaveAttribute(`data-kf-${group}`, cut)
    }
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--kf-pace").trim())).toBe(String(profile.settings.vars.pace))
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--kf-ease").trim())).toBe(cssValue("ease", profile.settings.vars.ease))
    const query = encode(profile.settings)
    await expect(preview.getByRole("link", { name: `Customize ${profile.label}` })).toHaveAttribute("href", `/theme${query ? `?${query}` : ""}`)
  }
  expect(await noHorizontalScroll(page)).toBe(true)
  await picker.getByRole("button", { name: "Crisp", exact: true }).click()
  await preview.getByRole("link", { name: "Customize Crisp" }).click()
  await expect(page.locator("html")).toHaveAttribute("data-kf-dialog", PROFILES.crisp.settings.menus.dialog)
  if (!(await page.getByRole("link", { name: "Docs", exact: true }).first().isVisible())) await page.getByRole("button", { name: "Toggle Menu" }).click()
  await page.getByRole("link", { name: "Docs", exact: true }).first().click()
  await expect(page.locator("html")).toHaveAttribute("data-kf-dialog", DEFAULTS.menus.dialog)
  await expect.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue("--kf-ease"))).toBe("")
})

test("the StateCut tile exposes one current content state under reduced motion", async ({ browser }, info) => {
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()
  await page.goto(`${info.project.use.baseURL}/?demo=off`)
  const tile = page.getByRole("region", { name: "Seven kinds of change, one cut each" }).locator("article").filter({ hasText: "Content changes keep their context" })
  await expect(tile.getByText("No records yet", { exact: true })).toBeVisible()
  await tile.getByRole("button", { name: "Change status" }).click()
  await expect(tile.getByText("Record saved", { exact: true })).toBeVisible()
  await expect(tile.getByText("No records yet", { exact: true })).toBeHidden()
  await context.close()
})
