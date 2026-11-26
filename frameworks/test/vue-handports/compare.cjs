// Compare the React lab (4610) with the Vue hand-port app (4712), slot by slot.
// node compare.cjs <slug> --prefix calendar[,date-picker] [--motion subtle|springy] [--steps '<json>'] [--theme dark]
// Steps: click, hover, focus, press, type, wait, snap (label: diff computed styles + screenshots), move (x,y)
// React and Vue run the same steps. Shots land in shots/<slug>-<motion>-<label>-{react,vue}.png
const { chromium } = require("../../../node_modules/playwright-core")
const fs = require("node:fs")
const args = process.argv.slice(2)
const slug = args[0]
const get = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d }
const prefixes = get("--prefix", slug).split(",")
const motion = get("--motion", "subtle")
const theme = get("--theme", "light")
const steps = JSON.parse(get("--steps", "[]"))
const W = +get("--w", 1100), H = +get("--h", 720)
const verbose = args.includes("--verbose")
fs.mkdirSync(__dirname + "/shots", { recursive: true })

const PROPS = ["display", "position", "width", "height", "padding", "margin", "gap", "color", "background-color", "background-image",
  "box-shadow", "border-radius", "border-width", "font-size", "font-weight", "line-height", "letter-spacing", "opacity", "transform", "scale",
  "translate", "rotate", "filter", "transition-property", "transition-duration", "transition-timing-function", "transition-delay",
  "animation-name", "animation-duration", "outline-style", "cursor", "text-decoration-line", "visibility", "anchor-name", "clip-path", "mask-image", "z-index", "overflow"]
const PSEUDO = ["content", "opacity", "width", "height", "background-color", "border-radius", "transform", "translate", "box-shadow", "top", "left", "transition-duration", "position-anchor"]

async function collect(page) {
  return page.evaluate(({ prefixes, PROPS, PSEUDO }) => {
    const out = {}
    const counts = {}
    const els = [...document.querySelectorAll("[data-slot]")].filter((el) => prefixes.some((p) => el.dataset.slot.startsWith(p)))
    for (const el of els) {
      const s = el.dataset.slot
      const i = (counts[s] = (counts[s] ?? -1) + 1)
      const cs = getComputedStyle(el)
      const rec = {}
      for (const p of PROPS) rec[p] = cs.getPropertyValue(p)
      for (const ps of ["::before", "::after"]) {
        const c = getComputedStyle(el, ps)
        if (c.content && c.content !== "none" && c.content !== "normal") for (const p of PSEUDO) rec[ps + p] = c.getPropertyValue(p)
      }
      const attrs = [...el.attributes].filter((a) => a.name.startsWith("data-") || a.name.startsWith("aria-") || a.name === "role" || a.name === "tabindex")
        .filter((a) => !/^(data-v-|aria-controls|aria-labelledby|aria-describedby|aria-owns|aria-activedescendant)/.test(a.name))
        .map((a) => (/^(id|data-id)$/.test(a.name) ? a.name : `${a.name}=${/^(aria-label|data-value|aria-valuetext)$/.test(a.name) ? a.value : a.value.length > 40 ? "…" : a.value}`))
      rec.attrs = attrs.sort().join(" ")
      rec.tag = el.tagName.toLowerCase()
      rec.text = (el.childElementCount === 0 ? el.textContent : "").trim().slice(0, 40)
      const r = el.getBoundingClientRect()
      rec.rect = `${Math.round(r.width)}x${Math.round(r.height)}`
      out[`${s}#${i}`] = rec
    }
    return out
  }, { prefixes, PROPS, PSEUDO })
}

async function clip(page) {
  const r = await page.evaluate((prefixes) => {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9
    for (const el of document.querySelectorAll("[data-slot]")) {
      if (!prefixes.some((p) => el.dataset.slot.startsWith(p))) continue
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) continue
      x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom)
    }
    return x1 > x0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null
  }, prefixes)
  if (!r) return undefined
  const pad = 40
  const x = Math.max(0, r.x - pad), y = Math.max(0, r.y - pad)
  return { x, y, width: Math.min(W - x, r.w + pad * 2), height: Math.min(H - y, r.h + pad * 2) }
}
async function shot(page, path) {
  await page.screenshot({ path, clip: await clip(page) })
}

