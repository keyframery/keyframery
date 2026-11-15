// Usage: node scripts/shot.cjs <slug> [--steps '<json>'] [--w 1100] [--h 720]
// Takes light + dark screenshots of one demo. Optional steps run before each screenshot set:
//   [{"click":"text=Activity"},{"wait":400},{"shot":"after"}]   (also: hover, press, type, focus)
// Files land in shots/<slug>-<theme>[-<label>].png
// --slow 0.1 plays every CSS transition and animation at a tenth of its speed, so a frame in the
//   middle of a motion is easy to catch: with --slow 0.1, {"wait":1500} is 150ms into the animation.
// Autoplay is switched off for screenshots unless you pass --play.
const { chromium } = require("playwright-core")
const args = process.argv.slice(2)
const slug = args[0]
const get = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d }
const steps = JSON.parse(get("--steps", "[]"))
const W = +get("--w", 1100), H = +get("--h", 720)
const slow = +get("--slow", 1)
const play = args.includes("--play") // leave the demo's self-running loop on
;(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true })
  const errors = []
  for (const theme of ["light", "dark"]) {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })
    page.on("console", (m) => { if (m.type() === "error") errors.push(`[${theme}] ${m.text().slice(0, 300)}`) })
    page.on("pageerror", (e) => errors.push(`[${theme}] ${String(e).slice(0, 300)}`))
    await page.goto(`http://localhost:4610/?theme=${theme}${play ? "" : "&play=off"}#/${slug}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(500)
    if (slow !== 1) {
      const cdp = await page.context().newCDPSession(page)
      await cdp.send("Animation.enable")
      await cdp.send("Animation.setPlaybackRate", { playbackRate: slow })
    }
    await page.screenshot({ path: `shots/${slug}-${theme}.png` })
    for (const s of steps) {
      if (s.click) await page.locator(s.click).first().click()
      if (s.hover) await page.locator(s.hover).first().hover()
      if (s.focus) await page.locator(s.focus).first().focus()
      if (s.press) await page.keyboard.press(s.press)
      if (s.type) await page.keyboard.type(s.type)
      if (s.wait) await page.waitForTimeout(s.wait)
      if (s.shot) await page.screenshot({ path: `shots/${slug}-${theme}-${s.shot}.png` })
    }
    await page.close()
  }
  await browser.close()
  console.log(errors.length ? "CONSOLE ERRORS:\n" + [...new Set(errors)].join("\n") : "no console errors")
})()
