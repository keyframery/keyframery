import type { Page } from "@playwright/test"

import { activeId, animNames, expect, meta, onStock, ranToEnd, sample, settled, startedOn, startTransform, takeEvents, test, translation } from "./kit"

const SHEET = '[data-slot="sheet-content"]'
const sinkState = (page: Page) =>
  page.evaluate(() => ({
    on: [...document.querySelectorAll('[data-kf-sink="on"]')].map((e) => e.tagName.toLowerCase()),
    html: document.documentElement.hasAttribute("data-kf-sinking"),
  }))

for (const side of [
  { trigger: "sheet-trigger", axis: "x" },
  { trigger: "sheet-bottom-trigger", axis: "y" },
] as const) {
  test(`sheet (${side.axis}): travels from its edge while the page steps back, then both return`, async ({ page, errors }, info) => {
    const reduced = meta(info).motion === "reduced"
    await page.goto("/")
    await page.getByTestId(side.trigger).click()
    await expect(page.locator(SHEET)).toBeVisible()
    expect(await startedOn(page, "sheet-content")).toContain("kf-panel-in")
    const tf = await startTransform(page, SHEET, "kf-panel-in")
    if (tf !== null) {
      // still running: at its first instant the panel sits one full panel-width (or height) outside its edge
      const { x, y } = translation(tf)
      if (reduced) expect({ x, y }).toEqual({ x: 0, y: 0 })
      else if (side.axis === "x") expect(x).toBeGreaterThan(200)
      else expect(y).toBeGreaterThan(50)
    }
    expect(await sinkState(page)).toEqual(reduced ? { on: [], html: false } : { on: ["main"], html: true })
    await expect.poll(() => ranToEnd(page, "sheet-content", "kf-panel-in")).toBe(true)
    expect(await settled(page, SHEET)).toEqual({ filter: "none", transform: "none" }) // no leftover containing block
    await page.keyboard.press("Escape")
    await expect(page.locator(SHEET)).toHaveCount(0)
    expect(await ranToEnd(page, "sheet-content", "kf-panel-out")).toBe(true)
    expect(await sinkState(page)).toEqual({ on: [], html: false })
    const ev = (await takeEvents(page)).filter((e) => e.component === "sheet")
    expect(ev.map((e) => `${e.cut}:${e.phase}`)).toEqual(["slide-sink:enter", "slide-sink:exit"])
    expect(errors).toEqual([])
  })
}

test("drawer: keeps its own motion while the page steps back, then returns", async ({ page, errors }, info) => {
  const reduced = meta(info).motion === "reduced"
  const content = meta(info).base === "base" ? '[data-slot="drawer-popup"]' : '[data-slot="drawer-content"]'
  await page.goto("/")
  const open = await sample(page, content, 400, () => page.getByTestId("drawer-trigger").click())
  expect(animNames(open).some((n) => n.startsWith("kf-"))).toBe(false)
  expect(await sinkState(page)).toEqual(reduced ? { on: [], html: false } : { on: ["main"], html: true })
  await page.keyboard.press("Escape")
  await expect(page.locator(content)).toHaveCount(0)
  expect(await sinkState(page)).toEqual({ on: [], html: false })
  expect(errors).toEqual([])
})

test("sheet: focus moves in and comes back exactly like stock", async ({ page, browser }, info) => {
  const run = async (p: Page) => {
    await p.getByTestId("sheet-trigger").click()
    await expect(p.locator(SHEET)).toBeVisible()
    await expect.poll(() => p.evaluate((s) => !!document.querySelector(s)?.contains(document.activeElement), SHEET)).toBe(true)
    await p.keyboard.press("Escape")
    await expect(p.locator(SHEET)).toHaveCount(0)
    await p.waitForTimeout(100)
    return activeId(p)
  }
  await page.goto("/")
  expect(await run(page)).toEqual((await onStock(browser, info, "/", run)).value)
})
