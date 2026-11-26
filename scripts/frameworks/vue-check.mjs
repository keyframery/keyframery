#!/usr/bin/env node
/* Vue ↔ React check for the generated Vue components, element by element.

   For each example of a component (src/examples/<slug>/<example>, converted to Vue by the bench in
   frameworks/bench/examples/vue), in ?motion=subtle and ?motion=springy, it loads
     React: the bench at http://localhost:4716/#/<slug>/<example>   (must be running)
     Vue:   frameworks/test/vue at http://localhost:4711/#/<slug>/<example>   (started here if not running)
   and compares every element with a data-slot, in document order per slot (portals included):
     - its classes (as a set), its data-* and aria-* attributes and role
     - its computed transition, animation, transform, opacity, radius, colours, shadow, size
     - the elements it adds of its own (children without a data-slot: chevrons, checks, copies), by tag
       and classes, down to the next data-slot
   then presses the first trigger it finds (…-trigger, or a button) in both and compares again.

   Usage: node scripts/frameworks/vue-check.mjs [--json out.json] [--no-press] slug[/example] ...
   Prints one block per example with every difference, and a one-line verdict per component. */

import { spawn } from "node:child_process"
import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const { chromium } = require("playwright-core")
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const args = process.argv.slice(2)
const jsonIdx = args.indexOf("--json")
const jsonOut = jsonIdx >= 0 ? args.splice(jsonIdx, 2)[1] : null
const noPress = args.includes("--no-press")
const motions = args.includes("--subtle") ? ["subtle"] : ["subtle", "springy"]
const targets = args.filter((a) => !a.startsWith("--"))
const REACT = "http://localhost:4716"
const VUE = "http://localhost:4711"

async function up(url) {
  try {
    return (await fetch(url)).ok
  } catch {
    return false
  }
}

const props = ["transitionProperty", "transitionDuration", "transitionTimingFunction", "transitionDelay", "animationName", "animationDuration", "animationDelay", "transform", "translate", "scale", "rotate", "opacity", "borderTopLeftRadius", "backgroundColor", "color", "boxShadow", "filter", "display", "position", "zIndex", "width", "height", "fontSize", "fontWeight", "paddingLeft", "paddingTop", "gap", "outlineStyle", "visibility", "overflow"]

/* In the page: every data-slot element, in document order. */
const probe = (props) => {
  const scope = document.querySelector("[data-bench-stage]")
  const inStage = (el) => (scope ? scope.contains(el) : true)
  const els = [...document.querySelectorAll("[data-slot]")].filter((el) => el.getAttribute("data-slot") !== "speed" && (inStage(el) || !el.closest("[data-bench-stage]")))
  const shape = (el, depth = 0) => {
    const out = []
    for (const c of el.children) {
      if (c.hasAttribute("data-slot")) continue
      if (c.tagName === "STYLE" || c.tagName === "SCRIPT") continue
      const cls = [...c.classList].sort().join(" ")
      const attrs = ["d", "viewBox", "stroke-width", "points", "r", "cx", "cy", "aria-hidden", "pathLength", "pathlength"].map((a) => (c.hasAttribute(a) ? `${a}=${c.getAttribute(a)}` : "")).filter(Boolean).join(",")
      out.push(`${"  ".repeat(depth)}<${c.tagName.toLowerCase()}${cls ? ` .${cls.slice(0, 400)}` : ""}${attrs ? ` [${attrs}]` : ""}>`)
      if (depth < 6) out.push(...shape(c, depth + 1))
    }
    return out
  }
  const counts = {}
  return els.map((el) => {
    const slot = el.getAttribute("data-slot")
    const n = (counts[slot] = (counts[slot] ?? 0) + 1) - 1
    const cs = getComputedStyle(el)
    const style = {}
    for (const p of props) style[p] = cs[p]
    const attrs = {}
    for (const a of el.attributes) if ((/^(data-|aria-)|^role$/.test(a.name) && !/^aria-(controls|labelledby|describedby|activedescendant|owns)$/.test(a.name) && a.name !== "data-slot") || a.name === "style") attrs[a.name] = a.name === "style" ? a.value.replace(/--[\w-]*(id|anchor)[^;]*;?/g, "") : /^:|«|^r[0-9a-z]+$|^ui-|^v-/i.test(a.value) ? "<id>" : a.value
    const r = el.getBoundingClientRect()
    return { key: `${slot}#${n}`, slot, tag: el.tagName.toLowerCase(), cls: [...el.classList].sort(), attrs, style, shape: shape(el), text: (el.textContent ?? "").trim().slice(0, 60), box: [Math.round(r.width), Math.round(r.height)] }
  })
}

function diff(react, vue) {
  const out = []
  const vmap = new Map(vue.map((e) => [e.key, e]))
  const rmap = new Map(react.map((e) => [e.key, e]))
  for (const r of react) {
    const v = vmap.get(r.key)
    if (!v) {
      out.push(`missing in vue: ${r.key} <${r.tag}>`)
      continue
    }
    if (r.tag !== v.tag) out.push(`${r.key}: tag ${r.tag} vs ${v.tag}`)
    const rc = new Set(r.cls), vc = new Set(v.cls)
    const onlyR = r.cls.filter((c) => !vc.has(c)), onlyV = v.cls.filter((c) => !rc.has(c))
    if (onlyR.length || onlyV.length) out.push(`${r.key}: class react-only [${onlyR.join(" ")}] vue-only [${onlyV.join(" ")}]`)
    for (const k of new Set([...Object.keys(r.attrs), ...Object.keys(v.attrs)])) if (r.attrs[k] !== v.attrs[k]) out.push(`${r.key}: attr ${k} = ${JSON.stringify(r.attrs[k])} vs ${JSON.stringify(v.attrs[k])}`)
    for (const k of Object.keys(r.style)) if (r.style[k] !== v.style[k]) out.push(`${r.key}: ${k} ${JSON.stringify(r.style[k]).slice(0, 140)} vs ${JSON.stringify(v.style[k]).slice(0, 140)}`)
    if (r.shape.join("\n") !== v.shape.join("\n")) out.push(`${r.key}: own elements differ\n      react: ${r.shape.join("\n             ")}\n      vue:   ${v.shape.join("\n             ")}`)
    if (Math.abs(r.box[0] - v.box[0]) > 1 || Math.abs(r.box[1] - v.box[1]) > 1) out.push(`${r.key}: size ${r.box.join("×")} vs ${v.box.join("×")}`)
  }
  for (const v of vue) if (!rmap.has(v.key)) out.push(`extra in vue: ${v.key} <${v.tag}>`)
  return out
}

