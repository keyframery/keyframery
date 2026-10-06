import { expect, meta, sample, takeEvents, test } from "./kit"

const TOASTS = [
  { name: "sonner", trigger: "toast-trigger", selector: "[data-sonner-toast]", component: "sonner", baseOnly: false },
  { name: "Base UI toast", trigger: "base-toast-trigger", selector: '[data-slot="toast"]', component: "toast", baseOnly: true },
]

for (const t of TOASTS) {
  test(`${t.name}: flies from the button you pressed`, async ({ page, errors }, info) => {
    test.skip(t.baseOnly && meta(info).base !== "base", "Radix has no Base UI toast")
    const reduced = meta(info).motion === "reduced"
    await page.goto("/")
    const frames = await sample(page, t.selector, 700, () => page.getByTestId(t.trigger).click())
    const on = frames.filter((f) => f.on)
    expect(on.length).toBeGreaterThan(0)
    if (reduced) expect(on.every((f) => f.tr === "none")).toBe(true)
    else {
      expect(on[0].tr).toMatch(/^-\d[\d.]*px -\d/) // starts at the button: up and to the left of the toast
      expect(on[on.length - 1].tr).toBe("none")
    }
    await page.waitForTimeout(200)
    expect((await takeEvents(page)).filter((e) => e.component === t.component).map((e) => e.cut)).toEqual(reduced ? [] : ["cut-on-action"])
    expect(errors).toEqual([])
  })
}
