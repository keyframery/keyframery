import { expect, test } from "./kit"

test("the AI tools page shows the plugin, the copy-a-prompt option and the Markdown docs", async ({ page }) => {
  await page.goto("/docs/ai-tools")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Use with AI tools")
  await expect(page.getByText("/plugin install keyframery@keyframery").first()).toBeVisible()
  // Content headings only: the page's own questions at the end are headings too.
  const headings = (await page.locator("article h2").evaluateAll((hs) => hs.filter((h) => !h.closest('section[aria-labelledby="questions"]')).map((h) => h.textContent ?? ""))).map((t) =>
    t.replace(/Copy Anchor Link$/, "").trim(),
  )
  for (const h of ["Claude Code plugin", "Copy a prompt", "Any other agent"]) expect(headings).toContain(h)
  await expect(page.getByRole("link", { name: "/llms.txt", exact: true }).first()).toBeVisible()
  expect(await page.locator("article").innerText()).not.toMatch(/\bmcp\b/i)
})

test("llms.txt points coding agents at the skill and the full docs", async ({ request }) => {
  const text = await (await request.get("/llms.txt")).text()
  expect(text).toContain("https://keyframery.com/llms-full.txt")
  expect(text).toContain("/plugin marketplace add keyframery/keyframery")
  expect(text).not.toMatch(/mcp/i)
})
