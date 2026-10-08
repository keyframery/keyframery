import { PRO_ENABLED } from "../../apps/web/lib/pro"

import { expect, test } from "./kit"

test.skip(PRO_ENABLED, "Pro is switched on")

test("while Pro is off, no page links to it or offers the waitlist", async ({ page, request }) => {
  expect((await request.get("/pro")).status()).toBe(404)
  // An exact address: /docs/components/progress also contains "/pro".
  expect(await (await request.get("/sitemap.xml")).text()).not.toMatch(/\/pro<\/loc>/)
  for (const path of ["/", "/docs", "/docs/installation", "/cuts", "/theme", "/privacy", "/terms"]) {
    await page.goto(path)
    await expect(page.locator('a[href="/pro"]'), path).toHaveCount(0)
    await expect(page.getByText(/waitlist|Pro is coming|Pro, a set of/i), path).toHaveCount(0)
    await expect(page.getByRole("heading", { name: "Pro", exact: true }), path).toHaveCount(0)
  }
})
