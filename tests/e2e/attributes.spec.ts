import type { Page } from "@playwright/test"

import { centre, expect, meta, onStock, sample, startedOn, takeEvents, test } from "./kit"

test.beforeEach(({}, info) => test.skip(meta(info).motion === "reduced", "settings are checked with full motion"))

async function openDialog(page: Page, id: string) {
  await startedOn(page, "dialog-content")
  await page.getByTestId(`${id}-trigger`).click()
  await expect(page.getByTestId(`${id}-dialog`)).toBeVisible()
  await page.waitForTimeout(150)
  return startedOn(page, "dialog-content")
}

test("an element's data-cut beats the menu", async ({ page }) => {
  await page.goto("/cases")
  expect(await openDialog(page, "fade")).toContain("kf-fade-in")
})

test("data-cut-origin=center grows from the centre", async ({ page }) => {
  await page.goto("/cases")
  await openDialog(page, "center")
  const c = (await centre(page, '[data-testid="center-dialog"]'))!
  expect({ dx: c.dx, dy: c.dy }).toEqual({ dx: 0, dy: 0 })
})

test("a section's data-cut-pace reaches the dialogs it opens, even though they render in a portal", async ({ page }) => {
  await page.goto("/cases")
  await openDialog(page, "slow")
  const durs = await page.evaluate(() => document.querySelector('[data-testid="slow-dialog"]')!.getAnimations().map((a) => Number(a.effect?.getTiming().duration)))
  expect(durs).toContain(680)
  expect((await takeEvents(page)).find((e) => e.phase === "enter")!.ms).toBe(680)
})

test("a section's data-cut=none gives stock motion to its portaled dialog and its tabs", async ({ page, browser }, info) => {
  await page.goto("/cases")
  const ours = await openDialog(page, "none")
  expect(ours).toEqual((await onStock(browser, info, "/cases", (p) => openDialog(p, "none"))).value)
  expect(ours.filter((n) => n.startsWith("kf-"))).toEqual([])
  await page.keyboard.press("Escape")
  await expect(page.getByTestId("none-dialog")).toHaveCount(0)
  await takeEvents(page)
  const ghost = await sample(page, '[data-slot="tabs-content-ghost"]', 300, () => page.getByTestId("none-tab-b").click())
  expect(ghost.filter((f) => f.on)).toHaveLength(0)
  expect(await takeEvents(page)).toEqual([])
})

test("Tabs data-cut=whip", async ({ page }) => {
  await page.goto("/cases")
  await page.getByTestId("whip-tab-b").click()
  await expect.poll(async () => (await takeEvents(page)).filter((e) => e.component === "tabs").map((e) => e.cut)).toEqual(["whip"])
})

test("a dialog opened by code long after the last press grows from the centre", async ({ page }) => {
  await page.goto("/cases")
  await page.getByTestId("late-trigger").click()
  await expect(page.getByTestId("late-dialog")).toBeVisible({ timeout: 5000 })
  const c = (await centre(page, '[data-testid="late-dialog"]'))!
  expect({ dx: c.dx, dy: c.dy }).toEqual({ dx: 0, dy: 0 })
})
