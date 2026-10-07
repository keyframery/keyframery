import type { Locator, Page } from "@playwright/test"

import { expect, takeCuts, test } from "./kit"

const stock = (page: Page) => page.getByRole("region", { name: "shadcn/ui as it ships" })
const kf = (page: Page) => page.getByRole("region", { name: "shadcn/ui with Keyframery" })

/** The page can hydrate after <Cuts /> mounts: wait until the hero's own listeners are attached. */
async function ready(page: Page) {
  await page.locator('[data-testid="hero-stage"][data-ready]').waitFor({ state: "attached" })
}

/** Pauses the self-playing demo, so the test's own clicks are the only ones. */
async function takeOver(page: Page) {
  await page.getByTestId("hero-stage").dispatchEvent("pointerdown")
}

async function center(l: Locator) {
  const b = (await l.boundingBox())!
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}

test("the first line says what Keyframery is, and the install command is right there", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Add one line. Your shadcn/ui app animates.")
  await expect(page.getByText("npx shadcn add @keyframery/cuts").first()).toBeVisible()
  // "Copied" shows for 1.6 s. Under load the runner can miss that window, so the page records the label change.
  const copy = page.getByRole("button", { name: "Copy the install command" }).first()
  await copy.evaluate((el) => {
    const w = window as unknown as { __labels: string[] }
    w.__labels = []
    new MutationObserver(() => w.__labels.push(el.getAttribute("aria-label") ?? "")).observe(el, { attributes: true, attributeFilter: ["aria-label"] })
  })
  await copy.click()
  await expect.poll(() => page.evaluate(() => (window as unknown as { __labels: string[] }).__labels)).toContain("Copied")
})

test("the hero shows the same app twice: stock shadcn, and shadcn with Keyframery", async ({ page }) => {
  await page.goto("/")
  // By data-side, not role: on phones one copy is hidden, and hidden regions drop out of the accessibility tree.
  await expect(page.locator('[data-side="stock"]')).toHaveAttribute("data-cut", "none")
  await expect(page.locator('[data-side="kf"]')).not.toHaveAttribute("data-cut", "none")
  // No timeline any more.
  await expect(page.getByRole("region", { name: "Cut timeline" })).toHaveCount(0)
})

test("a click on either side plays on both, and only the Keyframery side cuts, from its own button", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "both sides are on screen on desktop layouts")
  await page.goto("/?demo=off")
  await ready(page)
  await takeCuts(page)
  // Click the STOCK side: the Keyframery dialog must still grow from the Keyframery side's own Invite button.
  await stock(page).getByRole("button", { name: "Invite", exact: true }).click()
  await expect(stock(page).getByRole("dialog", { name: "Invite a teammate" })).toBeVisible()
  const dialog = kf(page).getByRole("dialog", { name: "Invite a teammate" })
  await expect(dialog).toBeVisible()
  const cuts = await takeCuts(page)
  expect(cuts.filter((c) => c.cut === "rack-focus").length).toBe(1)
  // The cut aims from the dialog's centre toward the opener: --kf-dx/--kf-dy = opener centre − dialog centre.
  await page.waitForTimeout(500) // let the entrance finish, so the box is the resting one
  const opener = await center(kf(page).getByRole("button", { name: "Invite", exact: true }))
  const at = await center(dialog)
  const dx = await dialog.evaluate((el) => parseFloat((el as HTMLElement).style.getPropertyValue("--kf-dx")))
  const dy = await dialog.evaluate((el) => parseFloat((el as HTMLElement).style.getPropertyValue("--kf-dy")))
  expect(Math.abs(dx - (opener.x - at.x))).toBeLessThan(6)
  expect(Math.abs(dy - (opener.y - at.y))).toBeLessThan(6)

  await kf(page).getByRole("button", { name: "Send invite" }).click()
  await expect(stock(page).getByText("Maya Chen")).toBeVisible()
  await expect(kf(page).getByText("Maya Chen")).toBeVisible()
  await expect(kf(page).locator(".sr-only").filter({ hasText: /^4$/ })).toHaveCount(1)
  const after = (await takeCuts(page)).map((c) => `${c.component}:${c.cut}`)
  expect(after).toEqual(expect.arrayContaining(["list:cut-on-action", "value:punch-in"]))

  await kf(page).getByRole("tab", { name: "Activity" }).click()
  // By name: while shadcn's own tab transition runs, the old panel is still mounted (inert).
  await expect(stock(page).getByRole("tabpanel", { name: "Activity" })).toContainText("Maya Chen was invited")
  expect((await takeCuts(page)).map((c) => `${c.component}:${c.cut}`)).toContain("tabs:j-cut")
})

test("the demo plays itself, and stops for good once you take over", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "desktop layout")
  await page.goto("/")
  await ready(page)
  const cursor = kf(page).getByTestId("hero-cursor")
  await expect(cursor).toBeVisible({ timeout: 4000 })
  await expect.poll(async () => (await takeCuts(page)).length, { timeout: 6000 }).toBeGreaterThan(0)
  await takeOver(page)
  await expect(cursor).toBeHidden()
})

test("under reduced motion the demo waits for a click", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  await page.goto("http://localhost:4500/")
  await page.locator("html[data-kf]").waitFor({ state: "attached" })
  await page.waitForTimeout(2500)
  await expect(kf(page).getByTestId("hero-cursor")).toBeHidden()
  await expect(kf(page).getByRole("dialog", { name: "Invite a teammate" })).toBeHidden()
  await ctx.close()
})

test("on a phone one side shows at a time, with a switch between them", async ({ page }, info) => {
  test.skip(info.project.name !== "phone", "phone layout only")
  await page.goto("/")
  await ready(page)
  const sw = page.getByRole("group", { name: "Compare" })
  await expect(sw).toBeVisible()
  await sw.getByRole("button", { name: "shadcn/ui" }).click()
  await expect(stock(page)).toBeVisible()
  await expect(kf(page)).toBeHidden()
  await sw.getByRole("button", { name: "With Keyframery" }).click()
  await expect(kf(page)).toBeVisible()
  await expect(stock(page)).toBeHidden()
})
