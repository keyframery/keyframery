import { expect, takeCuts, test } from "./kit"

test("all seven kinds are on the page, and their loops play real cuts", async ({ page }) => {
  await page.goto("/cuts")
  for (const [id, docs] of [
    ["rack-focus", "/docs/components/dialog"],
    ["j-cut", "/docs/components/tabs"],
    ["match-cut", "/docs/helpers/match-cut"],
    ["cut-on-action", "/docs/helpers/list-cut"],
    ["punch-in", "/docs/helpers/value-cut"],
    ["dissolve", "/docs/helpers/load-cut"],
    ["state-cut", "/docs/helpers/state-cut"],
  ]) {
    const section = page.locator(`section#${id}`)
    await expect(section).toBeVisible()
    await expect(section.getByRole("link", { name: "Read the docs" })).toHaveAttribute("href", docs)
  }
  await page.locator("#punch-in").scrollIntoViewIfNeeded()
  await expect.poll(async () => (await takeCuts(page)).length, { timeout: 8000 }).toBeGreaterThan(0)
})

test("the examples page navigation reaches the complete component and app demos", async ({ page }) => {
  await page.goto("/cuts")
  const navigation = page.getByRole("navigation", { name: "Animation example sections" })
  await navigation.getByRole("link", { name: "Component explorer" }).click()
  await expect(page).toHaveURL(/#component-explorer$/)
  await expect(page.getByTestId("component-explorer")).toBeInViewport()
  await navigation.getByRole("link", { name: "App screens" }).click()
  await expect(page).toHaveURL(/#app-examples$/)
  await expect(page.getByTestId("wall")).toBeInViewport()
})

test("the StateCut example links to its API and can change content", async ({ page }) => {
  await page.goto("/cuts")
  const section = page.locator("#state-cut")
  await section.scrollIntoViewIfNeeded()
  await expect(section.getByRole("link", { name: "Read the docs" })).toHaveAttribute("href", "/docs/helpers/state-cut")
  await section.getByRole("button", { name: "Change status" }).click()
  await expect.poll(async () => (await takeCuts(page)).some((c) => c.component === "state"), { timeout: 8000 }).toBe(true)
})

test("under reduced motion the loops wait for Play", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" })
  const page = await ctx.newPage()
  await page.goto("http://localhost:4500/cuts")
  await expect(page.getByRole("button", { name: "Play the rack focus loop" })).toBeVisible()
  await ctx.close()
})

test("the match cut loop really grows the card into its page", async ({ page }) => {
  await page.goto("/cuts")
  await page.locator("#match-cut").scrollIntoViewIfNeeded()
  await expect.poll(async () => (await takeCuts(page)).some((c) => c.component === "match"), { timeout: 8000 }).toBe(true)
})
