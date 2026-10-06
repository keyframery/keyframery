import { expect, noHorizontalScroll, test } from "./kit"

for (const path of ["/", "/docs"]) {
  test(`${path} renders without errors, inside the phone width, with <Cuts /> running`, async ({ page, errors }) => {
    await page.goto(path)
    await expect(page.locator("main").first()).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.hasAttribute("data-kf"))).toBe(true)
    expect(await noHorizontalScroll(page)).toBe(true)
    expect(errors).toEqual([])
  })
}

test("the registry is served at /r", async ({ request }) => {
  const res = await request.get("/r/cuts.json")
  expect(res.ok()).toBe(true)
  expect((await res.json()).name).toBe("cuts")
})
