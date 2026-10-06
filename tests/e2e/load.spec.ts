import type { Page } from "@playwright/test"

import { expect, meta, takeEvents, test } from "./kit"

const skeletonVisible = (page: Page) =>
  page.evaluate(() => {
    const s = document.querySelector('[data-testid="load-skeleton"]')
    return !!s && getComputedStyle(s).visibility !== "hidden" && Number(getComputedStyle(s.closest("[data-kf-load]") ?? s).opacity) > 0.01
  })

/** Watches the skeleton every frame for `ms`, in the page, and reports whether it was ever visible. */
const everVisible = (page: Page, ms: number) =>
  page.evaluate(
    (d) =>
      new Promise<boolean>((resolve) => {
        let seen = false
        const t0 = performance.now()
        const tick = () => {
          const s = document.querySelector('[data-testid="load-skeleton"]')
          if (s && getComputedStyle(s).visibility !== "hidden") seen = true
          if (performance.now() - t0 < d) requestAnimationFrame(tick)
          else resolve(seen)
        }
        tick()
      }),
    ms,
  )

test("fast data never shows the skeleton", async ({ page, errors }) => {
  await page.goto("/helpers")
  const watch = everVisible(page, 700)
  await page.getByTestId("load-fast").click()
  expect(await watch).toBe(false)
  await expect(page.getByTestId("load-content")).toContainText("Report #1")
  expect((await takeEvents(page)).filter((e) => e.component === "load")).toEqual([])
  expect(errors).toEqual([])
})

test("data just after the hold keeps the skeleton up long enough not to flash", async ({ page }) => {
  await page.goto("/helpers")
  await page.getByTestId("load-edge").click()
  await expect.poll(() => skeletonVisible(page)).toBe(true)
  await page.waitForTimeout(200) // data arrived ~50 ms after the skeleton; it must still be up
  expect(await skeletonVisible(page)).toBe(true)
  await expect(page.getByTestId("load-content")).toContainText("Report #1")
})

test("slow data: skeleton, then a dissolve into the content", async ({ page }, info) => {
  const reduced = meta(info).motion === "reduced"
  await page.goto("/helpers")
  await page.getByTestId("load-slow").click()
  await expect.poll(() => skeletonVisible(page)).toBe(true)
  expect(await page.evaluate(() => document.querySelector('[data-slot="load-cut"]')!.getAttribute("aria-busy"))).toBe("true")
  await expect(page.getByTestId("load-content")).toContainText("Report #1")
  await expect.poll(() => page.evaluate(() => document.querySelectorAll("[data-kf-load]").length)).toBe(0)
  expect(await page.evaluate(() => document.querySelector('[data-slot="load-cut"]')!.hasAttribute("aria-busy"))).toBe(false)
  expect((await takeEvents(page)).filter((e) => e.component === "load").map((e) => e.cut)).toEqual(reduced ? [] : ["dissolve"])
})

test("loading again during the dissolve goes back cleanly", async ({ page, errors }) => {
  await page.goto("/helpers")
  await page.getByTestId("load-flip").click()
  await expect(page.getByTestId("load-content")).toContainText("Report #2", { timeout: 5000 })
  await expect.poll(() => page.evaluate(() => document.querySelectorAll("[data-kf-load]").length)).toBe(0)
  expect(await skeletonVisible(page)).toBe(false)
  expect(errors).toEqual([])
})
