import { expect, takeCuts, test } from "./kit"

test("the wall's shadcn/ui switch turns cuts off for the wall only", async ({ page }) => {
  await page.goto("/?demo=off")
  const wall = page.getByTestId("wall")
  await page.getByTestId("wall-stock").click()
  await expect(page.getByTestId("wall-stock")).toHaveAttribute("aria-pressed", "true")
  await expect(wall).toHaveAttribute("data-cut", "none")
  // The rest of the page keeps its cuts.
  expect(await page.evaluate(() => document.documentElement.hasAttribute("data-kf"))).toBe(true)
  await expect(page.getByRole("region", { name: "shadcn/ui with Keyframery" })).not.toHaveAttribute("data-cut", "none")
  await takeCuts(page)
  await wall.getByRole("button", { name: "Edit profile" }).click()
  await expect(page.getByRole("dialog", { name: "Edit profile" })).toBeVisible()
  expect((await takeCuts(page)).filter((c) => c.component === "dialog")).toEqual([])
  await page.keyboard.press("Escape")
  await page.getByTestId("wall-kf").click()
  await expect(wall).not.toHaveAttribute("data-cut", "none")
})

test("slow-mo slows the wall's cuts four times, and nothing else", async ({ page }) => {
  await page.goto("/?demo=off")
  const wall = page.getByTestId("wall")
  await page.getByTestId("slowmo").click()
  await expect(page.getByTestId("slowmo")).toHaveAttribute("aria-pressed", "true")
  await expect(wall).toHaveAttribute("data-cut-pace", "4")
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue("--kf-pace"))).toBe("")
  await takeCuts(page)
  await wall.getByRole("button", { name: "Edit profile" }).click()
  await expect(page.getByRole("dialog", { name: "Edit profile" })).toBeVisible()
  const cut = (await takeCuts(page)).find((c) => c.component === "dialog") as { ms: number } | undefined
  expect(cut?.ms).toBe(340 * 4)
})
