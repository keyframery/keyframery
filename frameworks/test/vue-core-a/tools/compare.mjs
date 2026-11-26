/* React lab (4610) vs this Vue test app (4713), one demo, as a DOM + computed-style diff and side-by-side shots.

   node tools/compare.mjs <slug> [--motion subtle,springy] [--steps '<json>'] [--wait 1600] [--theme dark] [--out dir] [--quiet]

   Steps run on both pages: {"hover":sel} {"click":sel} {"press":"Tab"} {"type":"abc"} {"wait":ms} {"move":[x,y]}
   {"focus":sel}. Selectors are scoped to the demo (prefix with "page:" for a page-wide one).
   The tree: every element under the stage, its tag, data-slot, sorted classes and attributes (generated ids
   renumbered), direct text, and for each data-slot element a line of computed styles. `diff` prints the
   differences; React is "<", Vue is ">". */
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"

const require = createRequire(import.meta.url)
const { chromium } = require("/Users/briyan/keyframery-ui-lab/node_modules/playwright-core")

const args = process.argv.slice(2)
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args.splice(i, 2)[1] : def
}
const flag = (name) => {
  const i = args.indexOf(`--${name}`)
  if (i >= 0) args.splice(i, 1)
  return i >= 0
}
const motions = opt("motion", "subtle,springy").split(",")
const steps = JSON.parse(opt("steps", "[]"))
const wait = Number(opt("wait", "1600"))
const theme = opt("theme", "light")
const width = Number(opt("width", "1280"))
const out = opt("out", "/private/tmp/claude-501/-Users-briyan/69aebd66-2167-4296-a31b-460bd947a6cd/scratchpad/vue-core-a")
const quiet = flag("quiet")
const noStyles = flag("no-styles")
const [slug] = args
fs.mkdirSync(out, { recursive: true })

const sides = {
  react: { url: (m) => `http://localhost:4610/?play=off&motion=${m}${theme === "dark" ? "&theme=dark" : ""}#/${slug}`, root: `[data-demo="${slug}"] > [data-agent-preview-content]` },
  vue: { url: (m) => `http://localhost:4713/?motion=${m}${theme === "dark" ? "&theme=dark" : ""}#/${slug}`, root: `[data-demo="${slug}"] > [data-stage]` },
}

const STYLE = ["transitionProperty", "transitionDuration", "transitionTimingFunction", "transitionDelay", "animationName", "animationDuration", "animationDelay", "animationTimingFunction", "transform", "translate", "scale", "opacity", "filter", "borderTopLeftRadius", "backgroundColor", "boxShadow", "color", "fontSize", "fontWeight", "lineHeight", "paddingTop", "paddingLeft", "gap", "display", "width", "height"]

function snapshot({ root, STYLE, noStyles }) {
  const scope = document.querySelector(root)
  if (!scope) return "NO ROOT " + root
  const ids = new Map()
  for (const el of scope.querySelectorAll("[id]")) if (!ids.has(el.id)) ids.set(el.id, `ID${ids.size + 1}`)
  const fixIds = (v) => v.split(/\s+/).map((t) => ids.get(t) ?? t).join(" ")
  const lines = []
  const skip = new Set(["id", "class", "data-playback", "data-agent-preview-content", "data-stage"])
  const walk = (el, depth) => {
    const tag = el.tagName.toLowerCase()
    const attrs = []
    for (const a of [...el.attributes].sort((x, y) => x.name.localeCompare(y.name))) {
      if (skip.has(a.name)) continue
      let v = a.value
      if (/^(aria-(controls|labelledby|describedby|owns|activedescendant)|for|headers|list|form)$/.test(a.name)) v = fixIds(v)
      if (a.name === "style") v = v.replace(/\s+/g, " ").trim()
      attrs.push(`${a.name}=${JSON.stringify(v)}`)
    }
    if (el.id) attrs.push(`id=${ids.get(el.id)}`)
    const cls = [...el.classList].sort().join(" ")
    let text = ""
    for (const n of el.childNodes) if (n.nodeType === 3) text += n.textContent
    text = text.replace(/\s+/g, " ").trim()
    const pad = "  ".repeat(depth)
    lines.push(`${pad}<${tag}${attrs.length ? " " + attrs.join(" ") : ""}>${text ? ` "${text.slice(0, 80)}"` : ""}`)
    if (cls) lines.push(`${pad}  .${cls}`)
    if (!noStyles && el.hasAttribute("data-slot")) {
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      const v = STYLE.map((p) => {
        if (p === "width") return `w=${Math.round(r.width)}`
        if (p === "height") return `h=${Math.round(r.height)}`
        const x = String(cs[p]).replace(/\s+/g, " ")
        return `${p}=${x.length > 140 ? x.slice(0, 140) + "…" : x}`
      })
      lines.push(`${pad}  ~ ${v.join(" | ")}`)
    }
    for (const c of el.children) walk(c, depth + 1)
  }
  for (const c of scope.children) walk(c, 0)
  /* Portalled popups: direct children of body other than the app roots. */
  const portals = [...document.body.children].filter((el) => !["root", "app"].includes(el.id) && !/^(SCRIPT|STYLE|TEMPLATE)$/.test(el.tagName) && el.querySelector("[data-slot]"))
  if (portals.length) {
    lines.push("== portal")
    for (const c of portals) walk(c, 0)
  }
  return lines.join("\n")
}

