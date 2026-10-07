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
    // WebKit reports a Next.js prefetch (?_rsc=) cancelled by leaving the page as an "access control" error.
    const cancelledPrefetch = (text: string) => /_rsc=/.test(text) && /access control checks/.test(text)
    page.on("console", (m) => {
      if (m.type() === "error" && !cancelledPrefetch(m.text()) && !/https?:\/\/(?!localhost)/.test(m.text())) errors.push(m.text())
    })
    page.on("pageerror", (e) => {
      if (!cancelledPrefetch(String(e))) errors.push(String(e))
    })
    await use(errors)
  },
})
export { expect }

/**
 * True when the page is no wider than the viewport it was opened with. On a phone the browser widens its layout
 * viewport (innerWidth) to fit content that is too wide and zooms out, so compare with the configured width.
 */
export const noHorizontalScroll = async (page: Page) => {
  const width = page.viewportSize()?.width ?? 0
  return page.evaluate((w) => document.documentElement.scrollWidth <= w + 1, width)
}
export const takeCuts = (page: Page) => page.evaluate(() => (window as unknown as { __cuts: { cut: string; component: string }[] }).__cuts.splice(0))
