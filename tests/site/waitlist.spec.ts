import fs from "node:fs"
import path from "node:path"

import { expect, test } from "./kit"

const store = path.resolve(process.cwd(), "../apps/web/.data/waitlist.jsonl")
const rows = (email: string) => (fs.existsSync(store) ? fs.readFileSync(store, "utf8").split("\n").filter((l) => l && JSON.parse(l).email === email).length : 0)

test("joining twice with the same email confirms both times and stores one row", async ({ page }, info) => {
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
  await page.goto("/pro")
  await page.getByLabel("Email").fill("dev@example")
  await page.getByRole("button", { name: "Join the waitlist" }).click()
  await expect(page.getByRole("status")).toContainText("doesn't look complete")
})

test("the home page ends with the six kinds, the pace sample and the waitlist", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "A screen changes in six ways" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Theme motion the way you theme colour" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Join the waitlist" })).toBeVisible()
})
