import { expect, takeCuts, test } from "./kit"

const COMPONENTS = ["dialog", "alert-dialog", "sheet", "drawer", "tabs", "toast", "command", "tuned"]
const HELPERS = ["match-cut", "list-cut", "value-cut", "load-cut"]

test("every component and helper page has a live preview and an API table", async ({ page, errors }) => {
  for (const slug of [...COMPONENTS.map((c) => `components/${c}`), ...HELPERS.map((h) => `helpers/${h}`)]) {
    const res = await page.goto(`/docs/${slug}`)
    expect(res?.status(), slug).toBe(200)
    await expect(page.locator("[data-preview]").first(), slug).toBeVisible()
    // Fumadocs' TypeTable is a list of collapsible rows under a "Prop" heading, not a <table>.
    await expect(page.getByText("Prop", { exact: true }).first(), slug).toBeVisible()
  }
  expect(errors).toEqual([])
})

test("the ListCut demo plays a cut on action when you add an item", async ({ page }) => {
  await page.goto("/docs/helpers/list-cut")
  await takeCuts(page)
  await page.locator("[data-preview]").getByRole("button", { name: "Add a task" }).click()
  await expect.poll(async () => (await takeCuts(page)).some((c) => c.component === "list")).toBe(true)
})

test("the MatchCut demo grows the card into its detail and back", async ({ page }) => {
  await page.goto("/docs/helpers/match-cut")
  const preview = page.locator("[data-preview]").first()
  await takeCuts(page)
  await preview.getByRole("button", { name: /Northwind Studio/ }).click()
  await expect(preview.getByRole("button", { name: "Back to orders" })).toBeVisible()
  await expect.poll(async () => (await takeCuts(page)).some((c) => c.component === "match")).toBe(true)
})
