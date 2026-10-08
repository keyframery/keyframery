import { expect, test } from "./kit"

test("the AI tools page shows the plugin, the MCP server and llms.txt", async ({ page }) => {
  await page.goto("/docs/ai-tools")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Use with AI tools")
  await expect(page.getByText("/plugin install keyframery@keyframery").first()).toBeVisible()
  await expect(page.getByText("claude mcp add --transport http keyframery https://keyframery.com/mcp").first()).toBeVisible()
  await expect(page.getByRole("heading", { name: "llms.txt" })).toBeVisible()
})

test("llms.txt points AI tools at the MCP server", async ({ request }) => {
  expect(await (await request.get("/llms.txt")).text()).toContain("https://keyframery.com/mcp")
})

test("the AI tools page sets up the MCP server in each major coding agent, Claude Code first", async ({ page }) => {
  await page.goto("/docs/ai-tools")
  const tools = (await page.locator("article h3").allTextContents()).map((t) => t.replace(/Copy Anchor Link$/, "").trim())
  expect(tools).toEqual(["Claude Code", "Claude", "Codex", "Cursor", "VS Code (GitHub Copilot)", "Gemini CLI", "Any other MCP client"])
  for (const text of [
    "codex mcp add keyframery --url https://keyframery.com/mcp",
    "[mcp_servers.keyframery]",
    '"type": "http"',
    "gemini mcp add --scope user --transport http keyframery https://keyframery.com/mcp",
  ])
    await expect(page.getByText(text, { exact: false }).first(), text).toBeVisible()
})
