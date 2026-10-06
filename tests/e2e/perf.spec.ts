import { expect, meta, test } from "./kit"

test("the observer stays under 2 ms (p95) on a busy page", async ({ page }, info) => {
  test.skip(meta(info).motion === "reduced" || meta(info).browser !== "chromium")
  test.setTimeout(120_000)
  await page.addInitScript(() => ((globalThis as { __kfPerf?: number[] }).__kfPerf = []))
  for (const name of ["sidebar-example", "combobox-example", "navigation-menu-example", "dropdown-menu-example"]) {
    await page.goto(`/sink/${name}`, { waitUntil: "load" }) // some examples keep the network busy
    await expect(page.getByTestId("sink")).toBeVisible()
    const triggers = page.locator('[data-slot$="-trigger"]').filter({ visible: true })
    const n = Math.min(await triggers.count(), 10)
    for (let i = 0; i < n; i++) {
      await triggers.nth(i).click({ timeout: 1500 }).catch(() => {})
      await page.waitForTimeout(120)
      await page.keyboard.press("Escape")
    }
  }
  const samples = await page.evaluate(() => (globalThis as { __kfPerf?: number[] }).__kfPerf ?? [])
  expect(samples.length).toBeGreaterThan(10)
  const sorted = [...samples].sort((a, b) => a - b)
  const p95 = sorted[Math.floor(sorted.length * 0.95)]
  console.log(`[${meta(info).base}] observer: p95 ${p95.toFixed(2)} ms, max ${sorted[sorted.length - 1].toFixed(2)} ms over ${samples.length} batches`)
  expect(p95).toBeLessThanOrEqual(2)
})
