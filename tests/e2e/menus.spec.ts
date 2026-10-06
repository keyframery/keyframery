import type { Page } from "@playwright/test"

import { expect, meta, onStock, sample, startedOn, takeEvents, test } from "./kit"

test.beforeEach(({}, info) => test.skip(meta(info).motion === "reduced", "menus are checked with full motion"))

const DIALOG = '[data-slot="dialog-content"]'
const SHEET = '[data-slot="sheet-content"]'

/** The animations a dialog plays on open, and on close. */
async function dialogNames(page: Page) {
  await startedOn(page, "dialog-content")
  await page.getByTestId("dialog-trigger").click()
  await expect(page.locator(DIALOG)).toBeVisible()
  await page.waitForTimeout(300)
  const open = await startedOn(page, "dialog-content")
  await page.keyboard.press("Escape")
  await expect(page.locator(DIALOG)).toHaveCount(0)
  return { open, close: await startedOn(page, "dialog-content") }
}

async function sheetNames(page: Page) {
  await page.getByTestId("sheet-trigger").click()
  await expect(page.locator(SHEET)).toBeVisible()
  await page.waitForTimeout(150)
  return startedOn(page, "sheet-content")
}

/**
 * "none" / enabled={false} must mean stock: the same opening animation as the stock twin and no
 * Keyframery animation at all. (The close isn't compared name-for-name: under load, Base UI itself
 * sometimes skips its exit animation, on the stock twin too.)
 */
function expectStock(ours: { open: string[]; close: string[] }, stock: { open: string[]; close: string[] }) {
  expect(ours.open).toEqual(stock.open)
  expect([...ours.open, ...ours.close].filter((n) => n.startsWith("kf-"))).toEqual([])
}

const sinkOn = (page: Page) => page.evaluate(() => document.querySelectorAll('[data-kf-sink="on"]').length)

for (const [cut, enter, exit] of [
  ["punch-in", "kf-punch-in", "kf-punch-out"],
  ["fade", "kf-fade-in", "kf-fade-out"],
] as const) {
  test(`dialog=${cut}`, async ({ page }) => {
    await page.goto(`/?dialog=${cut}`)
    const n = await dialogNames(page)
    expect(n.open).toContain(enter)
    expect(n.close).toContain(exit)
    expect((await takeEvents(page)).map((e) => e.cut)).toEqual([cut, cut])
  })
}

test("dialog=none is stock shadcn", async ({ page, browser }, info) => {
  await page.goto("/?dialog=none")
  const ours = await dialogNames(page)
  expectStock(ours, (await onStock(browser, info, "/", dialogNames)).value)
  expect(await takeEvents(page)).toEqual([])
})

test("sheet=slide travels without sinking the page", async ({ page }) => {
  await page.goto("/?sheet=slide")
  expect(await sheetNames(page)).toContain("kf-panel-in")
  expect(await sinkOn(page)).toBe(0)
})

test("sheet=fade fades in place", async ({ page }) => {
  await page.goto("/?sheet=fade")
  expect(await sheetNames(page)).toContain("kf-panel-fade-in")
  expect(await sinkOn(page)).toBe(0)
})

test("sheet=none is stock shadcn", async ({ page, browser }, info) => {
  await page.goto("/?sheet=none")
  expect(await sheetNames(page)).toEqual((await onStock(browser, info, "/", sheetNames)).value)
})

test("drawer=none does not sink the page", async ({ page }) => {
  await page.goto("/?drawer=none")
  await page.getByTestId("drawer-trigger").click()
  await page.waitForTimeout(400)
  expect(await sinkOn(page)).toBe(0)
})

for (const cut of ["whip", "fade"] as const) {
  test(`tabs=${cut}`, async ({ page }) => {
    await page.goto(`/?tabs=${cut}`)
    await page.getByTestId("tab-analytics").click()
    await expect.poll(async () => (await takeEvents(page)).filter((e) => e.component === "tabs").map((e) => e.cut)).toEqual([cut])
  })
}

test("tabs=none: no ghost, no cut", async ({ page }) => {
  await page.goto("/?tabs=none")
  const g = await sample(page, '[data-slot="tabs-content-ghost"]', 300, () => page.getByTestId("tab-analytics").click())
  expect(g.filter((f) => f.on)).toHaveLength(0)
  expect((await takeEvents(page)).filter((e) => e.component === "tabs")).toEqual([])
})

test("toast=none: the toast keeps sonner's own motion", async ({ page }) => {
  await page.goto("/?toast=none")
  const f = await sample(page, "[data-sonner-toast]", 300, () => page.getByTestId("toast-trigger").click())
  expect(f.filter((x) => x.on).every((x) => x.tr === "none")).toBe(true)
  expect((await takeEvents(page)).filter((e) => e.component === "sonner")).toEqual([])
})

test("?off: enabled={false} is stock shadcn everywhere", async ({ page, browser }, info) => {
  await page.goto("/?off")
  expect(await page.evaluate(() => document.documentElement.hasAttribute("data-kf"))).toBe(false)
  expectStock(await dialogNames(page), (await onStock(browser, info, "/", dialogNames)).value)
  await page.getByTestId("tab-analytics").click()
  await page.getByTestId("toast-trigger").click()
  await page.waitForTimeout(400)
  expect(await takeEvents(page)).toEqual([])
})

test("?double: two <Cuts /> still play one cut per change", async ({ page }) => {
  await page.goto("/?double")
  await dialogNames(page)
  expect((await takeEvents(page)).map((e) => `${e.cut}:${e.phase}`)).toEqual(["rack-focus:enter", "rack-focus:exit"])
})

test("?pace=2 doubles every duration", async ({ page }) => {
  await page.goto("/?pace=2")
  await page.getByTestId("dialog-trigger").click()
  await expect(page.locator(DIALOG)).toBeVisible()
  const durs = await page.evaluate((s) => document.querySelector(s)!.getAnimations().map((a) => Number(a.effect?.getTiming().duration)), DIALOG)
  expect(durs).toContain(680)
  expect((await takeEvents(page))[0].ms).toBe(680)
})
