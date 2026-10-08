import { expect, test } from "./kit"

test("guides, compatibility and changelog render", async ({ page, errors }) => {
  for (const slug of ["guides/data-loading", "guides/detail-routes", "guides/live-data", "guides/testing", "guides/performance", "compatibility", "changelog"]) {
    expect((await page.goto(`/docs/${slug}`))?.status(), slug).toBe(200)
  }
  await page.goto("/docs/compatibility")
  await expect(page.getByRole("cell", { name: "Dialog", exact: true })).toBeVisible()
  expect(await page.locator("tbody tr").count()).toBeGreaterThanOrEqual(63)
  expect(errors).toEqual([])
})

test("llms.txt lists the docs and every page has a Markdown version", async ({ request }) => {
  const index = await (await request.get("/llms.txt")).text()
  expect(index).toMatch(/^# Keyframery\n/)
  expect(index).toContain("ListCut")
  expect((await request.get("/docs/helpers/list-cut.md")).ok()).toBe(true)
  const full = await request.get("/llms-full.txt")
  expect(full.ok()).toBe(true)
  const md = await request.get("/docs/helpers/list-cut.mdx")
  expect(md.ok()).toBe(true)
  expect(await md.text()).toContain("ListCut.Item")
  const fullText = await full.text()
  expect(fullText).not.toMatch(/<Preview|<TypeTable|<Steps>|&#x22;/)
  // No instructions that describe the old home page (its switch and timeline are gone).
  expect(fullText).not.toMatch(/timeline on the home page|switch on the home page/)
  expect(await (await request.get("/docs/installation.mdx")).text()).toContain('npx shadcn registry add "@keyframery=https://keyframery.com/r/{name}.json"')
  expect(await (await request.get("/docs/helpers/list-cut.mdx")).text()).toContain("| `id` | `string \\| number` | required | The item's stable id. |")
})

test("⌘K searches the docs and opens a result", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "keyboard shortcut")
  await page.goto("/")
  await page.keyboard.press(process.platform === "darwin" ? "Meta+k" : "Control+k")
  const dialog = page.getByRole("dialog", { name: "Search the docs" })
  await expect(dialog).toBeVisible()
  await dialog.getByRole("combobox").fill("ListCut")
  await dialog.getByRole("option").first().click()
  await expect(page).toHaveURL(/\/docs\/helpers\/list-cut/)
})

test("search puts the page named after the query first", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "keyboard shortcut")
  await page.goto("/docs")
  await page.keyboard.press(process.platform === "darwin" ? "Meta+k" : "Control+k")
  const dialog = page.getByRole("dialog", { name: "Search the docs" })
  await dialog.getByRole("combobox").fill("value")
  await expect(dialog.getByRole("option").first()).toContainText("ValueCut", { ignoreCase: true })
})

test("search: an exact title wins, and results never show raw markup", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "keyboard shortcut")
  await page.goto("/docs")
  await page.keyboard.press(process.platform === "darwin" ? "Meta+k" : "Control+k")
  const dialog = page.getByRole("dialog", { name: "Search the docs" })
  await dialog.getByRole("combobox").fill("dialog")
  await expect(dialog.getByRole("option").first()).toHaveText("Dialog")
  const texts = await dialog.getByRole("option").allTextContents()
  expect(texts.filter((t) => /&#x|<TypeTable|<Preview/.test(t))).toEqual([])
})
