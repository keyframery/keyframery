import { expect, test } from "./kit"

test("the homepage HTML stays small enough to avoid embedding the full stylesheets", async ({ request }) => {
  const response = await request.get("/")
  expect(response.status()).toBe(200)
  // The separate-CSS page is about 227 KB; inlineCss expanded it to 1.18 MB.
  expect(Buffer.byteLength(await response.text(), "utf8")).toBeLessThan(350_000)
})

test("the landing page waits for navigation before fetching other routes", async ({ page }) => {
  const prefetched: string[] = []
  page.on("request", (request) => {
    if (request.headers()["next-router-prefetch"] === "1") prefetched.push(request.url())
  })
  await page.goto("/")
  await expect(page.locator('[data-testid="hero-stage"][data-ready]')).toBeAttached()
  // Next schedules viewport prefetching after hydration; allow that idle task to run.
  await page.waitForTimeout(1500)
  expect(prefetched).toEqual([])

  await page.locator('section[aria-labelledby="hero-title"]').getByRole("link", { name: "Add to my app", exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/installation$/)
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
})

test("public and demo email addresses opt out of Cloudflare rewriting while HTML stays compressed", async ({ request }) => {
  const response = await request.get("/", { headers: { "Accept-Encoding": "gzip" } })
  expect(response.status()).toBe(200)
  expect(response.headers()["content-encoding"]).toBe("gzip")
  const html = await response.text()
  expect(html).toContain('<!--email_off--><a href="mailto:briyan@keyframery.com">briyan@keyframery.com</a><!--/email_off-->')
  for (const address of ["ana@acme.com", "ben@acme.com", "chloe@acme.com"]) {
    expect(html).toContain(`<!--email_off-->${address}<!--/email_off-->`)
  }
})
