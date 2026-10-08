import { expect, takeCuts, test } from "./kit"

test("the automatic groups and five helpers play live, each linked to its docs", async ({ page }) => {
  await page.goto("/")
  const grid = page.getByRole("region", { name: "Seven kinds of change, one cut each" })
  for (const title of [
    "Dialogs open from their button",
    "Tabs slide instead of snapping",
    "A card opens into its page",
    "New items come from where they started",
    "Numbers roll to their new value",
    "Loading states settle in",
    "Content changes keep their context",
  ])
    await expect(grid.getByRole("heading", { name: title })).toBeVisible()
  await expect(grid.getByRole("link", { name: "MatchCut docs" })).toHaveAttribute("href", "/docs/helpers/match-cut")
  await expect(grid.getByRole("link", { name: "StateCut docs" })).toHaveAttribute("href", "/docs/helpers/state-cut")
})

test("the FAQ answers open and close", async ({ page }) => {
  await page.goto("/")
  const q = page.getByRole("button", { name: "Does it change my components?" })
  await q.click()
  await expect(page.getByText("Nothing in components/ui is edited.")).toBeVisible()
  await q.click()
  // The closed panel collapses to 0 px. Its text stays in the HTML for crawlers (and WebKit still gives it a box), so check the panel.
  await expect(page.locator('[data-slot="accordion-content"]').filter({ hasText: "Nothing in components/ui is edited." })).toBeHidden()
})

test("Settings: the dialog grows from its button; the sheet steps the page back; saving toasts", async ({ page }) => {
  await page.goto("/")
  const settings = page.locator('[data-screen="settings"]')
  await settings.getByRole("button", { name: "Edit profile" }).click()
  await expect(page.getByRole("dialog", { name: "Edit profile" })).toBeVisible()
  await page.keyboard.press("Escape")
  await settings.getByRole("button", { name: "Notifications" }).click()
  await expect(page.getByRole("dialog", { name: "Notifications" })).toBeVisible()
  await page.keyboard.press("Escape")
  await settings.getByRole("button", { name: "Save changes" }).click()
  await expect(page.getByText("Settings saved")).toBeVisible()
  const cuts = (await takeCuts(page)).map((c) => c.cut)
  expect(cuts).toEqual(expect.arrayContaining(["rack-focus", "slide-sink", "cut-on-action"]))
})

test("Chat: a sent message flies from Send, and a reply rises in", async ({ page }) => {
  await page.goto("/")
  const chat = page.locator('[data-screen="chat"]')
  await chat.getByRole("textbox", { name: "Message" }).fill("Ship it")
  await chat.getByRole("button", { name: "Send" }).click()
  await expect(chat.getByText("Ship it")).toBeVisible()
  await expect(chat.getByText("On it. Merging now.")).toBeVisible({ timeout: 4000 })
  const cuts = (await takeCuts(page)).filter((c) => c.component === "list").map((c) => c.cut)
  expect(cuts).toEqual(expect.arrayContaining(["cut-on-action", "rise"]))
})

test("the install section and the FAQ tell coding-agent users about the plugin and the MCP server", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("/plugin install keyframery@keyframery").first()).toBeVisible()
  await expect(page.getByText('npx shadcn registry add "@keyframery=https://keyframery.com/r/{name}.json"').first()).toBeVisible()
  await page.getByRole("button", { name: "Does it work with AI coding agents?" }).click()
  const answer = page.getByRole("region", { name: "Does it work with AI coding agents?" })
  await expect(answer).toContainText("keyframery.com/mcp")
  await expect(answer).toContainText("Codex")
})
