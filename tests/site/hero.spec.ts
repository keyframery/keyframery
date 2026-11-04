import type { BrowserContext, Page } from "@playwright/test"

import { agentPrompt } from "../../apps/web/lib/kinds"

import { expect, noHorizontalScroll, test } from "./kit"

async function enableClipboard(page: Page, context: BrowserContext, browserName: string) {
  // Exercise the real clipboard on Chromium, including its mobile project. Other engines do not expose
  // clipboard permissions to Playwright, so give their success-path tests a controlled clipboard.
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"])
  else await page.addInitScript(() => {
    let text = ""
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async (value: string) => { text = value }, readText: async () => text },
      configurable: true,
    })
  })
}

const hero = (page: Page) => page.locator('section[aria-labelledby="hero-title"]')

test("the headline says what Keyframery is, to people and to crawlers", async ({ page }) => {
  await page.goto("/")
  // The visible second line rotates through dialogs, tabs, lists…; the heading's name stays the plain sentence.
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Add one line. Your shadcn/ui app animates.")
  await expect(hero(page).getByText("Keyframery is a free motion layer for shadcn/ui.", { exact: false })).toBeVisible()
  expect(await noHorizontalScroll(page)).toBe(true)
})

test("the hero's main button copies the agent prompt right there, and the other one opens the docs", async ({ page, context, browserName }) => {
  await enableClipboard(page, context, browserName)
  await page.goto("/")
  const button = hero(page).getByRole("button", { name: "Copy prompt for your agent" })
  await expect(button).toBeVisible()
  await expect(hero(page).getByRole("link", { name: "Read the docs" })).toHaveAttribute("href", "/docs")
  await button.click()
  // While it says Copied, that is also its name: a button never goes nameless.
  await expect(hero(page).getByRole("button", { name: "Copied. Now paste it.", exact: true })).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(agentPrompt())
  await expect(page).toHaveURL(/\/$/) // no jump down the page
})

test("the landing is always dark, so it has no theme switch", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("[data-theme-toggle]")).toBeHidden()
  await page.goto("/docs")
  await expect(page.locator("[data-theme-toggle]").first()).toBeVisible()
})

test("the dashboard in the hero runs itself, and the switch shows it as stock shadcn/ui", async ({ page }) => {
  await page.goto("/")
  const app = page.getByRole("group", { name: "Store dashboard with Keyframery" })
  await app.scrollIntoViewIfNeeded()
  // A new order arrives at the top of the list within a few seconds.
  await expect(app.getByRole("list", { name: "Recent orders" }).getByRole("listitem").first()).toContainText("Maya Chen", { timeout: 6000 })
  await page.getByRole("button", { name: "Stock shadcn/ui" }).click()
  await expect(page.getByRole("group", { name: "Store dashboard as shadcn/ui ships it" })).toHaveAttribute("data-cut", "none")
})

test("the side-by-side shows the same click with and without Keyframery", async ({ page }) => {
  await page.goto("/#see")
  const see = page.locator("#see")
  await expect(see.locator("figure")).toHaveCount(2)
  await expect(see.locator("figure").first()).toHaveAttribute("data-cut", "none")
  await expect(see.locator("figure").nth(1)).not.toHaveAttribute("data-cut", /.*/)
})

test("the skill section gives the two Claude Code commands and copies them", async ({ page, context, browserName }) => {
  await enableClipboard(page, context, browserName)
  await page.goto("/#skill")
  const skill = page.locator("#skill")
  await expect(skill.getByText("/plugin marketplace add keyframery/keyframery")).toBeVisible()
  await expect(skill.getByText("/plugin install keyframery@keyframery")).toBeVisible()
  await skill.getByRole("button", { name: "Copy the plugin install commands" }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("/plugin marketplace add keyframery/keyframery\n/plugin install keyframery@keyframery")
  expect(await noHorizontalScroll(page)).toBe(true)
})

test("every address in the agent prompt works", async ({ request }) => {
  const paths = [...agentPrompt().matchAll(/https:\/\/keyframery\.com(\/[^\s)"]*)/g)].map((m) => m[1]).filter((p) => !p.includes("{name}"))
  expect(paths.length).toBeGreaterThanOrEqual(5)
  for (const name of ["cuts", "match-cut", "list-cut", "value-cut", "load-cut", "state-cut"]) paths.push(`/r/${name}.json`)
  for (const p of paths) expect((await request.get(p)).status(), p).toBe(200)
})
