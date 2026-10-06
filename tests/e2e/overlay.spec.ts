import type { Page } from "@playwright/test"

import { activeId, cancelledOn, centre, expect, meta, onStock, ranToEnd, settled, startedOn, startOpacity, startRecord, startTransform, takeEvents, test } from "./kit"

type Case = { name: string; trigger: string; slot: string; content: string; component: string; close: (p: Page) => Promise<void> }

const CASES: Case[] = [
  { name: "dialog", trigger: "dialog-trigger", slot: "dialog-content", content: '[data-slot="dialog-content"]', component: "dialog", close: (p) => p.keyboard.press("Escape") },
  { name: "alert-dialog", trigger: "alert-trigger", slot: "alert-dialog-content", content: '[data-slot="alert-dialog-content"]', component: "alert-dialog", close: (p) => p.getByTestId("alert-cancel").click() },
  { name: "command", trigger: "command-trigger", slot: "dialog-content", content: '[data-slot="dialog-content"]', component: "command", close: (p) => p.keyboard.press("Escape") },
]

for (const c of CASES) {
  test.describe(c.name, () => {
    test("rack focus: grows from the opener and plays its whole exit", async ({ page, errors }, info) => {
      const reduced = meta(info).motion === "reduced"
      await page.goto("/")
      await page.getByTestId(c.trigger).click()
      await expect(page.locator(c.content)).toBeVisible()
      expect(await startedOn(page, c.slot)).toContain("kf-rack-in")
      expect(await cancelledOn(page, c.slot)).toEqual([]) // measuring the dialog must not restart its animation
      await page.waitForTimeout(400)
      await expect.poll(() => ranToEnd(page, c.slot, "kf-rack-in")).toBe(true) // measure at rest
      // Once in, the dialog keeps no leftover filter or transform (they would re-anchor fixed children).
      expect(await settled(page, c.content)).toEqual({ filter: "none", transform: "none" })
      // The engine aims the cut from the dialog's resting centre to the trigger's centre (both measured
      // with the dialog open: opening can move the trigger, e.g. scroll lock removing a scrollbar).
      const content = (await centre(page, c.content))!
      const trigger = (await centre(page, `[data-testid="${c.trigger}"]`))!
      expect(Math.abs(content.dx - (trigger.x - content.x))).toBeLessThanOrEqual(2)
      expect(Math.abs(content.dy - (trigger.y - content.y))).toBeLessThanOrEqual(2)
      await c.close(page)
      await expect(page.locator(c.content)).toHaveCount(0)
      expect(await ranToEnd(page, c.slot, "kf-rack-out")).toBe(true)
      const ev = (await takeEvents(page)).filter((e) => e.component === c.component)
      expect(ev.map((e) => `${e.cut}:${e.phase}`)).toEqual(["rack-focus:enter", "rack-focus:exit"])
      expect(errors).toEqual([])
    })

    test("rack focus starts scaled down, blurred and see-through (reduced motion: only see-through)", async ({ page }, info) => {
      const reduced = meta(info).motion === "reduced"
      await page.goto("/?pace=8") // slow enough to inspect while it runs
      await page.getByTestId(c.trigger).click()
      await expect(page.locator(c.content)).toBeVisible()
      if (reduced) {
        // a 120 ms fade is over before anything can freeze it, so read what it was when it started
        const rec = (await startRecord(page, c.slot, "kf-rack-in"))!
        expect(rec.ms).toBeLessThanOrEqual(120)
        expect(rec.props).toContain("opacity")
        expect(rec.props).not.toContain("transform")
        expect(rec.props).not.toContain("filter")
        return
      }
      expect(await startTransform(page, c.content, "kf-rack-in")).toMatch(/^matrix\(0\.94, 0, 0, 0\.94, /)
      expect(await startOpacity(page)).toBeLessThan(0.1)
      const durs = await page.evaluate((s) => document.querySelector(s)!.getAnimations().map((a) => Number(a.effect?.getTiming().duration)), c.content)
      expect(Math.max(...durs)).toBe(340 * 8)
    })

    test("focus moves in and comes back exactly like stock", async ({ page, browser }, info) => {
      const run = async (p: Page) => {
        await p.getByTestId(c.trigger).click()
        await expect(p.locator(c.content)).toBeVisible()
        await expect.poll(() => p.evaluate((s) => !!document.querySelector(s)?.contains(document.activeElement), c.content)).toBe(true)
        await c.close(p)
        await expect(p.locator(c.content)).toHaveCount(0)
        await p.waitForTimeout(100) // focus is restored right after the library unmounts the dialog
        return { inside: true, after: await activeId(p) }
      }
      await page.goto("/")
      const ours = await run(page)
      expect(ours).toEqual((await onStock(browser, info, "/", run)).value)
    })
  })
}
