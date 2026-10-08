import { expect, test } from "./kit"

const hero = (page: import("@playwright/test").Page) => page.locator('section[aria-labelledby="hero-title"]')

test("the site is set in Geist, with Geist Mono for code", async ({ page }) => {
  await page.goto("/")
  const families = await page.evaluate(() => ({
    body: getComputedStyle(document.body).fontFamily,
    code: getComputedStyle(document.querySelector("code")!).fontFamily,
  }))
  expect(families.body).toMatch(/Geist/)
  expect(families.body).not.toMatch(/Schibsted/)
  expect(families.code).toMatch(/Geist Mono/)
})

test("the hero names Claude Code first without leaving other agents out, states the facts, and links GitHub", async ({ page }) => {
  await page.goto("/")
  const h = hero(page)
  await expect(h.getByRole("link", { name: /Works with Claude Code, Codex, Cursor and more/ })).toHaveAttribute("href", "/docs/ai-tools")
  const facts = h.getByRole("list", { name: "Facts" })
  for (const fact of ["7 KB gzipped", "0 dependencies", "Base UI and Radix", "MIT licensed"]) await expect(facts).toContainText(fact)
  await expect(h.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/keyframery/keyframery")
})

test("a row of logos says what Keyframery works with", async ({ page }) => {
  await page.goto("/")
  const logos = hero(page).getByRole("list", { name: "Works with" })
  for (const name of ["shadcn/ui", "Base UI", "Radix", "Next.js", "Vite", "React Router"]) await expect(logos).toContainText(name)
})

test("the six kinds are a bento: the two automatic kinds are wider than the four helpers", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "one column on phones")
  await page.goto("/")
  const tiles = page.getByRole("region", { name: "Every way a screen changes, animated" }).locator("article")
  await expect(tiles).toHaveCount(6)
  const widths = await tiles.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)))
  expect(Math.min(widths[0], widths[1])).toBeGreaterThan(Math.max(...widths.slice(2)) * 1.4)
})

test("the layout snippet is syntax-highlighted, with the <Cuts /> line marked", async ({ page }) => {
  await page.goto("/")
  const snippet = page.locator('section[aria-labelledby="install-title"] pre.shiki')
  await expect(snippet).toHaveCount(1)
  expect(await snippet.locator('span[style*="--shiki"]').count()).toBeGreaterThan(5)
  await expect(snippet.locator(".line.highlighted")).toHaveText("        <Cuts />")
})
