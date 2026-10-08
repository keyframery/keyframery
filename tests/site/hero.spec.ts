import type { Locator, Page } from "@playwright/test"

import { agentPrompt } from "../../apps/web/lib/kinds"

import { expect, noHorizontalScroll, takeCuts, test } from "./kit"

const stock = (page: Page) => page.getByRole("region", { name: "shadcn/ui as it ships" })
const kf = (page: Page) => page.getByRole("region", { name: "shadcn/ui with Keyframery" })

/** The page can hydrate after <Cuts /> mounts: wait until the hero's own listeners are attached. */
async function ready(page: Page) {
  await page.locator('[data-testid="hero-stage"][data-ready]').waitFor({ state: "attached" })
}

/** Takes over from the self-playing demo, the way a tap or click on the stage does. */
async function takeOver(page: Page) {
  const stage = page.getByTestId("hero-stage")
  await stage.dispatchEvent("pointerdown")
  await stage.dispatchEvent("click")
}

async function center(l: Locator) {
  const b = (await l.boundingBox())!
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}

test("the first line says what Keyframery is, and the install command is right there", async ({ page }, info) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Add one line. Your shadcn/ui app animates.")
  // The command has to work in a fresh project, before @keyframery is registered there.
  const hero = page.locator('section[aria-labelledby="hero-title"]')
  await expect(hero.getByRole("link", { name: "Get started" })).toHaveAttribute("href", "/docs/installation")
  // Phones skip the theme sentence, so the demo stays inside its autoplay threshold.
  if (info.project.name !== "phone") await expect(hero.getByRole("link", { name: "motion theme" })).toHaveAttribute("href", "/theme")
  await expect(hero.getByText("npx shadcn add https://keyframery.com/r/cuts.json")).toBeVisible()
  // "Copied" shows for 1.6 s. Under load the runner can miss that window, so the page records the label change.
  const copy = hero.getByRole("button", { name: "Copy the install command" })
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

test("a touch that turns into a scroll doesn't stop the demo", async ({ page }, info) => {
  test.skip(info.project.name !== "phone", "touch")
  await page.goto("/")
  await ready(page)
  const cursor = kf(page).getByTestId("hero-cursor")
  await expect(cursor).toBeVisible({ timeout: 4000 })
  // A finger landing on the stage fires pointerdown whether it ends as a tap or a scroll.
  await page.getByTestId("hero-stage").dispatchEvent("pointerdown", { pointerType: "touch", isPrimary: true })
  await page.waitForTimeout(1200)
  await expect(cursor).toBeVisible()
  await expect(page.getByRole("button", { name: "Pause demo" })).toBeVisible()
})

test("on a phone, taking over keeps the copy the visitor is looking at", async ({ page }, info) => {
  test.skip(info.project.name !== "phone", "phone layout only")
  await page.goto("/")
  await ready(page)
  const withKf = page.getByRole("group", { name: "Compare" }).getByRole("button", { name: "With Keyframery" })
  await expect(withKf).toHaveAttribute("aria-pressed", "true")
  // Seats go 3 → 4 on the demo's invite and back to 3 on its remove; take over in the wait after the remove.
  const seats = (n: number) => page.locator('[data-side="kf"] .sr-only').filter({ hasText: new RegExp(`^${n}$`) })
  await expect(seats(4)).toHaveCount(1, { timeout: 15000 })
  await expect(seats(3)).toHaveCount(1, { timeout: 15000 })
  await takeOver(page)
  await page.waitForTimeout(2500)
  await expect(withKf).toHaveAttribute("aria-pressed", "true")
})

test("the demo has a pause button that keeps focus, and keyboard focus in the stage pauses it", async ({ page, request }, info) => {
  test.skip(info.project.name === "phone", "desktop layout")
  // The same button is in the server HTML, so it doesn't flash in after hydration.
  expect(await (await request.get("/")).text()).toContain("Pause demo")
  await page.goto("/")
  await ready(page)
  const cursor = kf(page).getByTestId("hero-cursor")
  await expect(cursor).toBeVisible({ timeout: 4000 })
  const toggle = page.getByRole("button", { name: "Pause demo" })
  await toggle.focus()
  await page.keyboard.press("Enter")
  await expect(cursor).toBeHidden()
  await expect(page.getByRole("button", { name: "Play demo" })).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(cursor).toBeVisible({ timeout: 4000 })
  await expect(page.getByRole("button", { name: "Pause demo" })).toBeFocused()
  // Moving keyboard focus into the stage hands it to the visitor.
  await kf(page).getByRole("button", { name: "Invite", exact: true }).focus()
  await expect(cursor).toBeHidden()
  await expect(page.getByRole("button", { name: "Play demo" })).toBeVisible()
})

test("the invite dialog keeps the email it showed while it closes", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "desktop layout")
  await page.goto("/?demo=off")
  await ready(page)
  await kf(page).getByRole("button", { name: "Invite", exact: true }).click()
  const input = page.locator('[data-side="kf"] [data-slot="dialog-content"] input')
  await expect(input).toHaveValue("maya@acme.com")
  await kf(page).getByRole("button", { name: "Send invite" }).click()
  // Read it as the dialog starts closing: it must not switch to the next person's email mid-exit.
  expect(await input.inputValue()).toBe("maya@acme.com")
})

test("a button in the hero copies setup instructions for your coding agent", async ({ page, context }, info) => {
  // On phones the hero keeps the demo in view instead (it starts when a quarter of it shows); the install section has the button.
  test.skip(info.project.name === "phone", "desktop layout")
  await page.goto("/")
  const hero = page.locator('section[aria-labelledby="hero-title"]')
  const button = hero.getByRole("button", { name: "Copy for your coding agent" })
  await expect(button).toBeVisible()
  expect(await noHorizontalScroll(page)).toBe(true)
  // Reading the clipboard back needs a permission only Chromium grants to tests.
  if (info.project.name === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await button.click()
  await expect(page.getByRole("status").filter({ hasText: "Copied" }).first()).toBeAttached()
  // While it says Copied, that is also its name: a button never goes nameless.
  await expect(hero.getByRole("button", { name: "Copied. Now paste it.", exact: true })).toBeVisible()
  if (info.project.name === "chromium") expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(agentPrompt())
})

test("the install section offers the same button next to the Claude Code plugin", async ({ page }) => {
  await page.goto("/")
  const install = page.locator('section[aria-labelledby="install-title"]')
  await expect(install.getByRole("button", { name: "Copy for your coding agent" })).toBeVisible()
  expect(await noHorizontalScroll(page)).toBe(true)
  await expect(install.getByText("/plugin install keyframery@keyframery")).toBeVisible()
})

test("every address in the agent prompt works", async ({ request }) => {
  const paths = [...agentPrompt().matchAll(/https:\/\/keyframery\.com(\/[^\s)"]*)/g)].map((m) => m[1]).filter((p) => p !== "/mcp" && !p.includes("{name}"))
  expect(paths.length).toBeGreaterThanOrEqual(5)
  for (const name of ["cuts", "match-cut", "list-cut", "value-cut", "load-cut", "state-cut"]) paths.push(`/r/${name}.json`)
  for (const p of paths) expect((await request.get(p)).status(), p).toBe(200)
})
