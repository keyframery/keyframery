import type { Page } from "@playwright/test"

import { expect, leftovers, meta, takeEvents, takeGhosts, test } from "./kit"

const valueCuts = async (page: Page) => (await takeEvents(page)).filter((e) => e.component === "value").map((e) => e.cut)
/** The rolling digits exist only while a change plays; at rest the value is plain text. */
const rolling = (page: Page) => page.evaluate(() => document.querySelectorAll("[data-kf-roll]").length)

/** What copying, find-in-page and anything that reads the page's text get from a value. */
const asText = (page: Page, id: string) =>
  page.getByTestId(id).evaluate((el) => {
    const selection = getSelection()!
    const range = document.createRange()
    range.selectNodeContents(el)
    selection.removeAllRanges()
    selection.addRange(range)
    const copied = selection.toString()
    selection.removeAllRanges()
    return { text: el.textContent, inner: (el as HTMLElement).innerText, copied }
  })

test("+1 rolls only the changed digit and punches the value", async ({ page, errors }, info) => {
  const reduced = meta(info).motion === "reduced"
  await page.goto("/helpers")
  await takeGhosts(page)
  const roll = await page.evaluate(async () => {
    ;(document.querySelector('[data-testid="value-inc"]') as HTMLElement).click()
    await new Promise((r) => setTimeout(r, 0)) // React renders the click's update after the handler returns
    const el = document.querySelector('[data-testid="value-number"] [data-kf-roll]')
    return el && { aria: el.getAttribute("aria-hidden"), cells: el.querySelectorAll("[data-kf-cell]").length }
  })
  // The rolling copy is hidden from screen readers: the real value underneath is what they read.
  expect(roll).toEqual(reduced ? null : { aria: "true", cells: 5 })
  await expect(page.getByTestId("value-number")).toMatchAriaSnapshot('- paragraph: "1,285"')
  expect((await takeGhosts(page)).length).toBe(reduced ? 0 : 1)
  await expect.poll(() => leftovers(page)).toBe(0)
  await expect.poll(() => rolling(page)).toBe(0)
  expect(await valueCuts(page)).toEqual(reduced ? [] : ["punch-in"])
  expect(errors).toEqual([])
})

test("the value is on the page once, for copying, find and anything that reads text", async ({ page }) => {
  await page.goto("/helpers")
  expect(await asText(page, "value-number")).toEqual({ text: "1,284", inner: "1,284", copied: "1,284" })
  await page.getByTestId("value-jump").click()
  await expect.poll(() => rolling(page)).toBe(0)
  await expect.poll(() => asText(page, "value-number")).toEqual({ text: "10,284", inner: "10,284", copied: "10,284" })
  await expect(page.getByTestId("value-number")).toMatchAriaSnapshot('- paragraph: "10,284"')
  expect(await asText(page, "value-status")).toEqual({ text: "Pending", inner: "Pending", copied: "Pending" })
})

test("+9,000 adds a digit: places line up from the right and the width animates", async ({ page }, info) => {
  test.skip(meta(info).motion === "reduced")
  await page.goto("/helpers")
  const grew = await page.evaluate(async () => {
    const row = document.querySelector('[data-testid="value-number"] [data-slot="value-cut"] > span') as HTMLElement
    ;(document.querySelector('[data-testid="value-jump"]') as HTMLElement).click()
    await new Promise((r) => setTimeout(r, 0))
    return row.getAnimations().some((a) => (a.effect as KeyframeEffect).getKeyframes().some((k) => "width" in k))
  })
  expect(grew).toBe(true)
  await expect(page.getByTestId("value-number")).toMatchAriaSnapshot('- paragraph: "10,284"')
  await expect.poll(() => leftovers(page)).toBe(0)
  await expect.poll(() => rolling(page)).toBe(0)
})

test("text values crossfade and are announced", async ({ page }, info) => {
  await page.goto("/helpers")
  await page.getByTestId("value-toggle").click()
  await expect(page.getByTestId("value-status")).toMatchAriaSnapshot('- paragraph: "Paid"')
  const live = await page.evaluate(() => {
    const status = document.querySelector('[data-testid="value-status"] [aria-live]')
    return { status: status?.getAttribute("aria-live"), text: status?.textContent, number: document.querySelector('[data-testid="value-number"] [aria-live]') }
  })
  expect(live).toEqual({ status: "polite", text: "Paid", number: null })
  expect(await valueCuts(page)).toEqual(meta(info).motion === "reduced" ? [] : ["punch-in"])
  await expect.poll(() => rolling(page)).toBe(0)
})
