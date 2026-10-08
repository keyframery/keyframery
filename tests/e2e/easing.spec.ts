import { expect, leftovers, meta, test } from "./kit"

type EasingRead = { slot: string | null; ghost: boolean; easing: string; keys: string[] }

declare global {
  interface Window {
    __kfEasings: EasingRead[]
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__kfEasings = []
    const animate = Element.prototype.animate
    Element.prototype.animate = function (frames, options) {
      const animation = animate.call(this, frames, options)
      const effect = animation.effect as KeyframeEffect
      window.__kfEasings.push({
        slot: this.closest("[data-slot]")?.getAttribute("data-slot") ?? null,
        ghost: !!this.closest("[data-kf-ghost]"),
        easing: effect.getTiming().easing ?? "linear",
        keys: Object.keys(effect.getKeyframes()[0] ?? {}),
      })
      return animation
    }
  })
})

const setCurves = async (page: Parameters<typeof leftovers>[0]) => {
  await page.evaluate(() => {
    document.documentElement.style.setProperty("--kf-ease", "linear")
    document.documentElement.style.setProperty("--kf-ease-exit", "ease-in")
    window.__kfEasings = []
  })
}

test("CSS cuts and tuned parts resolve separate entrance and exit curves", async ({ page, errors }) => {
  await page.goto("/")
  await setCurves(page)
  const reads = await page.evaluate(() => {
    const checks = [
      ["dialog-content", "rack-focus"], ["dialog-content", "punch-in"], ["dialog-content", "fade"],
      ["sheet-content", "slide-sink"], ["sheet-content", "slide"], ["sheet-content", "fade"],
      ["popover-content", null], ["accordion-content", null], ["collapsible-content", null],
    ] as const
    return checks.map(([slot, cut]) => {
      const el = document.createElement("div")
      el.setAttribute("data-slot", slot)
      if (cut) el.setAttribute("data-cut", cut)
      document.body.append(el)
      el.setAttribute("data-state", "open")
      const enter = getComputedStyle(el).animationTimingFunction
      el.setAttribute("data-state", "closed")
      const exit = getComputedStyle(el).animationTimingFunction
      el.remove()
      return { slot, cut, enter, exit }
    })
  })
  for (const read of reads) {
    expect(read.enter, `${read.slot}/${read.cut} entrance`).toBe("linear")
    expect(read.exit, `${read.slot}/${read.cut} exit`).toBe("ease-in")
  }
  expect(errors).toEqual([])
})

test("tabs use scoped entrance curves and the exit curve for the departing panel", async ({ page, errors }, info) => {
  await page.goto("/")
  await setCurves(page)
  await page.getByTestId("tabs").evaluate((el) => (el as HTMLElement).style.setProperty("--kf-ease", "ease-in-out"))
  await page.getByTestId("tab-analytics").click()
  await expect.poll(() => page.evaluate(() => window.__kfEasings.filter((r) => r.slot === "tabs-content" && !r.ghost).map((r) => r.easing))).toContain("ease-in-out")
  if (meta(info).motion !== "reduced") {
    const reads = await page.evaluate(() => window.__kfEasings)
    expect(reads.filter((r) => r.slot === "tabs-content-ghost").map((r) => r.easing)).toEqual(["ease-in"])
    expect(reads.filter((r) => r.keys.includes("height")).map((r) => r.easing)).toEqual(["ease-in-out"])
    // The pill keeps its own whip curve: its stretch keyframe is timed for it.
    expect(reads.filter((r) => r.keys.includes("scale")).map((r) => r.easing)).toEqual(["cubic-bezier(0.65, 0, 0.35, 1)"])
  }
  await expect.poll(() => leftovers(page)).toBe(0)
  expect(errors).toEqual([])
})

test("the sinking page changes curves when the sheet closes", async ({ page }, info) => {
  test.skip(meta(info).motion === "reduced", "reduced motion does not sink the page")
  await page.goto("/")
  await setCurves(page)
  await page.getByTestId("sheet-trigger").click()
  await expect.poll(() => page.evaluate(() => {
    const el = document.querySelector('[data-kf-sink="on"]')
    return el ? getComputedStyle(el).transitionTimingFunction : null
  })).toBe("linear, linear, linear")
  await page.keyboard.press("Escape")
  await expect.poll(() => page.evaluate(() => {
    const el = document.querySelector('[data-kf-sink="off"]')
    return el ? getComputedStyle(el).transitionTimingFunction : null
  })).toBe("ease-in")
})

test("action toasts use the configured entrance curve", async ({ page, errors }, info) => {
  test.skip(meta(info).motion === "reduced", "reduced motion skips toast flights")
  await page.goto("/")
  await setCurves(page)
  await page.getByTestId("toast-trigger").click()
  await expect.poll(() => page.evaluate(() => window.__kfEasings.filter((r) => r.keys.includes("filter")).map((r) => r.easing))).toContain("linear")
  expect(errors).toEqual([])
})

