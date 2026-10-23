import { expect, takeCuts, test } from "./kit"

test("the introduction leads directly from its preview to installation", async ({ page }) => {
  await page.goto("/docs")
  const article = page.locator("article")
  const preview = article.locator("[data-preview]").first()
  const install = article.getByRole("link", { name: "Add this to my app", exact: true })
  await expect(install).toHaveAttribute("href", "/docs/installation")
  expect(await preview.evaluate((el) => el.nextElementSibling?.textContent)).toContain("Add this to my app")
  await install.click()
  await expect(page).toHaveURL(/\/docs\/installation$/)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Quick start")
})

test("the quick start verification links to a complete working dialog example", async ({ page }) => {
  await page.goto("/docs/installation")
  const example = page.locator("article").getByRole("link", { name: "complete dialog example", exact: true })
  await expect(example).toHaveAttribute("href", "/docs/components/dialog#working-example-review-a-release")
  await example.click()
  await expect(page).toHaveURL(/\/docs\/components\/dialog#working-example-review-a-release$/)
  await expect(page.locator("#working-example-review-a-release")).toBeVisible()
})

test("a preview set to Stock gets no Keyframery motion, even in its portaled dialog", async ({ page }) => {
  await page.goto("/docs")
  const preview = page.locator("[data-preview]").first()
  await preview.getByRole("button", { name: "Stock" }).click()
  await expect(preview.locator("[data-preview-stage]")).toHaveAttribute("data-cut", "none")
  await takeCuts(page)
  await preview.getByRole("button", { name: "Open the dialog" }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute("data-cut", "none")
  expect((await takeCuts(page)).filter((c) => c.component === "dialog")).toEqual([])
  await page.keyboard.press("Escape")
  await preview.getByRole("button", { name: "Keyframery" }).click()
  await preview.getByRole("button", { name: "Open the dialog" }).click()
  await expect.poll(async () => (await takeCuts(page)).some((c) => c.component === "dialog")).toBe(true)
})

test("every Get started, Customize and Reference page renders", async ({ page, errors }) => {
  test.setTimeout(90_000) // Twelve navigations share this test's overall deadline.
  for (const slug of ["", "installation", "ai-tools", "automatic", "customize", "motion-themes", "helpers/state-cut", "how-it-works", "accessibility", "base-ui-vs-radix", "compatibility", "changelog"]) {
    const res = await page.goto(`/docs/${slug}`)
    expect(res?.status(), slug).toBe(200)
    await expect(page.locator("h1").first()).toBeVisible()
  }
  expect(errors).toEqual([])
})

test("StateCut docs demo switches views and keeps the current retry action usable", async ({ page }) => {
  await page.goto("/docs/helpers/state-cut")
  const preview = page.locator("[data-preview]").first()
  await preview.getByRole("button", { name: "Show error" }).click()
  await preview.getByRole("button", { name: "Try again" }).click()
  await expect(preview.getByText("Two new messages")).toBeVisible()
  await preview.getByRole("button", { name: "Empty inbox" }).click()
  await expect(preview.getByText("Your inbox is clear")).toBeVisible()
  await expect(preview.getByRole("button", { name: "Try again" })).toHaveCount(0)
})

test("docs tabs run on <Cuts />", async ({ page }) => {
  await page.goto("/docs/installation")
  await takeCuts(page)
  await page.getByRole("tab", { name: "Vite" }).first().click()
  await expect.poll(async () => (await takeCuts(page)).some((c) => c.component === "tabs")).toBe(true)
})
