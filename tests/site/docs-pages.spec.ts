import coverage from "../../apps/web/lib/coverage.json" with { type: "json" }
import { expect, takeCuts, test } from "./kit"

// Every component page carries a playground and a props table; the generated ones also carry a "What moves" table.
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

test("a component page's playground opens side by side, changes the cut and the speed, and shows the line to copy", async ({ page }) => {
  await page.goto("/docs/components/dialog")
  const playground = page.locator("[data-playground]")
  // Side by side by default: the same demo as shadcn ships it, and with Keyframery.
  await expect(playground.locator('[data-preview-stage="stock"]')).toHaveAttribute("data-cut", "none")
  await expect(playground.locator('[data-preview-stage="kf"]')).not.toHaveAttribute("data-cut", /.*/)
  await expect(playground).toContainText("Try it: Open the dialog, then close it.")
  await playground.getByRole("group", { name: "Cut" }).getByRole("button", { name: "Punch in" }).click()
  await playground.getByRole("group", { name: "Speed" }).getByRole("button", { name: "Slower" }).click()
  // The cut goes through the site's one <Cuts />, like the prop in an app; the speed wraps the stage.
  await expect(page.locator("html")).toHaveAttribute("data-kf-dialog", "punch-in")
  await expect(playground.locator('[data-preview-stage="kf"]')).toHaveAttribute("data-cut-pace", "1.6")
  await expect(playground.locator('[data-preview-stage="stock"]')).not.toHaveAttribute("data-cut-pace", /.*/)
  const code = playground.locator("[data-playground-code]")
  await expect(code).toContainText('<Cuts dialog="punch-in" pace={1.6} />')
  await expect(code).toContainText('<DialogContent data-cut="punch-in" data-cut-pace="1.6" />')
  // One side at a time: shadcn/ui alone shows how to get shadcn's own motion back.
  await playground.getByRole("group", { name: "Show" }).getByRole("button", { name: "shadcn/ui" }).click()
  await expect(playground.locator("[data-preview-stage]")).toHaveCount(1)
  await expect(code).toContainText('<DialogContent data-cut="none" />')
  // Leaving the page (in the app, not a reload) puts the site's own cut back.
  await page.locator('a[href="/docs/components/direction"]').last().click()
  await expect(page).toHaveURL(/\/docs\/components\/direction/)
  await expect(page.locator("html")).toHaveAttribute("data-kf-dialog", "rack-focus")
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

test("a cut component's page shows every cut it can take as a card with a live preview and its line", async ({ page }) => {
  await page.goto("/docs/components/dialog")
  const cards = page.locator("[data-cut-card]")
  await expect(cards).toHaveCount(3)
  await expect(cards.nth(0)).toContainText("Rack focus")
  await expect(cards.nth(0)).toContainText("Default")
  await expect(cards.nth(1)).toContainText('<Cuts dialog="punch-in" />')
  // The preview plays the real cut: its little dialog is the same part, with the cut set on it.
  await expect(cards.nth(1).locator('[data-slot="dialog-content"]')).toHaveAttribute("data-cut", "punch-in")
  await expect(page.getByRole("list", { name: "At a glance" })).toContainText("Cut: Rack focus")
})

test("a still component's page says nothing moves, on purpose", async ({ page }) => {
  await page.goto("/docs/components/separator")
  await expect(page.getByText("Nothing moves here, on purpose")).toBeVisible()
  await expect(page.getByRole("list", { name: "At a glance" })).toContainText("Still: nothing moves")
  await expect(page.locator("[data-playground]")).toHaveCount(0)
})
