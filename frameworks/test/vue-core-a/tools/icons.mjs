/* Prints each distinct lucide svg in a React lab demo, ready to paste into a Vue template. node tools/icons.mjs <slug> */
import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const { chromium } = require("/Users/briyan/keyframery-ui-lab/node_modules/playwright-core")
const b = await chromium.launch({ channel: "chrome", headless: true })
const p = await b.newPage()
await p.goto(`http://localhost:4610/?play=off#/${process.argv[2]}`)
await p.waitForTimeout(1500)
const out = await p.evaluate(() => {
  const seen = new Map()
  for (const s of document.querySelectorAll("[data-demo] svg.lucide")) {
    const name = [...s.classList].find((c) => c.startsWith("lucide-"))
    if (!seen.has(name)) seen.set(name, s.outerHTML.replace(/><\/(path|circle|line|rect|polyline|polygon|ellipse)>/g, " />"))
  }
  return [...seen.entries()].map(([k, v]) => `${k}\n${v}`).join("\n\n")
})
console.log(out)
await b.close()
