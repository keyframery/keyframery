import { expect, noHorizontalScroll, takeCuts, test } from "./kit"

test("six live cards show what moves, each saying whether it is automatic or which helper", async ({ page }) => {
  await page.goto("/")
  const features = page.getByRole("region", { name: "Every change gets the right animation." })
  await expect(features.locator("article")).toHaveCount(6)
  for (const [title, how] of [
    ["Dialogs grow from the button", "Automatic"],
    ["Lists make room", "ListCut"],
    ["Numbers roll to the new value", "ValueCut"],
    ["Loading dissolves into content", "LoadCut"],
    ["Tabs slide the way you go", "Automatic"],
    ["Cards open into their page", "MatchCut"],
  ]) {
    const card = features.locator("article").filter({ has: page.getByRole("heading", { name: title }) })
    await expect(card.getByText(how, { exact: true })).toBeVisible()
  }
})

test("the FAQ answers open and close", async ({ page }) => {
  await page.goto("/")
  const q = page.getByRole("button", { name: "Does it change my components?" })
  await q.click()
  await expect(page.getByText("Remove the line and you have stock shadcn again.")).toBeVisible()
  await q.click()
  // The closed panel collapses to 0 px. Its text stays in the HTML for crawlers (and WebKit still gives it a box), so check the panel.
  await expect(page.locator('[data-slot="accordion-content"]').filter({ hasText: "Remove the line and you have stock shadcn again." })).toBeHidden()
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

test("the home page explains installation by hand in three steps", async ({ page }) => {
  await page.goto("/")
  const hand = page.getByRole("region", { name: "Rather do it yourself? It's one line of code." })
  await expect(hand.getByRole("listitem")).toHaveCount(3)
  await expect(hand.getByText("npx shadcn add @keyframery/cuts")).toBeVisible()
  await expect(hand.getByRole("link", { name: "Read the quick start" })).toHaveAttribute("href", "/docs/installation")
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

test("the home page tells coding-agent users about the skill, and never asks for a register step", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("/plugin install keyframery@keyframery").first()).toBeVisible()
  await expect(page.getByText("npx shadcn add @keyframery/cuts").first()).toBeVisible()
  // shadcn's registry index knows @keyframery, so the page never asks for a register step.
  await expect(page.getByText("npx shadcn registry add")).toHaveCount(0)
  await page.getByRole("button", { name: "What does the skill do that the docs don't?" }).click()
  await expect(page.getByText("review a diff instead of wiring it yourself")).toBeVisible()
})
