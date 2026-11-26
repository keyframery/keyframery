// Compares a React lab demo (4610) with its Vue port (4714), element by element.
// Usage: node compare.cjs <slug> [--motion subtle|springy] [--theme light|dark] [--wait 1500]
//          [--steps '[{"click":"sel"},{"wait":300},{"type":"hi"},{"press":"Enter"},{"eval":"js"}]']
//          [--vsteps '<json>']  (Vue steps, if they differ) [--w 1100] [--h 800] [--props extra,css,props]
//          [--scope '<selector inside the demo>'] [--all]  (--all also lists matching slots)
// Matches every [data-slot] in the demo, in document order per slot name, and prints the computed styles,
// attributes and text that differ. Writes a side-by-side PNG to <scratch>/cmp/<slug>-<motion>-<theme>.png.
const { chromium } = require("/Users/briyan/keyframery-ui-lab/node_modules/playwright-core")
const fs = require("node:fs")
const path = require("node:path")
const args = process.argv.slice(2)
const slug = args[0]
const get = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d }
const motion = get("--motion", "subtle"), theme = get("--theme", "light")
const wait = +get("--wait", 1500), W = +get("--w", 1100), H = +get("--h", 800)
const steps = JSON.parse(get("--steps", "[]")), vsteps = JSON.parse(get("--vsteps", "null")) ?? steps
const scope = get("--scope", "")
const out = process.env.CMP_OUT || "/private/tmp/claude-501/-Users-briyan/69aebd66-2167-4296-a31b-460bd947a6cd/scratchpad/cmp"
fs.mkdirSync(out, { recursive: true })
const PROPS = ["display", "position", "width", "height", "padding", "margin", "gap", "font-size", "font-weight", "line-height", "font-family",
  "letter-spacing", "text-transform", "text-align", "color", "background-color", "background-image", "border-radius", "border-width", "border-color", "border-style",
  "box-shadow", "outline-style", "opacity", "transform", "translate", "scale", "rotate", "filter", "overflow", "white-space", "flex-direction", "align-items",
  "justify-content", "grid-template-columns", "transition-property", "transition-duration", "transition-delay", "transition-timing-function",
  "animation-name", "animation-duration", "animation-delay", "animation-timing-function", "animation-iteration-count", "visibility", "cursor", "pointer-events",
  "stroke", "stroke-width", "fill", "stroke-dasharray", "mask-image", "inset", "z-index", "text-decoration-line", "font-variant-numeric",
  ...(get("--props", "") ? get("--props", "").split(",") : [])]

async function run(page, url, list) {
  await page.goto(url, { waitUntil: "networkidle" })
  await page.waitForTimeout(400)
  for (const s of list) {
    const root = `[data-demo="${slug}"] `
    if (s.click) await page.locator(root + s.click).first().click()
    if (s.hover) await page.locator(root + s.hover).first().hover()
    if (s.focus) await page.locator(root + s.focus).first().focus()
    if (s.fill) await page.locator(root + s.fill[0]).first().fill(s.fill[1])
    if (s.press) await page.keyboard.press(s.press)
    if (s.type) await page.keyboard.type(s.type, { delay: 20 })
    if (s.eval) await page.evaluate(s.eval)
    if (s.wait) await page.waitForTimeout(s.wait)
  }
  await page.waitForTimeout(wait)
  return page.evaluate(([slug, PROPS, scope]) => {
    const demo = document.querySelector(`[data-demo="${slug}"]`)
    if (!demo) return { error: "no demo" }
    const base = scope ? demo.querySelector(scope) ?? demo : demo
    const els = [...base.querySelectorAll("[data-slot]")].filter((el) => el.getAttribute("data-slot") !== "speed" && !el.closest("[data-agent-hidden]"))
    const counts = {}
    return els.map((el) => {
      const name = el.getAttribute("data-slot")
      const i = (counts[name] = (counts[name] ?? -1) + 1)
      const cs = getComputedStyle(el)
      const style = {}
      for (const p of PROPS) style[p] = cs.getPropertyValue(p)
      const attrs = {}
      for (const a of el.attributes) if (/^(data-|aria-|role$|type$|tabindex$|disabled$|hidden$|id$)/.test(a.name) && a.name !== "data-v-app") attrs[a.name] = /id$|controls$|labelledby$|describedby$|^for$/.test(a.name) ? "<id>" : a.value
      return { key: `${name}#${i}`, tag: el.tagName.toLowerCase(), style, attrs, text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80) }
    })
  }, [slug, PROPS, scope])
}

