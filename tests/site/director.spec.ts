import { expect, takeCuts, test } from "./kit"

test("after a short idle the page plays itself, and the first real input stops it", async ({ page }, info) => {
  test.skip(info.project.name === "phone", "Director runs on desktop layouts")
  await page.goto("/?director=fast&demo=off")
  // It only starts while the wall is on screen.
  await page.getByTestId("wall").evaluate((el) => el.scrollIntoView({ block: "center" }))
  await expect(page.getByTestId("director")).toHaveAttribute("aria-pressed", "true", { timeout: 4000 })
  await expect(page.getByTestId("director-cursor")).toBeVisible()
  await expect.poll(async () => (await takeCuts(page)).length, { timeout: 8000 }).toBeGreaterThan(0)
  // With ?director=fast it restarts 500 ms after the last input, so a visitor who keeps moving keeps it stopped.
  // (A single move would race that restart under load.)
  const stopped = async (input: () => Promise<void>) => {
    await input()
    const pressed = await page.getByTestId("director").getAttribute("aria-pressed")
    return pressed === "false" && !(await page.getByTestId("director-cursor").isVisible())
  }
  let x = 40
  await expect.poll(() => stopped(() => page.mouse.move((x += 3), 40))).toBe(true)
  // It comes back after the next idle, and a key press stops it too.
  await expect(page.getByTestId("director")).toHaveAttribute("aria-pressed", "true", { timeout: 4000 })
  await expect.poll(() => stopped(() => page.keyboard.press("Shift"))).toBe(true)
})

test("Director never starts by itself under reduced motion", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  await page.goto("http://localhost:4500/?director=fast")
  await page.waitForTimeout(1500)
  await expect(page.getByTestId("director")).toHaveAttribute("aria-pressed", "false")
  await ctx.close()
})

test("on a phone, Director waits for its button instead of scrolling the page by itself", async ({ page }, info) => {
  test.skip(info.project.name !== "phone", "phone layout only")
  await page.goto("/?director=fast")
  // Park the viewport inside the wall, where the desktop idle trigger would fire.
  await page.evaluate(() => {
    const wall = document.querySelector('[data-testid="wall"]')!.getBoundingClientRect()
    window.scrollTo(0, wall.top + scrollY + 200)
  })
  await page.waitForTimeout(1500) // longer than the 500 ms test idle: asserting that nothing starts
  await expect(page.getByTestId("director")).toHaveAttribute("aria-pressed", "false")
})
