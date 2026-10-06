import type { Locator, Page } from "@playwright/test"

import { expect, meta, takeEvents, test } from "./kit"

type Tuned = {
  comp: string
  trigger: string
  content: string
  how: "click" | "hover" | "context"
  close: "escape" | "toggle" | "leave"
  /** When the trigger renders a Button, the Button's own data-slot="button" replaces the trigger's slot. */
  pick?: (page: Page) => Locator
  /** The part that opens, when it isn't `[data-slot=<content>]` (Radix's navigation menu opens its viewport). */
  open?: string
}

const TUNED: Tuned[] = [
  { comp: "popover", trigger: "popover-trigger", content: "popover-content", how: "click", close: "escape", pick: (p) => p.locator('button[aria-haspopup="dialog"]', { hasText: "Open Popover" }) },
  { comp: "dropdown-menu", trigger: "dropdown-menu-trigger", content: "dropdown-menu-content", how: "click", close: "escape" },
  { comp: "context-menu", trigger: "context-menu-trigger", content: "context-menu-content", how: "context", close: "escape" },
  { comp: "menubar", trigger: "menubar-trigger", content: "menubar-content", how: "click", close: "escape" },
  { comp: "select", trigger: "select-trigger", content: "select-content", how: "click", close: "escape" },
  { comp: "combobox", trigger: "combobox-trigger", content: "combobox-content", how: "click", close: "escape" },
  { comp: "hover-card", trigger: "hover-card-trigger", content: "hover-card-content", how: "hover", close: "leave", pick: (p) => p.getByRole("button", { name: /^(top|right|bottom|left)$/i }) },
  { comp: "tooltip", trigger: "tooltip-trigger", content: "tooltip-content", how: "hover", close: "leave" },
  { comp: "navigation-menu", trigger: "navigation-menu-trigger", content: "navigation-menu-content", how: "hover", close: "leave", open: '[data-slot="navigation-menu-content"],[data-slot="navigation-menu-viewport"]' },
  { comp: "accordion", trigger: "accordion-trigger", content: "accordion-content", how: "click", close: "toggle" },
  { comp: "collapsible", trigger: "collapsible-trigger", content: "collapsible-content", how: "click", close: "toggle" },
]

const OPEN = '[data-state="open"],[data-state="delayed-open"],[data-state="instant-open"],[data-open]:not([data-open="false"])'

async function openOne(page: Page, t: Tuned) {
  const closedFirst = t.close === "toggle" ? '[aria-expanded="false"]' : ""
  const trigger = (t.pick ? t.pick(page) : page.locator(`[data-slot="${t.trigger}"]${closedFirst}:not([disabled]):not([data-disabled])`)).filter({ visible: true }).first()
  await trigger.scrollIntoViewIfNeeded()
  if (t.how === "click") await trigger.click()
  else if (t.how === "context") await trigger.click({ button: "right" })
  else await trigger.hover()
  await page.waitForTimeout(t.how === "hover" ? 900 : 400)
  return (await trigger.elementHandle())! // the locator would re-match a different, still-closed trigger
}

for (const t of TUNED) {
  test(`${t.comp}: follows --kf-pace and --kf-ease, and reports the cut`, async ({ page, errors }, info) => {
    const reduced = meta(info).motion === "reduced"
    await page.goto(`/sink/${t.comp}-example`, { waitUntil: "load" }) // some examples keep the network busy
    await expect(page.getByTestId("sink")).toBeVisible()
    await page.waitForTimeout(300)
    await takeEvents(page)
    const trigger = await openOne(page, t)
    const timing = await page.evaluate(
      ([selector, open]) => {
        const els = [...document.querySelectorAll(selector)].filter((e) => e.matches(open))
        const el = els[els.length - 1]
        if (!el) return null
        const cs = getComputedStyle(el)
        return [cs.animationDuration, cs.transitionDuration].join(",").split(",").map((s) => s.trim())
      },
      [t.open ?? `[data-slot="${t.content}"]`, OPEN] as [string, string],
    )
    expect(timing, `${t.content} should be open`).not.toBeNull()
    expect(timing).toContain(reduced ? "0.12s" : "0.18s")
    const ev = (await takeEvents(page)).filter((e) => e.cut === "tuned" && e.component === t.comp && e.phase === "enter")
    expect(ev.length).toBeGreaterThanOrEqual(1)
    if (t.close === "escape") await page.keyboard.press("Escape")
    else if (t.close === "toggle") await trigger.click()
    else await page.mouse.move(2, 2)
    await page.waitForTimeout(500)
    // The examples link to pages of shadcn's own site; Next.js prefetches them and they 404 here (on stock too).
    expect(errors.filter((e) => !e.startsWith("Failed to load resource: the server responded with a status of 404"))).toEqual([])
  })
}

test("a collapsible that was open on load does not grow on load", async ({ page }) => {
  await page.goto("/sink/collapsible-example")
  const grew = await page.evaluate(() =>
    [...document.querySelectorAll('[data-slot="collapsible-content"]')].some((e) => e.getAnimations().some((a) => (a as CSSAnimation).animationName === "kf-grow")),
  )
  expect(grew).toBe(false)
})