;(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true })
  const ctx = { viewport: { width: W, height: H }, deviceScaleFactor: 2 }
  const rp = await browser.newPage(ctx), vp = await browser.newPage(ctx)
  const errors = []
  for (const [n, p] of [["react", rp], ["vue", vp]]) {
    p.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`[${n}] ${m.type()}: ${m.text().slice(0, 300)}`) })
    p.on("pageerror", (e) => errors.push(`[${n}] ${String(e).slice(0, 300)}`))
  }
  const q = `?theme=${theme}&motion=${motion}&play=off`
  const [r, v] = await Promise.all([run(rp, `http://localhost:4610/${q}#/${slug}`, steps), run(vp, `http://localhost:4714/${q}#/${slug}`, vsteps)])
  if (r.error || v.error) console.log("ERROR", r.error, v.error)
  const rm = new Map(r.map((x) => [x.key, x])), vm = new Map(v.map((x) => [x.key, x]))
  let diffs = 0
  for (const key of new Set([...rm.keys(), ...vm.keys()])) {
    const a = rm.get(key), b = vm.get(key)
    if (!a || !b) { console.log(`${key}: only in ${a ? "react" : "vue"} ${(a ?? b).tag} "${(a ?? b).text}"`); diffs++; continue }
    const lines = []
    if (a.tag !== b.tag) lines.push(`  tag: ${a.tag} | ${b.tag}`)
    const norm = (x) => String(x).replace(/-?\d*\.\d+(e-?\d+)?/g, (n) => (+n).toFixed(1))
    for (const p of PROPS) if (norm(a.style[p]) !== norm(b.style[p])) lines.push(`  ${p}: ${a.style[p]} | ${b.style[p]}`)
    for (const k of new Set([...Object.keys(a.attrs), ...Object.keys(b.attrs)])) if (a.attrs[k] !== b.attrs[k]) lines.push(`  @${k}: ${a.attrs[k]} | ${b.attrs[k]}`)
    if (a.text !== b.text) lines.push(`  text: "${a.text}" | "${b.text}"`)
    if (lines.length) { console.log(`${key} (${a.tag}):\n${lines.join("\n")}`); diffs++ }
    else if (args.includes("--all")) console.log(`${key}: same`)
  }
  console.log(`\n${slug} ${motion} ${theme}: react ${r.length} slots, vue ${v.length} slots, ${diffs} differing`)
  if (errors.length) console.log("console:\n" + [...new Set(errors)].join("\n"))
  const shot = async (p) => {
    const box = await p.evaluate(([slug, sel]) => {
      const demo = document.querySelector(`[data-demo="${slug}"]`)
      const els = sel ? [...demo.querySelectorAll(sel)] : [...demo.querySelectorAll("[data-slot]")].filter((el) => el.getAttribute("data-slot") !== "speed" && !el.closest("[data-agent-hidden]"))
      if (!els.length) return null
      let node = els[0]
      while (node !== demo && !els.every((el) => node.contains(el))) node = node.parentElement
      /* Widen to the wrapper the demo draws around them (a card), but not the stage. */
      for (let up = node.parentElement; up && up !== document.body; up = up.parentElement) {
        const r = up.getBoundingClientRect()
        if (!r.width) continue
        if (r.width > innerWidth * 0.7) break
        node = up
        if (up === demo) break
      }
      const rs = [node, ...els].map((el) => el.getBoundingClientRect()).filter((r) => r.width && r.height)
      const x = Math.min(...rs.map((r) => r.left)) - 16, y = Math.min(...rs.map((r) => r.top)) - 16
      return { x: Math.max(0, x + scrollX), y: Math.max(0, y + scrollY), width: Math.max(...rs.map((r) => r.right)) + 16 - x, height: Math.max(...rs.map((r) => r.bottom)) + 16 - y }
    }, [slug, get("--shot", "")])
    return (await p.screenshot(box ? { clip: box, fullPage: true } : {})).toString("base64")
  }
  const [ra, va] = [await shot(rp), await shot(vp)]
  const cp = await browser.newPage({ viewport: { width: 1600, height: 600 }, deviceScaleFactor: 1 })
  await cp.setContent(`<body style="margin:0;display:flex;gap:16px;align-items:flex-start;background:#888;font:12px sans-serif">
    <div><div>React</div><img onload="this.style.width=this.naturalWidth/2+'px'" src="data:image/png;base64,${ra}"></div>
    <div><div>Vue</div><img onload="this.style.width=this.naturalWidth/2+'px'" src="data:image/png;base64,${va}"></div></body>`)
  const file = path.join(out, `${slug}-${motion}-${theme}${get("--label", "") ? "-" + get("--label") : ""}.png`)
  await cp.waitForTimeout(200)
  await cp.screenshot({ path: file, fullPage: true })
  console.log("shot:", file)
  await browser.close()
})()
