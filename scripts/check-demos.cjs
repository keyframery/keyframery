// Browser smoke and screenshot audit of every registered demo against the existing Vite lab.
// node scripts/check-demos.cjs [slug ...] (defaults to all components)
const fs = require("node:fs")
const path = require("node:path")
const { chromium } = require("playwright-core")
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync("src/components/ui").filter((name) => name.endsWith(".tsx")).map((name) => name.slice(0, -4))
const output = path.resolve("shots/audit")
const resultFile = process.argv.slice(2).length ? "selected-results.json" : "results.json"
fs.mkdirSync(output, { recursive: true })
;(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true })
  const results = []
  const queue = [...slugs]
  try {
    await Promise.all(Array.from({ length: 3 }, async () => {
      const page = await browser.newPage({ viewport: { width: 1100, height: 760 }, deviceScaleFactor: 1 })
      let errors = []
      page.on("pageerror", (error) => errors.push(error.message))
      page.on("console", (message) => { if (message.type() === "error" && !/Failed to load resource/.test(message.text())) errors.push(message.text()) })
      while (queue.length) {
        const slug = queue.shift()
        errors = []
        const result = { slug, errors, variants: [] }
        try {
          for (const variant of ["light", "dark", "mobile", "reduced"]) {
            const mobile = variant === "mobile"
            await page.setViewportSize({ width: mobile ? 390 : 1100, height: mobile ? 840 : 760 })
            await page.emulateMedia({ reducedMotion: variant === "reduced" ? "reduce" : "no-preference" })
            await page.goto(`http://localhost:4610/?theme=${variant === "dark" ? "dark" : "light"}&play=off${mobile ? "&w=390" : ""}#/${slug}`, { waitUntil: "networkidle" })
            const demo = page.locator(`[data-demo="${slug}"]`)
            await demo.waitFor({ state: "visible", timeout: 15000 })
            if (slug === "empty") {
              await demo.locator('[data-play="search"]').fill("saffron")
              await demo.locator('[data-slot="empty"]').waitFor({ state: "visible" })
            }
            await page.waitForTimeout(600)
            const state = await demo.evaluate((element) => ({
              parts: element.querySelectorAll("[data-slot]").length,
              text: element.textContent.trim().slice(0, 100),
              width: element.getBoundingClientRect().width,
              overflow: element.scrollWidth > element.clientWidth + 1,
            }))
            if (!state.parts) throw new Error(`${variant}: no UI SDK parts rendered`)
            await demo.screenshot({ path: path.join(output, `${slug}-${variant}.png`), animations: variant === "reduced" ? "disabled" : "allow" })
            result.variants.push({ variant, ...state })
          }
        } catch (error) { errors.push(error.message) }
        result.errors = [...new Set(errors)]
        results.push(result)
        console.log(`${slug}: ${result.errors.length ? result.errors.join("; ") : "OK"}`)
      }
      await page.close()
    }))
  } finally { await browser.close() }
  results.sort((a, b) => a.slug.localeCompare(b.slug))
  fs.writeFileSync(path.join(output, resultFile), JSON.stringify(results, null, 2) + "\n")
  const failed = results.filter((result) => result.errors.length)
  console.log(`${results.length} demos checked; ${failed.length} failed.`)
  if (failed.length) process.exitCode = 1
})().catch((error) => { console.error(error); process.exitCode = 1 })