async function run(browser, base, name) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
  const errors = []
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)) })
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)))
  await page.goto(`${base}/?theme=${theme}&play=off&motion=${motion}#/${slug}`, { waitUntil: "networkidle" })
  await page.waitForTimeout(800)
  const snaps = {}
  snaps.rest = await collect(page)
  await shot(page, `${__dirname}/shots/${slug}-${motion}-rest-${name}.png`)
  for (const s of steps) {
    try {
      if (s.click) await page.locator(s.click).first().click({ timeout: 3000 })
      if (s.rclick) await page.locator(s.rclick).first().click({ button: "right", timeout: 3000 })
      if (s.hover) await page.locator(s.hover).first().hover({ timeout: 3000 })
      if (s.focus) await page.locator(s.focus).first().focus({ timeout: 3000 })
      if (s.move) await page.mouse.move(s.move[0], s.move[1])
      if (s.press) await page.keyboard.press(s.press)
      if (s.type) await page.keyboard.type(s.type)
      if (s.js) await page.evaluate(s.js)
    } catch (e) { errors.push(`step ${JSON.stringify(s)}: ${String(e).split("\n")[0]}`) }
    if (s.wait) await page.waitForTimeout(s.wait)
    if (s.snap) {
      snaps[s.snap] = await collect(page)
      if (s.focused !== false) snaps[s.snap].__focus = { slot: await page.evaluate(() => { const a = document.activeElement; return a === document.body ? "BODY" : a ? `${a.dataset?.slot ?? a.tagName} ${a.getAttribute("aria-label") ?? a.textContent?.trim().slice(0, 30)}` : "" }) }
      await shot(page, `${__dirname}/shots/${slug}-${motion}-${s.snap}-${name}.png`)
    }
  }
  await page.close()
  return { snaps, errors }
}

;(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true })
  const react = await run(browser, "http://localhost:4610", "react")
  const vue = await run(browser, "http://localhost:4712", "vue")
  /* Side by side: React left, Vue right. */
  const pairPage = await browser.newPage({ viewport: { width: 1400, height: 800 } })
  for (const label of Object.keys(react.snaps)) {
    const img = (n) => "data:image/png;base64," + fs.readFileSync(`${__dirname}/shots/${slug}-${motion}-${label}-${n}.png`).toString("base64")
    await pairPage.setContent(`<body style="margin:0;display:inline-flex;gap:10px;background:red;align-items:start"><img src="${img("react")}"><img src="${img("vue")}"></body>`)
    await pairPage.locator("body").screenshot({ path: `${__dirname}/shots/${slug}-${motion}-${label}-pair.png` })
  }
  await browser.close()
  let total = 0
  for (const label of Object.keys(react.snaps)) {
    const a = react.snaps[label], b = vue.snaps[label] ?? {}
    const lines = []
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!a[k]) { lines.push(`  + ${k} only in Vue`); continue }
      if (!b[k]) { lines.push(`  - ${k} only in React`); continue }
      for (const p of new Set([...Object.keys(a[k]), ...Object.keys(b[k])])) {
        if (a[k][p] !== b[k][p]) lines.push(`  ${k} ${p}: R=${JSON.stringify(a[k][p])} V=${JSON.stringify(b[k][p])}`)
      }
    }
    total += lines.length
    console.log(`[${motion}] ${label}: ${lines.length ? lines.length + " differences" : "identical"} (${Object.keys(a).length} slots)`)
    for (const l of verbose ? lines : lines.slice(0, 60)) console.log(l)
  }
  if (react.errors.length) console.log("REACT errors:\n " + react.errors.join("\n "))
  if (vue.errors.length) console.log("VUE errors:\n " + vue.errors.join("\n "))
  console.log(`total differences: ${total}`)
})()
