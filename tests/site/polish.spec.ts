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

test("the hero states the free offering and links to GitHub", async ({ page }) => {
  await page.goto("/")
  const h = hero(page)
  const facts = h.getByRole("list", { name: "Facts" })
  for (const fact of ["Free and open source", "MIT licensed", "No account required"]) await expect(facts).toContainText(fact)
  await expect(h.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/keyframery/keyframery")
})

test("a row of logos says what Keyframery works with", async ({ page }) => {
  await page.goto("/")
  const logos = hero(page).getByRole("list", { name: "Works with" })
  for (const name of ["shadcn/ui", "Base UI", "Radix", "Next.js", "Vite", "React Router"]) await expect(logos).toContainText(name)
})

test("the homepage feature cards use three equal columns on desktop", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "one column on phones")
  await page.goto("/")
  const tiles = page.getByRole("region", { name: "Every change gets the right animation." }).locator("article")
  await expect(tiles).toHaveCount(6)
  const widths = await tiles.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().width)))
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1)
})
