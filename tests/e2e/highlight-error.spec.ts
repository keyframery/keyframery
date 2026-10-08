import type { Page } from "@playwright/test"

import { expect, leftovers, meta, ownErrors, takeEvents, test } from "./kit"

const highlights = async (page: Page, component?: string) =>
  (await takeEvents(page)).filter((e) => e.cut === "highlight" && (!component || e.component === component))

/** Moves the active flag the way a router would after a click: Base UI drops it, Radix sets "false". */
async function moveActive(page: Page, attr: "data-active" | "aria-current", fromSel: string, toSel: string) {
  await page.evaluate(
    ([a, f, t]) => {
      const from = document.querySelector(f)!
      const to = document.querySelector(t)!
      if (a === "aria-current") {
        from.removeAttribute(a)
        to.setAttribute(a, "page")
      } else {
        from.setAttribute(a, "false")
        to.setAttribute(a, "true")
      }
    },
    [attr, fromSel, toSel] as const,
  )
}

test("a single-choice toggle group's selection glides to the item you click", async ({ page, errors }, info) => {
  await page.goto("/sink/toggle-group-example")
  // The first group with exactly one item on is a single-choice group.
  const target = await page.evaluate(() => {
    for (const g of document.querySelectorAll('[data-slot="toggle-group"]')) {
      const items = [...g.querySelectorAll('[data-slot="toggle-group-item"]')]
      const on = items.filter((i) => i.matches('[data-pressed]:not([data-pressed="false"]),[data-state="on"]'))
      if (on.length === 1 && items.length > 1) {
        g.setAttribute("data-test-group", "")
        items.find((i) => i !== on[0])!.setAttribute("data-test-target", "")
        return true
      }
    }
    return false
  })
  expect(target).toBe(true)
  await takeEvents(page)
  await page.locator("[data-test-target]").click()
  if (meta(info).motion === "full") {
    await expect.poll(async () => (await highlights(page, "toggle-group")).length).toBe(1)
    await expect.poll(() => leftovers(page)).toBe(0)
  } else {
    await page.waitForTimeout(300)
    expect(await highlights(page)).toEqual([])
  }
  await expect.poll(() => page.locator("[data-test-target]").evaluate((el) => el.matches('[data-pressed]:not([data-pressed="false"]),[data-state="on"]'))).toBe(true)
  expect(ownErrors(errors)).toEqual([])
})

test("a selection moved from the keyboard stays instant", async ({ page }, info) => {
  test.skip(meta(info).motion === "reduced", "nothing glides under reduced motion anyway")
  await page.goto("/sink/calendar-example")
  const day = '[data-slot="calendar"] [data-selected-single="true"]'
  await page.locator(day).first().focus()
  await takeEvents(page)
  await page.keyboard.press("ArrowRight")
  await page.keyboard.press("Enter")
  await page.waitForTimeout(400)
  expect(await highlights(page)).toEqual([])
  expect(await leftovers(page)).toBe(0)
})

test("the calendar's selected day glides to the day you click", async ({ page, errors }, info) => {
  test.skip(meta(info).motion === "reduced", "under reduced motion the new day fades in instead")
  await page.goto("/sink/calendar-example")
  const calendar = page.locator('[data-slot="calendar"]').filter({ has: page.locator('[data-selected-single="true"]') }).first()
  await takeEvents(page)
  await calendar.locator('[data-day]:not([data-selected-single="true"]):not([disabled])').nth(3).click()
  await expect.poll(async () => (await highlights(page, "calendar")).length).toBe(1)
  await expect.poll(() => leftovers(page)).toBe(0)
  expect(ownErrors(errors)).toEqual([])
})

test("the sidebar's active item glides to the one you navigate to", async ({ page, errors }, info) => {
  test.skip(meta(info).motion === "reduced", "under reduced motion the new item fades in instead")
  await page.goto("/sink/sidebar-example")
  const buttons = '[data-slot="sidebar-content"] [data-slot="sidebar-menu-button"]'
  await page.evaluate((s) => {
    const all = [...document.querySelectorAll(s)]
    all.forEach((b) => b.setAttribute("data-active", "false"))
    all[0].setAttribute("data-active", "true")
    all[0].setAttribute("data-test-from", "")
    all[3].setAttribute("data-test-to", "")
  }, buttons)
  await page.waitForTimeout(50)
  await takeEvents(page)
  await page.locator("[data-test-to]").click()
  await moveActive(page, "data-active", "[data-test-from]", "[data-test-to]")
  await expect.poll(async () => (await highlights(page, "sidebar")).length).toBe(1)
  await expect.poll(() => leftovers(page)).toBe(0)
  expect(ownErrors(errors)).toEqual([])
})

test("collapsing the sidebar fades the labels before the width closes", async ({ page }, info) => {
  test.skip(meta(info).motion === "reduced", "stock behaviour under reduced motion")
  await page.goto("/sink/sidebar-icon-example")
  const container = '[data-slot="sidebar-container"]'
  expect(await page.evaluate((s) => getComputedStyle(document.querySelector(s)!).transitionTimingFunction, container)).toBe("cubic-bezier(0.22, 1, 0.36, 1)")
  await page.locator('[data-slot="sidebar-trigger"]').first().click()
  await expect(page.locator('[data-slot="sidebar"][data-collapsible="icon"]').first()).toBeAttached()
  // Labels wrapped in a <span> (as shadcn's docs write them) fade; a bare text label has nothing to fade.
  const label = '[data-slot="sidebar"] [data-slot="sidebar-menu-item"] > :is(button, a) > span'
  expect(await page.locator(label).count()).toBeGreaterThan(0)
  await expect.poll(() => page.evaluate((s) => getComputedStyle(document.querySelector(s)!).opacity, label)).toBe("0")
})

test("a field that turns invalid after a submit shakes once, and its message rises in", async ({ page, errors }, info) => {
  await page.goto("/sink/input-example")
  const input = page.locator('[data-slot="input"]:not([disabled]):not([aria-invalid="true"])').first()
  await input.evaluate((el) => el.setAttribute("data-test-input", ""))
  await takeEvents(page)
  // A pointer press elsewhere (the submit button), then the form marks the field invalid.
  await page.mouse.click(5, 5)
  await page.evaluate(() => {
    const el = document.querySelector("[data-test-input]")!
    el.setAttribute("aria-invalid", "true")
    const msg = document.createElement("div")
    msg.setAttribute("data-slot", "field-error")
    msg.textContent = "Enter an email address."
    el.after(msg)
  })
  if (meta(info).motion === "full") {
    await expect.poll(async () => (await takeEvents(page)).filter((e) => e.cut === "error").length).toBe(1)
    expect(await page.evaluate(() => document.querySelector('[data-slot="field-error"]')!.getAnimations().length)).toBeGreaterThan(0)
  } else {
    await page.waitForTimeout(300)
    expect((await takeEvents(page)).filter((e) => e.cut === "error")).toEqual([])
  }
  expect(ownErrors(errors)).toEqual([])
})

test("a field that turns invalid while someone types in it doesn't shake", async ({ page }) => {
  await page.goto("/sink/input-example")
  const input = page.locator('[data-slot="input"]:not([disabled]):not([aria-invalid="true"])').first()
  await input.click()
  await page.waitForTimeout(700) // the click is no longer a recent submit
  await page.keyboard.type("a")
  await takeEvents(page)
  await input.evaluate((el) => el.setAttribute("aria-invalid", "true"))
  await page.waitForTimeout(300)
  expect((await takeEvents(page)).filter((e) => e.cut === "error")).toEqual([])
})