async function runStep(page, root, s) {
  const loc = (sel) => (sel.startsWith("page:") ? page.locator(sel.slice(5)) : page.locator(`${root} ${sel}`)).first()
  if (s.hover) await loc(s.hover).hover()
  if (s.click) await loc(s.click).click()
  if (s.focus) await loc(s.focus).focus()
  if (s.press) await page.keyboard.press(s.press)
  if (s.type) await page.keyboard.type(s.type)
  if (s.fill) await loc(s.fill[0]).fill(s.fill[1])
  if (s.move) await page.mouse.move(...s.move)
  if (s.record) await page.evaluate((root) => {
    /* Records every animation and transition that runs from now on (slot, kind, property, duration, delay, easing). */
    window.__kf = new Set()
    const owner = (el) => {
      if (!el) return "?"
      const own = el.getAttribute?.("data-slot")
      if (own) return own
      const up = el.parentElement?.closest("[data-slot]")
      return up ? `${up.getAttribute("data-slot")}>${el.tagName.toLowerCase()}` : el.tagName.toLowerCase()
    }
    const tick = () => {
      const scope = document.querySelector(root)
      for (const a of document.getAnimations()) {
        if (!scope?.contains(a.effect?.target)) continue
        const t = a.effect.getTiming()
        const what = a.constructor.name === "CSSTransition" ? "transition " + a.transitionProperty : "animation " + a.animationName
        window.__kf.add(`${owner(a.effect?.target)}${a.effect?.pseudoElement ?? ""} ${what} ${Math.round(t.duration)}ms +${Math.round(t.delay)}ms ${String(t.easing).slice(0, 40)}`)
      }
      if (window.__kf) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, root)
  if (s.wait) await page.waitForTimeout(s.wait)
}

const browser = await chromium.launch({ channel: "chrome", headless: true })
let total = 0
try {
  for (const motion of motions) {
    const shots = {}
    const trees = {}
    const errors = {}
    for (const [name, side] of Object.entries(sides)) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 })
      errors[name] = []
      page.on("console", (m) => m.type() === "error" && errors[name].push(m.text().slice(0, 300)))
      page.on("pageerror", (e) => errors[name].push(e.message.slice(0, 300)))
      await page.goto(side.url(motion), { waitUntil: "load" })
      await page.mouse.move(2, 2)
      await page.waitForTimeout(wait)
      for (const s of steps) await runStep(page, side.root, s)
      trees[name] = await page.evaluate(snapshot, { root: side.root, STYLE, noStyles })
      const anims = await page.evaluate(() => (window.__kf ? [...window.__kf].filter((k) => !/^(button|div|a|span|svg)\b/.test(k) || true).sort() : null))
      if (anims) trees[name] += "\n== animations\n" + anims.join("\n")
      const file = path.join(out, `${slug}-${motion}-${name}.png`)
      const el = page.locator(side.root).first()
      if (await el.count()) await el.screenshot({ path: file })
      shots[name] = file
      await page.close()
    }
    const a = path.join(out, `${slug}-${motion}-react.txt`)
    const b = path.join(out, `${slug}-${motion}-vue.txt`)
    fs.writeFileSync(a, trees.react)
    fs.writeFileSync(b, trees.vue)
    let d = ""
    try {
      execFileSync("diff", [a, b])
    } catch (e) {
      d = e.stdout.toString()
    }
    const n = d.split("\n").filter((l) => /^[<>]/.test(l)).length
    total += n
    console.log(`\n== ${slug} ${motion}${theme === "dark" ? " dark" : ""}: ${n ? `${n} differing lines` : "IDENTICAL tree + styles"}`)
    if (errors.vue.length) console.log("  vue errors:", errors.vue)
    if (errors.react.length) console.log("  react errors:", errors.react)
    if (d && !quiet) console.log(d.split("\n").slice(0, 120).join("\n"))
    /* Side by side. */
    const img = (f) => (fs.existsSync(f) ? `data:image/png;base64,${fs.readFileSync(f).toString("base64")}` : "")
    const page = await browser.newPage({ viewport: { width: 2 * 1120 + 30, height: 700 } })
    await page.setContent(`<body style="margin:0;background:#ccc;font:600 13px system-ui"><div style="display:flex;gap:10px;padding:10px;align-items:flex-start">
      <div>react<br><img src="${img(shots.react)}" style="display:block"></div><div>vue<br><img src="${img(shots.vue)}" style="display:block"></div></div></body>`)
    await page.screenshot({ path: path.join(out, `${slug}-${motion}${theme === "dark" ? "-dark" : ""}.png`), fullPage: true })
    await page.close()
  }
} finally {
  await browser.close()
}
console.log(`\nshots + trees in ${out}`)
process.exit(0)
