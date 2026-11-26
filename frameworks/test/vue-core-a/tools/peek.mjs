/* Prints the outerHTML of a selector on a page. node tools/peek.mjs <url> <selector> */
import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const { chromium } = require("/Users/briyan/keyframery-ui-lab/node_modules/playwright-core")
const [url, sel, stepsJson] = process.argv.slice(2)
const b = await chromium.launch({ channel: "chrome", headless: true })
const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
await p.goto(url, { waitUntil: "load" })
await p.waitForTimeout(1200)
for (const st of JSON.parse(stepsJson ?? "[]")) {
  if (st.click) await p.locator(st.click).first().click()
  if (st.fill) await p.locator(st.fill[0]).first().fill(st.fill[1])
  if (st.type) await p.keyboard.type(st.type)
  if (st.wait) await p.waitForTimeout(st.wait)
}
console.log(await p.evaluate((s) => document.querySelector(s)?.outerHTML, sel))
await b.close()
