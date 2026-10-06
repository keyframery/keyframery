import { expect, meta, onStock, test } from "./kit"

test("the fixture renders; <Cuts /> marks <html>; the stock twin has no Keyframery", async ({ page, browser, errors }, info) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Keyframery fixture" })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.hasAttribute("data-kf"))).toBe(true)
  const stock = await onStock(browser, info, "/", (p) => p.evaluate(() => document.documentElement.hasAttribute("data-kf")))
  expect(stock.value).toBe(false)
  expect(errors).toEqual([])
  expect(meta(info).base === "base" || meta(info).base === "radix").toBe(true)
})
