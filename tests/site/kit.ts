import { expect, test as base, type Page } from "@playwright/test"

export const test = base.extend<{ errors: string[] }>({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      ;(window as unknown as { __cuts: unknown[] }).__cuts = []
      document.addEventListener("keyframery:cut", (e) => (window as unknown as { __cuts: unknown[] }).__cuts.push((e as CustomEvent).detail))
    })
    // Pages are server-rendered, so a button can be visible before React hydrates it. Every goto waits for
    // <Cuts /> to mount (html[data-kf]), which happens during hydration.
    const goto = page.goto.bind(page)
    page.goto = async (url, options) => {
      const res = await goto(url, options)
      await page.locator("html[data-kf]").waitFor({ state: "attached", timeout: 10_000 }).catch(() => {})
      return res
    }
    await use(page)
  },
  errors: async ({ page }, use) => {
    const errors: string[] = []
    page.on("console", (m) => {
      if (m.type() === "error" && !/https?:\/\/(?!localhost)/.test(m.text())) errors.push(m.text())
    })
    page.on("pageerror", (e) => errors.push(String(e)))
    await use(errors)
  },
})
export { expect }

/** True when the page is no wider than the viewport. */
export const noHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
export const takeCuts = (page: Page) => page.evaluate(() => (window as unknown as { __cuts: { cut: string; component: string }[] }).__cuts.splice(0))
