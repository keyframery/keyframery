import { expect, takeCuts, test } from "./kit"

test("all six kinds are on the page, and their loops play real cuts", async ({ page }) => {
  await page.goto("/cuts")
  for (const id of ["rack-focus", "j-cut", "match-cut", "cut-on-action", "punch-in", "dissolve"]) await expect(page.locator(`#${id}`)).toBeVisible()
  await page.locator("#punch-in").scrollIntoViewIfNeeded()
  await expect.poll(async () => (await takeCuts(page)).length, { timeout: 8000 }).toBeGreaterThan(0)
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