test("MatchCut opens with the entrance curve and returns with the exit curve", async ({ page, errors }) => {
  await page.goto("/helpers")
  await setCurves(page)
  await page.getByTestId("profile-open").click()
  await expect.poll(() => page.evaluate(() => window.__kfEasings.filter((r) => r.slot === "match-cut").map((r) => r.easing))).toContain("linear")
  await expect.poll(() => leftovers(page)).toBe(0)
  await page.evaluate(() => { window.__kfEasings = [] })
  await page.keyboard.press("Escape")
  await expect.poll(() => page.evaluate(() => window.__kfEasings.filter((r) => r.slot === "match-cut").map((r) => r.easing))).toContain("ease-in")
  await expect.poll(() => leftovers(page)).toBe(0)
  expect(errors).toEqual([])
})

test("ListCut arrivals, departures and glides share the theme curves", async ({ page, errors }, info) => {
  await page.goto("/helpers")
  await setCurves(page)
  await page.getByTestId("composer").fill("New record")
  await page.getByTestId("send").click()
  await expect.poll(() => page.evaluate(() => window.__kfEasings.filter((r) => r.slot === "list-cut-item" && !r.ghost).map((r) => r.easing))).toContain("linear")
  await page.evaluate(() => { window.__kfEasings = [] })
  await page.getByTestId("del-2").click()
  if (meta(info).motion !== "reduced") {
    const reads = await page.evaluate(() => window.__kfEasings)
    expect(reads.filter((r) => r.ghost).map((r) => r.easing)).toEqual(["ease-in"])
    expect(reads.filter((r) => !r.ghost).map((r) => r.easing)).toContain("linear")
  }
  await expect.poll(() => leftovers(page)).toBe(0)
  expect(errors).toEqual([])
})

test("ValueCut uses the entrance curve for new digits and exit curve for old digits", async ({ page, errors }, info) => {
  test.skip(meta(info).motion === "reduced", "reduced motion swaps values instantly")
  await page.goto("/helpers")
  await setCurves(page)
  await page.getByTestId("value-inc").click()
  const reads = await page.evaluate(() => window.__kfEasings.filter((r) => r.slot === "value-cut"))
  // New digits follow the theme; the punch keeps the ease-out its 0.35 peak is timed for.
  expect(reads.filter((r) => !r.ghost).map((r) => r.easing)).toEqual(["linear", "ease-out"])
  expect(reads.filter((r) => r.ghost).map((r) => r.easing)).toEqual(["ease-in"])
  await expect.poll(() => leftovers(page)).toBe(0)
  expect(errors).toEqual([])
})

test("LoadCut applies the entrance curve to content and resize, and exit curve to the skeleton", async ({ page, errors }, info) => {
  test.skip(meta(info).motion === "reduced", "reduced motion swaps loader phases instantly")
  await page.goto("/helpers")
  await setCurves(page)
  await page.getByTestId("load-slow").click()
  await expect.poll(() => page.evaluate(() => window.__kfEasings.filter((r) => r.slot === "load-cut").map((r) => r.easing))).toContain("ease-in")
  const reads = await page.evaluate(() => window.__kfEasings.filter((r) => r.slot === "load-cut"))
  expect(reads.filter((r) => r.keys.includes("height")).map((r) => r.easing)).toEqual(["linear"])
  expect(reads.filter((r) => r.easing === "linear")).toHaveLength(3)
  await expect.poll(() => page.evaluate(() => document.querySelectorAll("[data-kf-load]").length)).toBe(0)
  expect(errors).toEqual([])
})

test("invalid custom easing falls back without interrupting a list update", async ({ page, errors }) => {
  await page.goto("/helpers")
  await setCurves(page)
  for (const [index, easing] of ["ease, linear", "spring", "cubic-bezier(2, 0, 1, 1)"].entries()) {
    await page.evaluate((value) => document.documentElement.style.setProperty("--kf-ease", value), easing)
    await page.getByTestId("composer").fill(`Record ${index}`)
    await page.getByTestId("send").click()
    await expect(page.getByTestId(`msg-${index + 4}`)).toBeVisible()
  }
  const reads = await page.evaluate(() => window.__kfEasings.filter((r) => r.slot === "list-cut-item" && !r.ghost))
  // Existing items may also glide as the list grows; only arrivals animate opacity.
  expect(reads.filter((read) => read.keys.includes("opacity"))).toHaveLength(3)
  for (const read of reads) expect(read.easing).toBe("cubic-bezier(0.22, 1, 0.36, 1)")
  await expect.poll(() => leftovers(page)).toBe(0)
  expect(errors).toEqual([])
})
