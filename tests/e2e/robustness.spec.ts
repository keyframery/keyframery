import type { Page } from "@playwright/test"

import { centre, expect, leftovers, meta, ranToEnd, test } from "./kit"

const sinkOn = (page: Page) => page.evaluate(() => [...document.querySelectorAll('[data-kf-sink="on"]')].map((e) => e.tagName.toLowerCase()))
const sinking = (page: Page) => page.evaluate(() => document.documentElement.hasAttribute("data-kf-sinking"))

test("open/close spam on a dialog leaves nothing behind", async ({ page, errors }) => {
  await page.goto("/")
  for (let i = 0; i < 3; i++) {
    await page.getByTestId("dialog-trigger").click()
    await page.waitForTimeout(50)
    await page.keyboard.press("Escape")
    await page.waitForTimeout(30)
  }
  await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(0)
  expect(errors).toEqual([])
})

test("open/close spam on a sheet always restores the page", async ({ page, errors }) => {
  await page.goto("/")
  for (let i = 0; i < 3; i++) {
    await page.getByTestId("sheet-trigger").click()
    await page.waitForTimeout(60)
    await page.keyboard.press("Escape")
    await page.waitForTimeout(40)
  }
  await expect(page.locator('[data-slot="sheet-content"]')).toHaveCount(0)
  await expect.poll(() => sinkOn(page)).toEqual([])
  expect(await sinking(page)).toBe(false)
  expect(errors).toEqual([])
})

test("nested portals: a sheet from a sheet sinks the app once and restores it after both close", async ({ page, errors }, info) => {
  const reduced = meta(info).motion === "reduced"
  await page.goto("/cases")
  await page.getByTestId("nested-sheet-trigger").click()
  await expect(page.getByTestId("nested-sheet")).toBeVisible()
  await page.waitForTimeout(300)
  await page.getByTestId("nested-sheet2-trigger").click()
  await expect(page.getByTestId("nested-sheet2")).toBeVisible()
  expect(await sinkOn(page)).toEqual(reduced ? [] : ["main"])
  await page.keyboard.press("Escape")
  await expect(page.getByTestId("nested-sheet2")).toHaveCount(0)
  await page.keyboard.press("Escape")
  await expect(page.getByTestId("nested-sheet")).toHaveCount(0)
  await expect.poll(() => sinkOn(page)).toEqual([])
  expect(await sinking(page)).toBe(false)
  expect(await leftovers(page)).toBe(0)
  expect(errors).toEqual([])
})

test("nested portals: a dialog opened from inside a sheet aims at its own trigger", async ({ page, errors }) => {
  await page.goto("/cases")
  await page.getByTestId("nested-sheet-trigger").click()
  await expect(page.getByTestId("nested-sheet")).toBeVisible()
  await expect.poll(() => ranToEnd(page, "sheet-content", "kf-panel-in")).toBe(true) // the trigger rides on the sheet
  const trigger = (await centre(page, '[data-testid="nested-dialog-trigger"]'))!
  await page.getByTestId("nested-dialog-trigger").click()
  await expect(page.getByTestId("nested-dialog")).toBeVisible()
  await page.waitForTimeout(400)
  const dialog = (await centre(page, '[data-testid="nested-dialog"]'))!
  expect(dialog.dx).toBeCloseTo(trigger.x - dialog.x, 0) // the trigger is in the right-hand sheet
  expect(dialog.dx).toBeGreaterThan(10)
  expect(errors).toEqual([])
})
