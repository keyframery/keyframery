import { expect, test } from "./kit"

test("optional analytics stays off on local pages and offers a clear privacy control", async ({ page }) => {
  const requests: string[] = []
  page.on("request", (request) => { if (new URL(request.url()).hostname.endsWith("clarity.ms")) requests.push(request.url()) })
  await page.goto("/privacy")
  await expect(page.locator("body")).toHaveAttribute("data-clarity-mask", "true")
  const preferences = page.getByLabel("Analytics preferences", { exact: true })
  await expect(preferences).toContainText("not configured and stays off")
  await expect(preferences.getByRole("button", { name: "Allow optional analytics" })).toBeDisabled()
  await expect(preferences.getByRole("button", { name: "Turn off optional analytics" })).toBeVisible()
  expect(requests).toEqual([])
})

test("turning analytics off clears this site's leftover cookies and persists only an expiring preference", async ({ page, context }) => {
  const requests: string[] = []
  page.on("request", (request) => { if (new URL(request.url()).hostname.endsWith("clarity.ms")) requests.push(request.url()) })
  await page.goto("/privacy")
  await context.addCookies([
    { name: "_clck", value: "old-user", url: "http://localhost:4500/" },
    { name: "_clsk", value: "old-session", url: "http://localhost:4500/" },
  ])
  await page.getByRole("button", { name: "Turn off optional analytics" }).click()
  await expect(page.getByLabel("Analytics preferences", { exact: true }).getByRole("status")).toContainText("is off")
  const cookies = (await context.cookies()).map((cookie) => cookie.name)
  expect(cookies).not.toContain("_clck")
  expect(cookies).not.toContain("_clsk")
  const preference = await page.evaluate(() => JSON.parse(localStorage.getItem("keyframery:clarity:v1")!))
  expect(preference).toEqual({ enabled: false, expiresAt: expect.any(Number) })
  expect(preference.expiresAt - Date.now()).toBeGreaterThan(179 * 24 * 60 * 60 * 1000)
  expect(preference.expiresAt - Date.now()).toBeLessThanOrEqual(180 * 24 * 60 * 60 * 1000)
  await page.getByRole("navigation", { name: "Footer", exact: true }).getByRole("link", { name: "Docs", exact: true }).click()
  expect(requests).toEqual([])
})

test("inaccessible preference storage fails closed without breaking the privacy controls", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get: () => { throw new Error("Storage blocked") }, configurable: true })
  })
  const requests: string[] = []
  page.on("request", (request) => { if (new URL(request.url()).hostname.endsWith("clarity.ms")) requests.push(request.url()) })
  await page.goto("/privacy")
  await page.getByRole("button", { name: "Turn off optional analytics" }).click()
  await expect(page.getByLabel("Analytics preferences", { exact: true }).getByRole("status")).toContainText("could not save")
  expect(requests).toEqual([])
})

test("admin never loads optional session analytics even with a saved opt-in", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("keyframery:clarity:v1", JSON.stringify({ enabled: true, expiresAt: Date.now() + 60_000 })))
  const requests: string[] = []
  page.on("request", (request) => { if (new URL(request.url()).hostname.endsWith("clarity.ms")) requests.push(request.url()) })
  await page.goto("/admin")
  await expect(page.getByRole("heading", { name: "Keyframery admin" })).toBeVisible()
  expect(requests).toEqual([])
  await expect(page.locator('script[src*="clarity.ms"]')).toHaveCount(0)
})
