import { expect, takeCuts, test } from "./kit"

test("the hero says what Keyframery is and how to install it", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your UI is full of jump cuts.")
  await expect(page.getByText("npx shadcn add @keyframery/cuts")).toBeVisible()
  await page.getByRole("button", { name: "Copy the install command" }).click()
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible()
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