async function snapshot(page) {
  return page.evaluate(probe, props)
}

async function press(page) {
  for (const sel of ['[data-bench-stage] [data-slot$="-trigger"]', '[data-bench-stage] [data-slot="button"]', "[data-bench-stage] button"]) {
    const loc = page.locator(sel).first()
    if (await loc.count()) {
      const name = await loc.getAttribute("data-slot")
      await loc.click({ timeout: 2000 }).catch(() => {})
      return name ?? sel
    }
  }
  return null
}

async function main() {
  /* The React bench is the bench builder's (frameworks/bench/react, port 4716): used as it runs, or
     started for this check and stopped at the end. */
  let reactServer = null
  /* Other builders' bench runs start and stop 4716 too: make sure it answers before every example. */
  const ensureReact = async () => {
    if (await up(REACT)) return
    if (reactServer) try { process.kill(-reactServer.pid) } catch {}
    const dir = path.join(root, "frameworks/bench/react")
    reactServer = spawn(path.join(root, "node_modules/.bin/vite"), ["--config", "vite.config.ts", "--port", "4716", "--strictPort"], { cwd: dir, stdio: "ignore", detached: true })
    for (let i = 0; i < 160 && !(await up(REACT)); i++) await new Promise((r) => setTimeout(r, 250))
  }
  await ensureReact()
  let server = null
  if (!(await up(VUE))) {
    const dir = path.join(root, "frameworks/test/vue")
    server = spawn(path.join(dir, "node_modules/.bin/vite"), ["--port", "4711", "--strictPort"], { cwd: dir, stdio: "ignore", detached: true })
    for (let i = 0; i < 120 && !(await up(VUE)); i++) await new Promise((r) => setTimeout(r, 250))
  }
  const exDir = path.join(root, "frameworks/test/vue/src/examples")
  const list = []
  for (const t of targets.length ? targets : fs.readdirSync(exDir)) {
    const [slug, ex] = t.split("/")
    const exs = ex ? [ex] : fs.readdirSync(path.join(exDir, slug)).filter((f) => f.endsWith(".vue")).map((f) => f.slice(0, -4))
    for (const e of exs) list.push(`${slug}/${e}`)
  }
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 }, reducedMotion: "no-preference" })
  const results = {}
  for (const id of list) {
    for (const motion of motions) {
      await ensureReact()
      const pages = {}
      const errors = []
      for (const [name, base] of [["react", REACT], ["vue", VUE]]) {
        const page = await ctx.newPage()
        page.on("pageerror", (e) => errors.push(`${name}: ${e.message}`))
        page.on("console", (m) => m.type() === "error" && errors.push(`${name} console: ${m.text().slice(0, 200)}`))
        await page.goto(`${base}/?motion=${motion}#/${id}`)
        await page.waitForSelector("[data-bench-ready]", { timeout: 8000 }).catch(() => {})
        await page.waitForTimeout(900)
        pages[name] = page
      }
      const [sr, sv] = [await snapshot(pages.react), await snapshot(pages.vue)]
      const rest = diff(sr, sv)
      const counted = `${sr.length} react / ${sv.length} vue elements`
      let pressed = []
      if (!noPress) {
        const pr = await press(pages.react)
        const pv = await press(pages.vue)
        if (pr || pv) {
          await Promise.all([pages.react.waitForTimeout(1200), pages.vue.waitForTimeout(1200)])
          const [ar, av] = [await snapshot(pages.react), await snapshot(pages.vue)]
          pressed = [`(pressed ${pr}: ${ar.length} react / ${av.length} vue elements)`, ...diff(ar, av).filter((d) => !rest.includes(d)).map((d) => `after press: ${d}`)]
        }
      }
      for (const p of Object.values(pages)) await p.close()
      const all = [...errors.filter((e) => !/favicon|Download the Vue Devtools/.test(e)), ...rest, ...pressed]
      results[`${id}@${motion}`] = all
      const real = all.filter((d) => !d.startsWith("("))
      console.log(`\n=== ${id} (${motion}, ${counted}): ${real.length ? real.length + " differences" : "identical"}`)
      for (const d of all.slice(0, 60)) console.log("  " + d)
      if (all.length > 60) console.log(`  … ${all.length - 60} more`)
    }
  }
  await browser.close()
  if (server) process.kill(-server.pid)
  if (reactServer) try { process.kill(-reactServer.pid) } catch {}
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(results, null, 2))
  const bySlug = {}
  for (const [k, v] of Object.entries(results)) {
    const slug = k.split("/")[0]
    bySlug[slug] = (bySlug[slug] ?? 0) + v.filter((d) => !d.startsWith("(")).length
  }
  console.log("\n" + Object.entries(bySlug).map(([s, n]) => `${s.padEnd(20)} ${n ? n + " differences" : "identical"}`).join("\n"))
}

main()
