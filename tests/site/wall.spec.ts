import { expect, takeCuts, test } from "./kit"

test("Dashboard: tabs whip, a new range loads without a jump, and numbers punch in", async ({ page }) => {
  await page.goto("/")
  const d = page.locator('[data-screen="dashboard"]')
  await d.getByRole("tab", { name: "Analytics" }).click()
  await expect(d.getByRole("tabpanel")).toContainText("Top pages")
  await d.getByRole("tab", { name: "Overview" }).click()
  await d.getByRole("combobox", { name: "Range" }).click()
  await page.getByRole("option", { name: "Last 90 days" }).click()
  // ValueCut keeps the current value in one visually hidden span; the rolling digits are aria-hidden.
  await expect(d.locator(".sr-only").filter({ hasText: "$184,920" })).toHaveCount(1, { timeout: 4000 })
  const cuts = (await takeCuts(page)).map((c) => `${c.component}:${c.cut}`)
  expect(cuts).toEqual(expect.arrayContaining(["tabs:j-cut", "value:punch-in"]))
})

test("Inbox: an email opens into its detail and archiving one folds it away", async ({ page }) => {
  await page.goto("/")
  const inbox = page.locator('[data-screen="inbox"]')
  await inbox.getByRole("button", { name: /^Design review/ }).click()
  await expect(inbox.getByRole("button", { name: "Back to inbox" })).toBeVisible()
  await inbox.getByRole("button", { name: "Back to inbox" }).click()
  await inbox.getByRole("button", { name: "Archive Weekly numbers" }).click()
  await expect(inbox.getByText("Weekly numbers")).toHaveCount(0)
  const cuts = (await takeCuts(page)).map((c) => c.cut)
  expect(cuts).toEqual(expect.arrayContaining(["match-cut", "l-cut"]))
})

test("Playlist: shuffling glides every track to its new place; the track menu opens", async ({ page }) => {
  await page.goto("/")
  const p = page.locator('[data-screen="playlist"]')
  await p.getByRole("button", { name: "Shuffle" }).click()
  await p.getByRole("button", { name: "Options for Night drive" }).click()
  await expect(page.getByRole("menuitem", { name: "Move to top" })).toBeVisible()
  await page.keyboard.press("Escape")
  const cuts = (await takeCuts(page)).map((c) => c.cut)
  expect(cuts).toEqual(expect.arrayContaining(["glide", "tuned"]))
})

test("Payments: charging moves Pending → Processing → Paid; ⌘K opens actions", async ({ page }) => {
  await page.goto("/")
  const pay = page.locator('[data-screen="payments"]')
  await pay.getByRole("button", { name: "Charge $1,300.00" }).click()
  await expect(pay.getByTestId("invoice-status")).toContainText("Paid", { timeout: 5000 })
  await pay.getByRole("button", { name: "Search actions" }).click()
  await expect(page.getByRole("dialog", { name: "Invoice actions" })).toBeVisible()
  await page.keyboard.press("Escape")
})
