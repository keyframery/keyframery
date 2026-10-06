import type { Page } from "@playwright/test"

import { activeId, expect, leftovers, meta, onStock, sample, takeEvents, test } from "./kit"

const shown = (page: Page) =>
  page.evaluate(
    () =>
      [...document.querySelectorAll('[data-testid="tabs"] [data-slot="tabs-content"]')]
        .find((p) => !(p as HTMLElement).hidden && p.getClientRects().length)
        ?.querySelector("p")?.textContent ?? null,
  )
const belowTop = (page: Page) => page.evaluate(() => Math.round(document.querySelector('[data-testid="below-tabs"]')!.getBoundingClientRect().top))

/** Freezes the tabs frame's height animation at its start and end and reports where the text below sits. */
const morphEnds = (page: Page) =>
  page.evaluate(() => {
    const root = document.querySelector('[data-testid="tabs"]')!
    const below = document.querySelector('[data-testid="below-tabs"]')!
    const anim = root.getAnimations().find((a) => (a.effect as KeyframeEffect).getKeyframes().some((k) => "height" in k))
    if (!anim) return null
    const t = anim.currentTime
    const end = Number(anim.effect!.getTiming().duration)
    anim.pause()
    anim.currentTime = 0
    const start = Math.round(below.getBoundingClientRect().top)
    anim.currentTime = end - 1
    const finish = Math.round(below.getBoundingClientRect().top)
    anim.currentTime = t
    anim.play()
    return { start, finish }
  })

test("j-cut: the old panel leaves on a ghost, the new one follows, nothing below jumps", async ({ page, errors }, info) => {
  const reduced = meta(info).motion === "reduced"
  await page.goto("/")
  const before = await belowTop(page)
  const ghost = await sample(page, '[data-slot="tabs-content-ghost"]', 120, () => page.getByTestId("tab-analytics").click())
  const morph = await morphEnds(page)
  if (reduced) {
    expect(ghost.filter((f) => f.on)).toHaveLength(0)
    expect(morph).toBeNull()
  } else {
    const seen = ghost.filter((f) => f.on)
    expect(seen.length).toBeGreaterThan(0)
    expect(seen.every((f) => f.aria === "true" && f.inert)).toBe(true)
    expect(morph, "the frame's height should animate").not.toBeNull()
    expect(morph!.start).toBe(before) // the text below starts exactly where it was…
  }
  await expect.poll(() => leftovers(page)).toBe(0)
  const after = await belowTop(page)
  expect(after - before).toBeGreaterThan(50) // …and ends lower, because the new panel is taller
  if (!reduced) expect(Math.abs(morph!.finish - after)).toBeLessThanOrEqual(2)
  expect(await shown(page)).toBe("Analytics")
  expect(await activeId(page)).toBe("tab-analytics")
  expect((await takeEvents(page)).filter((e) => e.component === "tabs").map((e) => e.cut)).toEqual(["j-cut"])
  expect(errors).toEqual([])
})

test("keyboard: arrow keys (plus Enter where the library needs it) cut too", async ({ page }) => {
  await page.goto("/")
  await page.getByTestId("tab-overview").focus()
  await page.keyboard.press("ArrowRight")
  await page.waitForTimeout(100)
  if ((await shown(page)) !== "Analytics") await page.keyboard.press("Enter")
  await expect.poll(() => shown(page)).toBe("Analytics")
  await expect.poll(() => leftovers(page)).toBe(0)
  expect((await takeEvents(page)).filter((e) => e.component === "tabs")).toHaveLength(1)
})

test("rapid switching ends on the right panel and leaves nothing behind", async ({ page, errors }) => {
  await page.goto("/")
  for (const id of ["tab-analytics", "tab-reports", "tab-overview"]) {
    await page.getByTestId(id).click()
    await page.waitForTimeout(40)
  }
  await expect.poll(() => leftovers(page)).toBe(0)
  expect(await shown(page)).toBe("Overview")
  expect(await page.evaluate(() => (document.querySelector('[data-testid="tabs"] [data-slot="tabs-list"]') as HTMLElement).style.position)).toBe("")
  expect(errors).toEqual([])
})

test("focus after a tab click matches stock", async ({ page, browser }, info) => {
  const run = async (p: Page) => {
    await p.getByTestId("tab-reports").click()
    await expect.poll(() => p.evaluate(() => document.querySelectorAll("[data-kf-ghost],[data-kf-pill]").length)).toBe(0)
    return activeId(p)
  }
  await page.goto("/")
  expect(await run(page)).toBe((await onStock(browser, info, "/", run)).value)
})
