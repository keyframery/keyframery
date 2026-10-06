import type { Page } from "@playwright/test"

import { expect, leftovers, meta, takeEvents, takeGhosts, test } from "./kit"

const spoken = (page: Page, id: string) => page.evaluate((i) => document.querySelector(`[data-testid="${i}"] .sr-only`)!.textContent, id)
const valueCuts = async (page: Page) => (await takeEvents(page)).filter((e) => e.component === "value").map((e) => e.cut)

test("+1 rolls only the changed digit and punches the value", async ({ page, errors }, info) => {
  const reduced = meta(info).motion === "reduced"
  await page.goto("/helpers")
  await takeGhosts(page)
  await page.getByTestId("value-inc").click()
  await expect.poll(() => spoken(page, "value-number")).toBe("1,285")
  expect((await takeGhosts(page)).length).toBe(reduced ? 0 : 1)
  await expect.poll(() => leftovers(page)).toBe(0)
  expect(await valueCuts(page)).toEqual(reduced ? [] : ["punch-in"])
  expect(errors).toEqual([])
})

test("+9,000 adds a digit: places line up from the right and the width animates", async ({ page }, info) => {
  test.skip(meta(info).motion === "reduced")
  await page.goto("/helpers")
  const grew = await page.evaluate(async () => {
    const row = document.querySelector('[data-testid="value-number"] [aria-hidden="true"]') as HTMLElement
    ;(document.querySelector('[data-testid="value-jump"]') as HTMLElement).click()
    await new Promise((r) => setTimeout(r, 0))
    return row.getAnimations().some((a) => (a.effect as KeyframeEffect).getKeyframes().some((k) => "width" in k))
  })
  expect(grew).toBe(true)
  await expect.poll(() => spoken(page, "value-number")).toBe("10,284")
  await expect.poll(() => leftovers(page)).toBe(0)
})

test("text values crossfade and are announced", async ({ page }, info) => {
  await page.goto("/helpers")
  await page.getByTestId("value-toggle").click()
  await expect.poll(() => spoken(page, "value-status")).toBe("Paid")
  expect(await page.evaluate(() => document.querySelector('[data-testid="value-status"] .sr-only')!.getAttribute("aria-live"))).toBe("polite")
  expect(await page.evaluate(() => document.querySelector('[data-testid="value-number"] .sr-only')!.getAttribute("aria-live"))).toBeNull()
  expect(await valueCuts(page)).toEqual(meta(info).motion === "reduced" ? [] : ["punch-in"])
})
