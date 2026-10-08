import type { Page } from "@playwright/test"

import { expect, meta, takeEvents, test } from "./kit"

type StateAnimation = {
  target: "host" | "content" | "ghost"
  frames: Record<string, unknown>[]
  duration: number
  easing: string
  ghosts: number
  aria: string | null
  inert: boolean
  ids: number
  focusable: boolean
}

/** Capture actual browser keyframes at creation, including very short reduced-motion transitions. */
async function watchState(page: Page) {
  await page.evaluate(() => {
    const records: StateAnimation[] = []
    ;(window as unknown as { __kfStateAnimations: StateAnimation[] }).__kfStateAnimations = records
    const animate = Element.prototype.animate
    Element.prototype.animate = function (...args: Parameters<Element["animate"]>) {
      const animation = animate.apply(this, args)
      const host = this.closest('[data-slot="state-cut"]')
      if (host) {
        const ghost = this.hasAttribute("data-kf-ghost")
        const control = ghost ? this.querySelector<HTMLElement>("input,button,a,select,textarea,[tabindex]") : null
        const focused = document.activeElement
        if (control) control.focus()
        const focusable = !!control && document.activeElement === control
        if (document.activeElement !== focused && focused instanceof HTMLElement) focused.focus()
        records.push({
          target: ghost ? "ghost" : this === host ? "host" : "content",
          frames: (animation.effect as KeyframeEffect).getKeyframes() as Record<string, unknown>[],
          duration: Number(animation.effect!.getTiming().duration),
          easing: animation.effect!.getTiming().easing ?? "linear",
          ghosts: host.querySelectorAll(":scope > [data-kf-ghost]").length,
          aria: this.getAttribute("aria-hidden"),
          inert: (this as HTMLElement).inert,
          ids: this.querySelectorAll("[id]").length + Number(this.hasAttribute("id")),
          focusable,
        })
        if ((window as unknown as { __kfStatePause?: boolean }).__kfStatePause) animation.pause()
      }
      return animation
    }
  })
}

const stateAnimations = (page: Page) => page.evaluate(() => (window as unknown as { __kfStateAnimations: StateAnimation[] }).__kfStateAnimations)
const ghostCount = (page: Page) => page.locator('[data-slot="state-cut"] > [data-kf-ghost]').count()
const currentView = (page: Page) => page.locator('[data-slot="state-cut"] > [data-kf-state-content]:not([data-kf-ghost])')

test("StateCut fades whole content, smooths its height, and keeps only the current view accessible", async ({ page, errors }, info) => {
  await page.goto("/helpers")
  expect((await takeEvents(page)).filter((event) => event.component === "state")).toEqual([])
  await watchState(page)
  await page.getByTestId("state-success").click()
  await expect(currentView(page).getByRole("heading", { name: "Record saved" })).toBeVisible()
  // There is one accessible label/control while a visual stand-in of the old view leaves.
  await expect(page.getByRole("textbox", { name: "Record note" })).toHaveCount(1)
  await page.getByRole("textbox", { name: "Record note" }).fill("Current content remains editable")
  await currentView(page).getByTestId("state-edit").click()
  await expect(currentView(page).getByTestId("state-edits")).toHaveText("Edits: 1")
  const records = await stateAnimations(page)
  const ghosts = records.filter((record) => record.target === "ghost")
  expect(ghosts).toHaveLength(1)
  expect(ghosts[0]).toMatchObject({ aria: "true", inert: true, ids: 0, focusable: false })
  expect(records.filter((record) => record.target === "host")).toHaveLength(meta(info).motion === "reduced" ? 0 : 1)
  const events = (await takeEvents(page)).filter((event) => event.component === "state")
  expect(events.map((event) => event.phase)).toEqual(["exit", "enter"])
  expect(events.map((event) => event.cut)).toEqual(["fade", "fade"])
  if (meta(info).motion === "reduced") {
    expect(events.every((event) => event.ms <= 120)).toBe(true)
    expect(records.flatMap((record) => record.frames).every((frame) => !Object.hasOwn(frame, "translate") && !Object.hasOwn(frame, "height"))).toBe(true)
  }
  await expect.poll(() => ghostCount(page)).toBe(0)
  expect(await page.locator("#state-note").count()).toBe(1)
  expect(errors).toEqual([])
})

