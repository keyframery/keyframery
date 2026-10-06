import { expect, takeCuts, test } from "./kit"

test("after a short idle the page plays itself, and the first real input stops it", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "Director runs on desktop layouts")
  await page.goto("/?director=fast")
  await expect(page.getByTestId("director")).toHaveAttribute("aria-pressed", "true", { timeout: 4000 })
  await expect(page.getByTestId("director-cursor")).toBeVisible()
  await expect.poll(async () => (await takeCuts(page)).length, { timeout: 8000 }).toBeGreaterThan(0)
  await page.mouse.move(40, 40)
  await expect(page.getByTestId("director")).toHaveAttribute("aria-pressed", "false")
  await expect(page.getByTestId("director-cursor")).toBeHidden()
  // It comes back after the next idle, and a key press stops it too.
  await expect(page.getByTestId("director")).toHaveAttribute("aria-pressed", "true", { timeout: 4000 })
  await page.keyboard.press("Shift")
  await expect(page.getByTestId("director")).toHaveAttribute("aria-pressed", "false")
})

test("Director never starts by itself under reduced motion", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  await page.goto("http://localhost:4500/?director=fast")
  await page.waitForTimeout(1500)
  await expect(page.getByTestId("director")).toHaveAttribute("aria-pressed", "false")
  await ctx.close()
})
