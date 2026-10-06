import { expect, test } from "./kit"

test("the helpers page renders", async ({ page, errors }) => {
  await page.goto("/helpers")
  await expect(page.getByRole("heading", { name: "Keyframery helpers" })).toBeVisible()
  expect(errors).toEqual([])
})
