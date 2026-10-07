import { expect, test } from "./kit"

test("the AI tools page shows the plugin, the MCP server and llms.txt", async ({ page }) => {
  await page.goto("/docs/ai-tools")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI tools")
  await expect(page.getByText("/plugin install keyframery@keyframery").first()).toBeVisible()
  await expect(page.getByText("claude mcp add --transport http keyframery https://keyframery.com/mcp").first()).toBeVisible()
  await expect(page.getByRole("heading", { name: "llms.txt" })).toBeVisible()
})

test("llms.txt points AI tools at the MCP server", async ({ request }) => {
  expect(await (await request.get("/llms.txt")).text()).toContain("https://keyframery.com/mcp")
})
