import fs from "node:fs"
import path from "node:path"

import { PRO_ENABLED } from "../../apps/web/lib/pro"

import { expect, test } from "./kit"

const store = path.resolve(process.cwd(), "../apps/web/.data/waitlist.jsonl")
const rows = (email: string) => (fs.existsSync(store) ? fs.readFileSync(store, "utf8").split("\n").filter((l) => l && JSON.parse(l).email === email).length : 0)

test("joining twice with the same email confirms both times and stores one row", async ({ page }, info) => {
  test.skip(!PRO_ENABLED, "Pro is switched off")
  const email = `dev+${info.project.name}-${Date.now()}@example.com`
  await page.goto("/pro")
  for (let i = 0; i < 2; i++) {
    await page.getByLabel("Email").fill(email)
    await page.getByRole("button", { name: "Join the waitlist" }).click()
    await expect(page.getByRole("status")).toContainText("You're on the waitlist")
  }
  expect(rows(email)).toBe(1)
})

test("an incomplete email gets a specific message", async ({ page }) => {
  test.skip(!PRO_ENABLED, "Pro is switched off")
  await page.goto("/pro")
  await page.getByLabel("Email").fill("dev@example")
  await page.getByRole("button", { name: "Join the waitlist" }).click()
  await expect(page.getByRole("status")).toContainText("doesn't look complete")
})

test("the home page runs from what it is, through what moves, the skill, doing it by hand, questions and the close", async ({ page }) => {
  await page.goto("/")
  // Section headings only (ids ending in -title), not the dialog titles inside the demo screens.
  const order = await page.locator('main h2[id$="-title"]').allTextContents()
  expect(order).toEqual([
    "shadcn/ui gives you the parts. Keyframery makes them move.",
    "Every change gets the right animation.",
    "Install the skill. Ask for animations. Review the diff.",
    "Rather do it yourself? It's one line of code.",
    "Before you install",
    "Give your app the cuts an editor would choose.",
  ])
  await expect(page.getByRole("button", { name: "Join the waitlist" })).toHaveCount(PRO_ENABLED ? 1 : 0)
})
