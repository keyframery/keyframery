import coverage from "../../apps/web/lib/coverage.json" with { type: "json" }
import { expect, test } from "./kit"

// Fumadocs puts a "Copy Anchor Link" button inside every heading.
const headingText = (t: string) => t.replace(/Copy Anchor Link$/, "").trim()

// The docs sidebar, on the shadcn model: get started, then every component by its shadcn name, then helpers.
const COMPONENTS = coverage.components.map((c) => c.name).sort((a, b) => a.localeCompare(b))
const SIDEBAR: [group: string, items: string[]][] = [
  ["Get started", ["Introduction", "Quick start", "What's automatic", "Use with AI tools"]],
  ["Components", COMPONENTS],
  ["Helpers", ["Cards that open into a page", "Lists", "Numbers and statuses", "Loading states", "Whole-content states", "Icon moves"]],
  ["Customize", ["Speed, easing and cuts", "Motion themes"]],
  ["Guides", ["Animations not working", "Detail pages on their own route", "Loading data after a click", "Live data", "Turning motion off in tests", "Performance"]],
  ["Reference", ["How it works", "Compared with other libraries", "Reduced motion and accessibility", "Base UI vs Radix", "Compatibility", "Changelog"]],
]

test.beforeEach(({}, info) => test.skip(info.project.name === "phone", "the sidebar is a drawer on phones"))

test("the sidebar is grouped by what you want to do, in plain words", async ({ page }) => {
  await page.goto("/docs")
  const sidebar = page.locator("#nd-sidebar")
  const groups = await sidebar.locator("p").allTextContents()
  expect(groups.map((g) => g.trim()).filter((g) => SIDEBAR.some(([name]) => name === g))).toEqual(SIDEBAR.map(([name]) => name))
  for (const [, items] of SIDEBAR) for (const item of items) await expect(sidebar.getByRole("link", { name: item, exact: true }), item).toHaveCount(1)
  expect(COMPONENTS).toHaveLength(63)
})

test("Quick start is three steps, each ending in what you should see", async ({ page }) => {
  await page.goto("/docs/installation")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Quick start")
  const steps = page.locator("article .fd-steps h3")
  await expect(steps).toHaveText([/Register Keyframery and install it/, /Render <Cuts \/> once/, /Open a dialog/])
  expect(await page.getByText("You should see", { exact: false }).count()).toBeGreaterThanOrEqual(3)
})

test("every Animate page follows one template: Install, Use, You should see, Options", async ({ page }) => {
  for (const slug of ["helpers/match-cut", "helpers/list-cut", "helpers/value-cut", "helpers/load-cut", "helpers/state-cut", "helpers/icon-moves"]) {
    await page.goto(`/docs/${slug}`)
    await expect(page.locator("[data-preview]").first(), slug).toBeVisible()
    const h2 = (await page.locator("article h2").allTextContents()).map(headingText)
    expect(h2.slice(0, 4), slug).toEqual(["Install", "Use", "You should see", "Options"])
  }
})

test("What's automatic shows each automatic component with a demo and a link to its reference", async ({ page }) => {
  await page.goto("/docs/automatic")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("What's automatic")
  expect(await page.locator("[data-preview]").count()).toBeGreaterThanOrEqual(5)
  for (const ref of ["dialog", "sheet", "drawer", "tabs", "toast", "command", "tuned"]) await expect(page.locator(`article a[href="/docs/components/${ref}"]`).first(), ref).toBeVisible()
})

test("Customize puts the variables, the <Cuts> props and per-element control on one page", async ({ page }) => {
  await page.goto("/docs/customize")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Speed, easing and cuts")
  for (const text of ["--kf-pace", '<Cuts dialog="punch-in"', 'data-cut="none"', "keyframery:cut"]) await expect(page.getByText(text).first(), text).toBeVisible()
})

test("How it works holds the seven kinds, the layer, exits and portals", async ({ page }) => {
  await page.goto("/docs/how-it-works")
  const h2 = (await page.locator("article h2").allTextContents()).map(headingText)
  expect(h2).toEqual(expect.arrayContaining(["The seven kinds of change", "What the layer does", "Exits", "Portals"]))
})

test("the old page addresses redirect to where their content went", async ({ request }) => {
  for (const [from, to] of [
    ["/docs/add-cuts", "/docs/customize"],
    ["/docs/theming/variables", "/docs/customize"],
    ["/docs/theming/cuts-props", "/docs/customize"],
    ["/docs/theming/per-element", "/docs/customize"],
    ["/docs/concepts/six-kinds", "/docs/how-it-works"],
    ["/docs/concepts/how-it-works", "/docs/how-it-works"],
    ["/docs/concepts/exits-and-portals", "/docs/how-it-works"],
  ]) {
    const res = await request.get(from, { maxRedirects: 0 })
    expect(res.status(), from).toBe(308)
    expect(res.headers()["location"], from).toBe(to)
  }
})

test("no docs page links to a docs page that doesn't exist", async ({ page, request }, info) => {
  // Links are the same in every browser: one crawl is enough, and it visits every docs page, so it gets more time.
  test.skip(info.project.name !== "chromium", "one browser crawls")
  test.setTimeout(120_000)
  const sitemap = await (await request.get("/sitemap.xml")).text()
  const pages = [...sitemap.matchAll(/<loc>https:\/\/keyframery\.com(\/docs[^<]*)<\/loc>/g)].map((m) => m[1])
  expect(pages.length).toBeGreaterThan(15)
  const links = new Set<string>()
  for (const path of pages) {
    await page.goto(path)
    for (const href of await page.locator('article a[href^="/docs"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")!)))
      links.add(href.split("#")[0])
  }
  for (const href of links) expect((await request.get(href)).status(), href).toBe(200)
})

test("the troubleshooting guide names each cause of broken shadcn/ui animations and its exact fix", async ({ page }) => {
  await page.goto("/docs/guides/animations-not-working")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("shadcn/ui animations not working")
  const causes = (await page.locator("article h2").allTextContents()).map(headingText)
  expect(causes).toEqual(
    expect.arrayContaining([
      "tw-animate-css isn't imported",
      "shadcn/tailwind.css isn't imported",
      "A Tailwind v3 project",
      "Your components live in another package",
      "The closing animation is cut short",
      "It is animating, just quickly",
    ]),
  )
  for (const fix of ['@import "tw-animate-css";', '@import "shadcn/tailwind.css";', "@source"]) await expect(page.getByText(fix).first(), fix).toBeVisible()
})

test("the comparison page sets Keyframery beside Motion, Animate UI, Magic UI and tw-animate-css, fairly", async ({ page }) => {
  await page.goto("/docs/compare")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Keyframery vs Motion, Animate UI, Magic UI and tw-animate-css")
  const table = page.locator("article table").first()
  for (const name of ["Keyframery", "Motion", "Animate UI", "Magic UI", "tw-animate-css"]) await expect(table.locator("th", { hasText: name }).first(), name).toBeVisible()
  // Licences as each project states them, not assumed.
  await expect(table).toContainText("MIT + Commons Clause")
  const sections = (await page.locator("article h2").allTextContents()).map(headingText)
  expect(sections).toEqual(expect.arrayContaining(["At a glance", "Can I use them together?"]))
})
