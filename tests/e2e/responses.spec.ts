import type { Page } from "@playwright/test"

import { expect, meta, ownErrors, takeEvents, test } from "./kit"

declare global {
  interface Window {
    __kfResp: { name: string; slot: string | null }[]
  }
}

// The kit tracks animations on data-slot parts; a tick's path has no slot, so record every start here.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__kfResp = []
    document.addEventListener(
      "animationstart",
      (e) => {
        const t = e.target as Element
        window.__kfResp.push({ name: (e as AnimationEvent).animationName, slot: t.closest("[data-slot]")?.getAttribute("data-slot") ?? null })
      },
      true,
    )
  })
})

const started = (page: Page, name: string) => page.evaluate((n) => window.__kfResp.filter((r) => r.name === n).map((r) => r.slot), name)
const style = (page: Page, selector: string, prop: "scale" | "transitionTimingFunction" | "transitionDuration" | "boxShadow") =>
  page.evaluate(([s, p]) => getComputedStyle(document.querySelector(s)!)[p as "scale"], [selector, prop] as const)
const THEME_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const ENABLED = ':not([data-disabled]):not([disabled]):not([aria-disabled="true"])'

async function holdOn(page: Page, selector: string) {
  const box = (await page.locator(selector).first().boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
}

test("a checkbox draws its tick when you check it, and boxes that load checked don't redraw", async ({ page, errors }) => {
  await page.goto("/sink/checkbox-example")
  expect(await started(page, "kf-draw")).toEqual([])
  await takeEvents(page)
  await page.locator(`[data-slot="checkbox"]:not([data-checked]):not([data-state="checked"])${ENABLED}`).first().click()
  await expect.poll(() => started(page, "kf-draw")).toContain("checkbox-indicator")
  expect((await takeEvents(page)).filter((e) => e.cut === "toggle")).toContainEqual(expect.objectContaining({ component: "checkbox", phase: "enter" }))
  expect(ownErrors(errors)).toEqual([])
})

test("the radio dot grows on the item you pick", async ({ page, errors }) => {
  await page.goto("/sink/radio-group-example")
  expect(await started(page, "kf-dot-in")).toEqual([])
  // Base UI puts an item's id on its hidden input, so pick the visible part by its slot.
  await page.locator(`[data-slot="radio-group-item"]:not([data-checked]):not([data-state="checked"])${ENABLED}`).first().click()
  await expect.poll(() => started(page, "kf-dot-in")).toContain("radio-group-indicator")
  expect(ownErrors(errors)).toEqual([])
})

test("a button dips while it's pressed and comes back on release", async ({ page, errors }, info) => {
  await page.goto("/sink/button-example")
  const button = `[data-slot="button"]${ENABLED}`
  await holdOn(page, button)
  if (meta(info).motion === "full") await expect.poll(() => style(page, button, "scale")).toBe("0.97")
  else {
    await page.waitForTimeout(150)
    expect(await style(page, button, "scale")).toBe("none")
  }
  await page.mouse.up()
  await expect.poll(() => style(page, button, "scale")).toBe("none")
  expect(ownErrors(errors)).toEqual([])
})

test("a switch thumb travels on the theme's curve and stretches while it's held", async ({ page, errors }, info) => {
  await page.goto("/sink/switch-example")
  await page.locator(`[data-slot="switch"]:not([data-checked]):not([data-state="checked"])${ENABLED}`).first().evaluate((el) => el.setAttribute("data-test-target", ""))
  const thumb = '[data-test-target] > [data-slot="switch-thumb"]'
  const full = meta(info).motion === "full"
  expect(await style(page, thumb, "transitionTimingFunction")).toBe(full ? THEME_EASE : "cubic-bezier(0.4, 0, 0.2, 1)")
  await holdOn(page, "[data-test-target]")
  if (full) await expect.poll(() => style(page, thumb, "scale")).toBe("1.18 1")
  else {
    await page.waitForTimeout(150)
    expect(await style(page, thumb, "scale")).toBe("none")
  }
  await page.mouse.up()
  await expect.poll(() => style(page, thumb, "scale")).toBe("none")
  await expect.poll(() => page.locator("[data-test-target]").evaluate((el) => el.matches('[data-checked], [data-state="checked"]'))).toBe(true)
  expect(ownErrors(errors)).toEqual([])
})

test("the slider thumb grows while it's dragged and settles on release", async ({ page, errors }, info) => {
  await page.goto("/sink/slider-example")
  const thumb = '[data-slot="slider-thumb"]'
  await holdOn(page, thumb)
  if (meta(info).motion === "full") await expect.poll(() => style(page, thumb, "scale")).toBe("1.25")
  else {
    await page.waitForTimeout(150)
    expect(await style(page, thumb, "scale")).toBe("none")
  }
  await page.mouse.up()
  await expect.poll(() => style(page, thumb, "scale")).toBe("none")
  expect(ownErrors(errors)).toEqual([])
})

test("a resize handle thickens while it's dragged", async ({ page, errors }, info) => {
  test.skip(meta(info).motion === "reduced", "under reduced motion the handle keeps its stock look")
  await page.goto("/sink/resizable-example")
  const handle = '[data-slot="resizable-handle"]'
  expect(await style(page, handle, "boxShadow")).toBe("none")
  await holdOn(page, handle)
  const box = (await page.locator(handle).first().boundingBox())!
  await page.mouse.move(box.x + 12, box.y + box.height / 2, { steps: 3 })
  await expect.poll(() => page.locator(handle).first().getAttribute("data-separator")).toBe("active")
  await expect.poll(() => style(page, handle, "boxShadow")).not.toBe("none")
  await page.mouse.up()
  await expect.poll(() => style(page, handle, "boxShadow")).toBe("none")
  expect(ownErrors(errors)).toEqual([])
})

test("a progress bar eases to its value on the theme's curve", async ({ page }, info) => {
  await page.goto("/sink/progress-example")
  const bar = '[data-slot="progress-indicator"]'
  const full = meta(info).motion === "full"
  expect(await style(page, bar, "transitionTimingFunction")).toBe(full ? THEME_EASE : "cubic-bezier(0.4, 0, 0.2, 1)")
  expect(await style(page, bar, "transitionDuration")).toBe(full ? "0.24s" : "0.15s")
})

test('responses="none" and data-cut="none" leave controls as shadcn ships them', async ({ page }, info) => {
  test.skip(meta(info).motion === "reduced", "nothing to turn off under reduced motion")
  await page.goto("/sink/checkbox-example")
  await page.evaluate(() => document.documentElement.setAttribute("data-kf-responses", "none"))
  await page.locator(`[data-slot="checkbox"]:not([data-checked]):not([data-state="checked"])${ENABLED}`).first().click()
  await page.waitForTimeout(250)
  expect(await started(page, "kf-draw")).toEqual([])

  await page.goto("/sink/button-example")
  const button = `[data-slot="button"]${ENABLED}`
  await page.evaluate(() => document.documentElement.setAttribute("data-kf-responses", "none"))
  await holdOn(page, button)
  await page.waitForTimeout(150)
  expect(await style(page, button, "scale")).toBe("none")
  await page.mouse.up()

  await page.evaluate((s) => {
    document.documentElement.removeAttribute("data-kf-responses")
    document.querySelector(s)!.setAttribute("data-cut", "none")
  }, button)
  await holdOn(page, button)
  await page.waitForTimeout(150)
  expect(await style(page, button, "scale")).toBe("none")
  await page.mouse.up()
})

for (const [page_, slot] of [
  ["toggle-example", "toggle"],
  ["toggle-group-example", "toggle-group-item"],
  ["pagination-example", "pagination-link"],
  ["carousel-example", "carousel-next"],
] as const) {
  test(`a ${slot} dips while it's pressed, like a button`, async ({ page }, info) => {
    test.skip(meta(info).motion === "reduced", "no press response under reduced motion")
    await page.goto(`/sink/${page_}`)
    const part = `[data-slot="${slot}"]${ENABLED}`
    await holdOn(page, part)
    await expect.poll(() => style(page, part, "scale")).toBe("0.97")
    await page.mouse.up()
    await expect.poll(() => style(page, part, "scale")).toBe("none")
  })
}

test("a questionnaire choice draws its tick or grows its dot when picked", async ({ page, errors }) => {
  await page.goto("/sink/questionnaire-example")
  expect([...(await started(page, "kf-draw")), ...(await started(page, "kf-dot-in"))]).toEqual([])
  for (const type of ["checkbox", "radio"]) {
    // Only the current step is on screen; later steps' choices are hidden.
    const choice = page.locator(`[data-slot="questionnaire-choice"][data-type="${type}"]:not([data-checked])${ENABLED}:visible`).first()
    if ((await choice.count()) === 0) continue
    // shadcn lays an invisible native input over each choice; the click lands on it, as a user's would.
    await choice.click({ force: true })
  }
  await expect.poll(async () => [...(await started(page, "kf-draw")), ...(await started(page, "kf-dot-in"))].length).toBeGreaterThan(0)
  expect(ownErrors(errors)).toEqual([])
})

test("a choice card changes colour on the theme's curve instead of jumping", async ({ page }, info) => {
  await page.goto("/sink/field-example")
  const label = '[data-slot="field-label"]'
  expect(await style(page, label, "transitionTimingFunction")).toBe(THEME_EASE)
  // Reduced motion caps every duration at 120 ms.
  expect(await style(page, label, "transitionDuration")).toContain(meta(info).motion === "full" ? "0.15s" : "0.12s")
})
