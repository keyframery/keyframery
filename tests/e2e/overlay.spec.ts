import type { Page } from "@playwright/test"

import { activeId, animNames, centre, expect, firstOn, meta, onStock, ranToEnd, sample, startTransform, takeEvents, test } from "./kit"

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
      const trigger = (await centre(page, `[data-testid="${c.trigger}"]`))!
      const open = await sample(page, c.content, 600, () => page.getByTestId(c.trigger).click())
      expect(animNames(open)).toContain("kf-rack-in")
      expect(firstOn(open)!.op).toBeLessThan(0.9)
      await expect(page.locator(c.content)).toBeVisible()
      await page.waitForTimeout(400)
      // At its first instant: scaled down and pulled toward the trigger, or (reduced motion) not moved at all.
      const start = await startTransform(page, c.content, "kf-rack-in")
      if (reduced) expect(start).toBe("none")
      else expect(start).toMatch(/^matrix\(0\.94, 0, 0, 0\.94, /)
      const durs = await page.evaluate((s) => document.querySelector(s)!.getAnimations().map((a) => Number(a.effect?.getTiming().duration)), c.content)
      expect(Math.max(...durs)).toBeLessThanOrEqual(reduced ? 120 : 340)
      // The engine aims the cut from the dialog's resting centre to the trigger's centre.
      const content = (await centre(page, c.content))!
      expect(content.dx).toBeCloseTo(trigger.x - content.x, 0)
      expect(content.dy).toBeCloseTo(trigger.y - content.y, 0)
      await c.close(page)
      await expect(page.locator(c.content)).toHaveCount(0)
      expect(await ranToEnd(page, c.slot, "kf-rack-out")).toBe(true)
      const ev = (await takeEvents(page)).filter((e) => e.component === c.component)
      expect(ev.map((e) => `${e.cut}:${e.phase}`)).toEqual(["rack-focus:enter", "rack-focus:exit"])
      expect(errors).toEqual([])
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
