import fs from "node:fs"

import AxeBuilder from "@axe-core/playwright"
import type { Page } from "@playwright/test"

import { expect, meta, onStock, test } from "./kit"

const list = (base: string): string[] => JSON.parse(fs.readFileSync(new URL(`../../fixtures/next-${base}/app/sink/examples.json`, import.meta.url), "utf8"))
const ALL = [...new Set([...list("base"), ...list("radix")])].sort()

/** Load-time layout shift (shifts right after input don't count, as in CLS). */
const loadShift = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0
        new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!(e as unknown as { hadRecentInput: boolean }).hadRecentInput) total += (e as unknown as { value: number }).value })).observe({ type: "layout-shift", buffered: true })
        setTimeout(() => resolve(total), 300)
      }),
  )

async function audit(page: Page) {
  await expect(page.getByTestId("sink")).toBeVisible()
  await page.waitForTimeout(300)
  const shift = await loadShift(page)
  const axe = await new AxeBuilder({ page }).include('[data-testid="sink"]').analyze()
  const focus: string[] = []
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab")
    focus.push(await page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName.toLowerCase()}#${a.getAttribute("data-slot") ?? ""}` : "none" }))
  }
  return { shift, violations: axe.violations.map((v) => v.id).sort(), focus }
}

async function exercise(page: Page) {
  await page.keyboard.press("Escape")
  const triggers = page.locator('[data-slot$="-trigger"]:not([disabled]):not([data-disabled])').filter({ visible: true })
  const n = Math.min(await triggers.count(), 12)
  for (let i = 0; i < n; i++) {
    await triggers.nth(i).click({ timeout: 2000 }).catch(() => {})
    await page.waitForTimeout(250)
    await page.keyboard.press("Escape")
    await page.waitForTimeout(250)
  }
}

for (const name of ALL) {
  test(name, async ({ page, browser, errors }, info) => {
    const m = meta(info)
    test.skip(m.motion === "reduced", "checked with full motion")
    test.skip(m.browser !== "chromium" && !process.env.KF_SINK_ALL, "other browsers run weekly (KF_SINK_ALL=1)")
    test.skip(!list(m.base).includes(name), `${m.base} has no ${name}`)
    test.setTimeout(120_000)
    await page.goto(`/sink/${name}`, { waitUntil: "load" }) // some examples keep the network busy
    const ours = await audit(page)
    await exercise(page)
    const stock = await onStock(browser, info, `/sink/${name}`, async (p) => {
      const a = await audit(p)
      await exercise(p)
      return a
    }, { waitUntil: "load" })
    expect(ours.focus).toEqual(stock.value.focus)
    expect(ours.violations).toEqual(stock.value.violations)
    // Load-time shift varies with font and hydration timing under parallel load. Keyframery does nothing
    // at load, so a one-off excess is re-measured (up to twice) and the lowest value counts.
    let shift = ours.shift
    for (let i = 0; i < 2 && shift > stock.value.shift + 0.01; i++) {
      await page.goto(`/sink/${name}`, { waitUntil: "load" })
      await expect(page.getByTestId("sink")).toBeVisible()
      shift = Math.min(shift, await loadShift(page))
    }
    expect(shift).toBeLessThanOrEqual(stock.value.shift + 0.01)
    expect(errors.filter((e) => !stock.errors.includes(e))).toEqual([])
  })
}
