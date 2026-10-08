import type { Page } from "@playwright/test"

import { expect, meta, ownErrors, takeEvents, test } from "./kit"

declare global {
  interface Window {
    __kfDraws: string[]
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__kfDraws = []
    document.addEventListener("animationstart", (e) => window.__kfDraws.push((e as AnimationEvent).animationName), true)
  })
})

const svgStyle = (page: Page, selector: string, prop: "rotate" | "translate" | "display") =>
  page.evaluate(([s, p]) => getComputedStyle(document.querySelector(s)!)[p as "rotate"], [selector, prop] as const)

async function holdOn(page: Page, selector: string) {
  const box = (await page.locator(selector).first().boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
}

test("the accordion's chevron turns instead of being swapped", async ({ page, errors }, info) => {
  await page.goto("/sink/accordion-example")
  const trigger = page.locator('[data-slot="accordion-trigger"][aria-expanded="false"]').first()
  await trigger.evaluate((el) => el.setAttribute("data-test-trigger", ""))
  await trigger.click()
  const first = '[data-test-trigger] > [data-slot="accordion-trigger-icon"]:first-of-type'
  const second = '[data-test-trigger] > [data-slot="accordion-trigger-icon"] + [data-slot="accordion-trigger-icon"]'
  if (meta(info).motion === "full") {
    await expect.poll(() => svgStyle(page, first, "rotate")).toBe("180deg")
    expect(await svgStyle(page, second, "display")).toBe("none")
  } else {
    // Reduced motion keeps shadcn's own swap.
    await expect.poll(() => svgStyle(page, second, "display")).not.toBe("none")
  }
  expect(ownErrors(errors)).toEqual([])
})

test("a dialog's close ✕ turns while pressed, and a carousel arrow nudges", async ({ page }, info) => {
  test.skip(meta(info).motion === "reduced", "no movement under reduced motion")
  await page.goto("/sink/carousel-example")
  await holdOn(page, '[data-slot="carousel-next"]:not([disabled])')
  await expect.poll(() => svgStyle(page, '[data-slot="carousel-next"]:not([disabled]) > svg', "translate")).toBe("2px")
  await page.mouse.up()

  await page.goto("/sink/dialog-example")
  await page.locator('[data-slot="dialog-trigger"]').first().click()
  const close = '[data-slot="dialog-content"] [data-slot="dialog-close"]:has(> svg)'
  await expect(page.locator(close).first()).toBeVisible()
  // Press only once the dialog has finished flying in, or the pointer lands where the button was.
  await expect.poll(() => page.evaluate(() => document.querySelector('[data-slot="dialog-content"]')!.getAnimations().length)).toBe(0)
  await holdOn(page, close)
  await expect.poll(() => svgStyle(page, `${close} > svg`, "rotate")).toBe("90deg")
  await page.mouse.up()
})

test("a menu's checkbox item draws its tick when checked", async ({ page, errors }) => {
  await page.goto("/sink/dropdown-menu-example")
  const item = '[data-slot="dropdown-menu-checkbox-item"]:not([data-checked]):not([data-state="checked"]):not([data-disabled]):not([aria-disabled="true"])'
  // The "With Checkboxes" example's menu.
  await page.getByRole("button", { name: "Checkboxes", exact: true }).click()
  await expect(page.locator(item).first()).toBeVisible()
  await page.evaluate(() => (window.__kfDraws = []))
  await page.locator(item).first().click()
  await expect.poll(() => page.evaluate(() => window.__kfDraws.includes("kf-draw"))).toBe(true)
  expect(ownErrors(errors)).toEqual([])
})

test("an alert dialog's icon redraws itself as the dialog arrives", async ({ page, errors }, info) => {
  await page.goto("/sink/alert-dialog-example")
  await takeEvents(page)
  await page.getByRole("button", { name: "Default (Media)" }).click()
  const icons = async () => (await takeEvents(page)).filter((e) => e.cut === "icon" && e.component === "alert-dialog")
  if (meta(info).motion === "full") await expect.poll(async () => (await icons()).length).toBe(1)
  else {
    await page.waitForTimeout(400)
    expect(await icons()).toEqual([])
  }
  expect(ownErrors(errors)).toEqual([])
})

test("a success toast's icon draws itself as the toast lands", async ({ page }, info) => {
  test.skip(meta(info).motion === "reduced", "the icon stays still under reduced motion")
  await page.goto("/sink/sonner-example")
  await takeEvents(page)
  // Sonner's markup for a success toast, as its own renderer writes it.
  await page.evaluate(() => {
    const li = document.createElement("li")
    li.setAttribute("data-sonner-toast", "")
    li.setAttribute("data-type", "success")
    li.innerHTML =
      '<div data-icon=""><svg class="lucide lucide-circle-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg></div><div data-title="">Saved</div>'
    document.body.append(li)
  })
  await expect.poll(async () => (await takeEvents(page)).filter((e) => e.cut === "icon" && e.component === "toast").length).toBe(1)
})

test("pressing a button plays its icon's move; hover moves are opt-in", async ({ page, errors }, info) => {
  const button = '[data-slot="button"]:has(> svg.lucide-arrow-right):not([disabled])'
  const moving = () => page.evaluate((s) => document.querySelector(`${s} > svg`)!.hasAttribute("data-kf-moving"), button)
  await page.goto("/sink/button-example")
  const box = (await page.locator(button).first().boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.waitForTimeout(200)
  expect(await moving()).toBe(false) // hovering alone does nothing by default
  await page.mouse.down()
  if (meta(info).motion === "full") await expect.poll(moving).toBe(true)
  else {
    await page.waitForTimeout(150)
    expect(await moving()).toBe(false)
  }
  await page.mouse.up()
  await expect.poll(moving).toBe(false)

  if (meta(info).motion === "full") {
    await page.goto("/sink/button-example?icons=hover")
    const b2 = (await page.locator(button).first().boundingBox())!
    await page.mouse.move(0, 0)
    await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2, { steps: 4 })
    await expect.poll(moving).toBe(true)
  }
  expect(ownErrors(errors)).toEqual([])
})