test("slide uses the inherited entrance/exit curves and becomes opacity-only under reduced motion", async ({ page }, info) => {
  await page.goto("/helpers")
  await page.getByTestId("state-cut-slide").click()
  await page.evaluate(() => {
    const host = document.querySelector<HTMLElement>('[data-slot="state-cut"]')!
    host.style.setProperty("--kf-ease", "linear")
    host.style.setProperty("--kf-ease-exit", "ease-in")
    host.style.setProperty("--kf-pace", "1.5")
  })
  await watchState(page)
  await page.getByTestId("state-success").click()
  const records = await stateAnimations(page)
  const enter = records.find((record) => record.target === "content")!
  const exit = records.find((record) => record.target === "ghost")!
  expect(enter.easing).toBe("linear")
  expect(exit.easing).toBe("ease-in")
  const reduced = meta(info).motion === "reduced"
  expect(enter.duration).toBe(reduced ? 120 : 390)
  expect(exit.duration).toBe(reduced ? 120 : 270)
  expect(Object.hasOwn(enter.frames[0], "translate")).toBe(!reduced)
  expect(Object.hasOwn(exit.frames[exit.frames.length - 1], "translate")).toBe(!reduced)
  if (!reduced) {
    expect(enter.frames[0].translate).toMatch(/^0(?:px)? 12px$/)
    expect(exit.frames[exit.frames.length - 1].translate).toMatch(/^0(?:px)? -12px$/)
  }
})

test("rapid state switches replace stale ghosts and unmount removes an unfinished transition", async ({ page, errors }) => {
  await page.goto("/helpers")
  await watchState(page)
  await page.getByTestId("state-interrupt").click()
  await expect(currentView(page).getByTestId("state-heading")).toHaveText("No records yet")
  await expect.poll(() => ghostCount(page)).toBe(0)
  // React may batch timer updates under load; every committed state must replace its predecessor.
  expect((await stateAnimations(page)).filter((record) => record.target === "ghost").length).toBeGreaterThanOrEqual(2)
  expect((await stateAnimations(page)).every((record) => record.ghosts <= 1)).toBe(true)
  // Pause at creation so unmount cleanup is exercised even with the 120ms reduced-motion cap.
  await page.evaluate(() => { (window as unknown as { __kfStatePause: boolean }).__kfStatePause = true })
  await page.getByTestId("state-success").click()
  expect(await ghostCount(page)).toBe(1)
  await page.getByTestId("state-toggle").click()
  await expect(page.locator('[data-slot="state-cut"]')).toHaveCount(0)
  expect(await page.locator('[data-kf-state-content][data-kf-ghost]').count()).toBe(0)
  await page.getByTestId("state-toggle").click()
  await expect(currentView(page).getByTestId("state-heading")).toHaveText("Record saved")
  expect(errors).toEqual([])
})

test("same-state edits and local, ancestor, or disabled-root opt-outs swap without motion", async ({ page }) => {
  await page.goto("/helpers")
  await watchState(page)
  await page.getByTestId("state-edit").click()
  expect(await stateAnimations(page)).toHaveLength(0)
  await page.getByTestId("state-cut-none").click()
  await page.getByTestId("state-success").click()
  await expect(currentView(page).getByTestId("state-heading")).toHaveText("Record saved")
  expect(await stateAnimations(page)).toHaveLength(0)
  await page.getByTestId("state-cut-fade").click()
  await page.getByTestId("state-opt-out").click()
  await page.getByTestId("state-error").click()
  await expect(currentView(page).getByTestId("state-heading")).toHaveText("Save failed")
  expect(await stateAnimations(page)).toHaveLength(0)
  await page.getByTestId("state-opt-out").click()
  await page.evaluate(() => document.documentElement.removeAttribute("data-kf"))
  await page.getByTestId("state-empty").click()
  await expect(currentView(page).getByTestId("state-heading")).toHaveText("No records yet")
  expect(await stateAnimations(page)).toHaveLength(0)
  expect((await takeEvents(page)).filter((event) => event.component === "state")).toEqual([])
})

test("StateCut works with active Cuts even when stylesheets are absent", async ({ page, errors }) => {
  await page.goto("/helpers")
  await page.evaluate(() => Array.from(document.styleSheets).forEach((sheet) => { sheet.disabled = true }))
  await watchState(page)
  await page.getByTestId("state-success").click()
  await expect(page.getByRole("heading", { name: "Record saved" })).toBeVisible()
  expect((await stateAnimations(page)).some((record) => record.target === "content")).toBe(true)
  await expect.poll(() => ghostCount(page)).toBe(0)
  expect(errors).toEqual([])
})
