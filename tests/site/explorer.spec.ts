import { expect, test } from "./kit"

test("the explorer lists all 63 components, filters them, and plays the one you pick", async ({ page, errors }) => {
  await page.goto("/")
  const explorer = page.getByTestId("component-explorer")
  await explorer.scrollIntoViewIfNeeded()
  const list = explorer.getByRole("list", { name: "Components" })
  await expect(list.getByRole("button")).toHaveCount(63)
  await explorer.getByRole("button", { name: /^Still/ }).click()
  await expect(list.getByRole("button")).toHaveCount(11)
  await explorer.getByRole("button", { name: /^All/ }).click()
  await list.getByRole("button", { name: "Checkbox", exact: true }).click()
  // The demo loads near the screen, then the checkbox is the real shadcn component, live.
  await expect(explorer.locator('[data-slot="checkbox"]').first()).toBeVisible()
  await explorer.getByRole("button", { name: "Stock", exact: true }).click()
  await expect(explorer.locator('[data-cut="none"] [data-slot="checkbox"]').first()).toBeVisible()
  await expect(explorer.getByRole("link", { name: "Checkbox docs" })).toHaveAttribute("href", "/docs/components/checkbox")
  expect(errors).toEqual([])
})
