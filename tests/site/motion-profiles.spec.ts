import { expect, test } from "./kit"

test("the StateCut tile exposes one current content state under reduced motion", async ({ browser }, info) => {
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()
  await page.goto(`${info.project.use.baseURL}/cuts#state-cut`)
  const tile = page.locator("section#state-cut")
  await expect(tile.getByText("No records yet", { exact: true })).toBeVisible()
  await tile.getByRole("button", { name: "Change status" }).click()
  await expect(tile.getByText("Record saved", { exact: true })).toBeVisible()
  await expect(tile.getByText("No records yet", { exact: true })).toBeHidden()
  await context.close()
})
