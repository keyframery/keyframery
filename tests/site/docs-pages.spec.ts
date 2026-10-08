import coverage from "../../apps/web/lib/coverage.json" with { type: "json" }
import { expect, takeCuts, test } from "./kit"

// Hand-written component pages carry a props table; the generated ones carry a "What moves" table.
const COMPONENTS = ["dialog", "alert-dialog", "sheet", "drawer", "tabs", "toast", "command"]
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

test("all 63 component pages render: a live demo where something moves, and what moves", async ({ page, errors }, info) => {
  test.skip(info.project.name !== "chromium", "one engine is enough to catch a broken page or demo")
  test.setTimeout(180_000)
  for (const c of coverage.components) {
    const res = await page.goto(`/docs/components/${c.slug}`)
    expect(res?.status(), c.slug).toBe(200)
    // Generated pages read "Checkbox animation"; hand-written ones may say more ("Command menu animation").
    if (COMPONENTS.includes(c.slug)) await expect(page.getByRole("heading", { level: 1 }), c.slug).toHaveText(new RegExp(`^${c.name}`))
    else await expect(page.getByRole("heading", { level: 1 }), c.slug).toHaveText(c.kind === "still" ? c.name : `${c.name} animation`)
    if (c.kind !== "still") await expect(page.locator("[data-preview-stage] > *").first(), c.slug).toBeVisible()
    if (c.moves.length && !COMPONENTS.includes(c.slug)) await expect(page.getByRole("heading", { name: /What moves/ }), c.slug).toBeVisible()
  }
  expect(errors).toEqual([])
})
