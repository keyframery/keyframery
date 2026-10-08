import type { Page } from "@playwright/test"

import { expect, meta, ownErrors, takeEvents, test } from "./kit"

const events = async (page: Page, cut: string, component?: string) =>
  (await takeEvents(page)).filter((e) => e.cut === cut && (!component || e.component === component))

/** Inserts a copy of the first `slot` part, either on its own or wrapped in a new container. */
async function insertCopy(page: Page, slot: string, wrapped: boolean) {
  await page.evaluate(
    ([s, w]) => {
      const original = document.querySelector(`[data-slot="${s}"]`)!
      const copy = original.cloneNode(true) as Element
      if (!w) original.after(copy)
      else {
        const page = document.createElement("section")
        page.append(copy)
        original.after(page)
      }
    },
    [slot, wrapped] as const,
  )
}

test("an alert shown on its own eases in; one that arrives with a whole new page doesn't", async ({ page, errors }) => {
  await page.goto("/sink/alert-example")
  await takeEvents(page)
  await insertCopy(page, "alert", false)
  await expect.poll(async () => (await events(page, "appear", "alert")).length).toBe(1)
  await insertCopy(page, "alert", true)
  await page.waitForTimeout(300)
  expect(await events(page, "appear", "alert")).toEqual([])
  expect(ownErrors(errors)).toEqual([])
})

test("an avatar's photo and a combobox chip ease in as they arrive", async ({ page }) => {
  await page.goto("/sink/avatar-example")
  await takeEvents(page)
  await page.evaluate(() => {
    const img = document.createElement("img")
    img.setAttribute("data-slot", "avatar-image")
    img.alt = ""
    document.querySelector('[data-slot="avatar"]')!.append(img)
  })
  await expect.poll(async () => (await events(page, "appear", "avatar-image")).length).toBe(1)

  await page.goto("/sink/combobox-example")
  await takeEvents(page)
  await page.evaluate(() => {
    const chip = document.createElement("span")
    chip.setAttribute("data-slot", "combobox-chip")
    chip.textContent = "Next.js"
    document.body.append(chip)
  })
  await expect.poll(async () => (await events(page, "appear", "combobox-chip")).length).toBe(1)
})

test("an attachment's finished upload punches, a failed one shakes", async ({ page }, info) => {
  await page.goto("/sink/attachment-example")
  await page.evaluate(() => document.querySelector('[data-slot="attachment"]')!.setAttribute("data-state", "uploading"))
  await takeEvents(page)
  await page.evaluate(() => document.querySelector('[data-slot="attachment"]')!.setAttribute("data-state", "done"))
  await expect.poll(async () => (await events(page, "appear", "attachment")).length).toBe(1)
  // Record the shake as it starts: under load a 240 ms animation can finish before anyone looks for it.
  await page.evaluate(() => {
    const animate = Element.prototype.animate
    const w = window as unknown as { __shaken: boolean }
    w.__shaken = false
    Element.prototype.animate = function (...args) {
      if (this.matches('[data-slot="attachment"]')) w.__shaken = true
      return animate.apply(this, args)
    }
    document.querySelector('[data-slot="attachment"]')!.setAttribute("data-state", "error")
  })
  await expect.poll(async () => (await events(page, "error", "attachment")).length).toBe(1)
  expect(await page.evaluate(() => (window as unknown as { __shaken: boolean }).__shaken)).toBe(meta(info).motion === "full")
})

test("the next month slides in from the side you went toward; the keyboard changes it instantly", async ({ page, errors }) => {
  await page.goto("/sink/calendar-example")
  const calendar = page.locator('[data-slot="calendar"]').first()
  await takeEvents(page)
  await calendar.locator(".rdp-button_next").click()
  await expect.poll(async () => (await events(page, "j-cut", "calendar")).length).toBeGreaterThan(0)

  await page.locator('[data-slot="calendar"]').first().locator("[data-day]").first().focus()
  await takeEvents(page)
  await page.keyboard.press("PageDown")
  await page.waitForTimeout(400)
  expect(await events(page, "j-cut", "calendar")).toEqual([])
  expect(ownErrors(errors)).toEqual([])
})

test("the next question slides in like a tab", async ({ page, errors }) => {
  await page.goto("/sink/questionnaire-example")
  const q = page.locator('[data-slot="questionnaire"]').first()
  await q.locator('[data-slot="questionnaire-choice"]:visible').first().click({ force: true })
  await takeEvents(page)
  await q.locator('[data-slot="questionnaire-next"]:visible').first().click()
  await expect.poll(async () => (await events(page, "j-cut", "questionnaire")).length).toBe(1)
  expect(ownErrors(errors)).toEqual([])
})
