import tested from "../../apps/web/lib/tested.json" with { type: "json" }
import { expect, noHorizontalScroll, takeCuts, test } from "./kit"

test("three practical examples show the motion and link to complete docs", async ({ page }) => {
  await page.goto("/")
  const examples = page.getByRole("region", { name: "Small details. A different feel." })
  await expect(examples.locator("article")).toHaveCount(3)
  for (const [title, href] of [
    ["Dialogs that follow your action", "/docs/components/dialog"],
    ["Lists that keep their place", "/docs/helpers/list-cut"],
    ["Loading that feels considered", "/docs/helpers/load-cut"],
  ]) {
    const example = examples.locator("article").filter({ has: page.getByRole("heading", { name: title }) })
    await expect(example.getByRole("heading", { name: title })).toBeVisible()
    await expect(example.locator(`a[href="${href}"]`)).toBeVisible()
  }
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
  await page.goto("/cuts#app-examples")
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
  await page.goto("/cuts#app-examples")
  const chat = page.locator('[data-screen="chat"]')
  await chat.getByRole("textbox", { name: "Message" }).fill("Ship it")
  await chat.getByRole("button", { name: "Send" }).click()
  await expect(chat.getByText("Ship it")).toBeVisible()
  await expect(chat.getByText("On it. Merging now.")).toBeVisible({ timeout: 4000 })
  const cuts = (await takeCuts(page)).filter((c) => c.component === "list").map((c) => c.cut)
  expect(cuts).toEqual(expect.arrayContaining(["cut-on-action", "rise"]))
})

test("the home page explains installation in three steps", async ({ page }) => {
  await page.goto("/?demo=off")
  const how = page.getByRole("region", { name: "Keep your components. Add the motion." })
  await expect(how.getByRole("listitem")).toHaveCount(3)
  await expect(how.getByRole("link", { name: "Quick start" })).toHaveAttribute("href", "/docs/installation")
  expect(await noHorizontalScroll(page)).toBe(true)
})

test("the examples page lets you change a dialog with one prop", async ({ page }) => {
  await page.goto("/cuts")
  const tryIt = page.getByRole("region", { name: "Change anything with one prop" })
  const playground = tryIt.locator("[data-playground]")
  await playground.getByRole("group", { name: "Cut" }).getByRole("button", { name: "Fade" }).click()
  await expect(page.locator("html")).toHaveAttribute("data-kf-dialog", "fade")
  await expect(playground.locator("[data-playground-code]")).toContainText('<Cuts dialog="fade" />')
  expect(await noHorizontalScroll(page)).toBe(true)
})

test("the home page and the FAQ tell coding-agent users about the plugin and the MCP server", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("/plugin install keyframery@keyframery").first()).toBeVisible()
  await expect(page.getByText("npx shadcn add @keyframery/cuts").first()).toBeVisible()
  await expect(page.getByText(`Tested with shadcn CLI ${tested.shadcnCli}, on Base UI and Radix.`)).toBeVisible()
  // shadcn's registry index knows @keyframery, so the page never asks for a register step.
  await expect(page.getByText("npx shadcn registry add")).toHaveCount(0)
  await page.getByRole("button", { name: "Does it work with AI coding agents?" }).click()
  const answer = page.getByRole("region", { name: "Does it work with AI coding agents?" })
  await expect(answer).toContainText("keyframery.com/mcp")
  await expect(answer).toContainText("Codex")
})
