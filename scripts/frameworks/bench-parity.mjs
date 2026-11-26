#!/usr/bin/env node
/* Keyframery bench parity: does every Vue example look, move and behave like its React original?

   Compares the React bench (frameworks/bench/react, port 4716: src/examples rendered with src/components) with the
   Vue bench (frameworks/bench/vue, port 4715: frameworks/bench/examples/vue rendered with frameworks/vue), for every
   example present in both, in ?motion=subtle and ?motion=springy:

   (a) page errors and console errors, React and Vue;
   (b) every [data-slot] element in React exists in Vue (matched by slot name and order), with the same tag and the
       same data-* and ARIA state attributes;
   (c) the computed style of each one at rest: display, position, size (1px), colour, background, border, radius,
       shadow, opacity, transform, padding, gap, type, transition-* and animation-*;
   (d) one scripted interaction chosen by what the example contains (open a popup, click a tab, toggle a switch,
       arrow keys in a list…), the same comparisons after it, and the motion during it: the CSS transitions and
       animations that start, and the moving part's box, opacity and transform sampled every frame;
   (e) a side-by-side screenshot, React left and Vue right, at rest (top) and after the interaction (bottom):
       frameworks/bench/shots/<slug>--<example>--<motion>.png

   Results: frameworks/bench/report.{md,json} for a full run, report-<slugs>.{md,json} for a narrowed one (or
   --out <name>), with a verdict per component:
   identical / differs (what) / missing in Vue (not built, or no example port, or fails to load).

   Starts both benches itself (or reuses ones already answering) and stops what it started.

   Usage: node scripts/frameworks/bench-parity.mjs [slug | slug/example ...]
            [--motion subtle,springy] [--jobs 4] [--out name] [--no-shots] [--no-serve] [--quiet]
   Safe to run several at once: they share the two servers, and the last one to finish stops the ones a run started. */

import { spawn } from "node:child_process"
import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const { chromium } = require("playwright-core")
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const benchDir = path.join(root, "frameworks/bench")
const shotsDir = path.join(benchDir, "shots")

/* ---------- options ---------- */

const argv = process.argv.slice(2)
const opt = (name, def) => {
  const i = argv.indexOf(name)
  if (i < 0) return def
  const v = argv[i + 1]
  argv.splice(i, 2)
  return v
}
const motions = opt("--motion", "subtle,springy").split(",")
const outOpt = opt("--out", null)
const jobsN = Number(opt("--jobs", "4"))
const flag = (n) => {
  const i = argv.indexOf(n)
  if (i >= 0) argv.splice(i, 1)
  return i >= 0
}
const noShots = flag("--no-shots")
const noServe = flag("--no-serve")
const quiet = flag("--quiet")
const filters = argv.filter((a) => !a.startsWith("--"))
/* Report name: --out <name>, else "report" for a full run and "report-<slugs>" for a narrowed one, so runs by
   different builders don't overwrite each other's results. */
const outName = outOpt ?? (filters.length ? `report-${filters.map((f) => f.replace(/[^a-z0-9-]+/gi, "_")).join("+")}`.slice(0, 120) : "report")

const REACT = { name: "react", port: 4716, dir: path.join(benchDir, "react") }
const VUE = { name: "vue", port: 4715, dir: path.join(benchDir, "vue") }
const url = (b, id, motion) => `http://localhost:${b.port}/?motion=${motion}#/${id}`
const VIEW = { width: 900, height: 700 }

/* ---------- what to compare ---------- */

const styleProps = [
  "display", "position", "boxSizing", "overflowX", "overflowY", "visibility",
  "color", "backgroundColor", "backgroundImage",
  "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "borderTopStyle", "borderTopColor", "borderBottomColor", "outlineStyle",
  "borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius",
  "boxShadow", "opacity", "filter", "backdropFilter",
  "transform", "translate", "scale", "rotate", "transformOrigin",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "rowGap", "columnGap",
  "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textAlign", "whiteSpace",
  "cursor", "pointerEvents", "zIndex",
  "transitionProperty", "transitionDuration", "transitionTimingFunction", "transitionDelay",
  "animationName", "animationDuration", "animationTimingFunction", "animationDelay", "animationIterationCount", "animationFillMode",
]
const group = (p) => {
  if (/^(display|position|boxSizing|overflow|visibility|zIndex|pointerEvents|cursor)/.test(p)) return "layout"
  if (/^(color|background)/.test(p)) return "colour"
  if (/^border.*Radius$/.test(p)) return "radius"
  if (/^(border|outline)/.test(p)) return "border"
  if (p === "boxShadow") return "shadow"
  if (/^(opacity|filter|backdropFilter)$/.test(p)) return "opacity/filter"
  if (/^(transform|translate|scale|rotate|transformOrigin)$/.test(p)) return "transform"
  if (/^(padding|rowGap|columnGap)/.test(p)) return "spacing"
  if (/^(font|line|letter|text|whiteSpace)/.test(p)) return "type"
  if (p.startsWith("transition")) return "transition"
  if (p.startsWith("animation")) return "animation"
  return "other"
}
const ariaAttrs = ["role", "aria-expanded", "aria-selected", "aria-checked", "aria-pressed", "aria-disabled", "aria-hidden", "aria-current", "aria-orientation", "aria-invalid", "aria-busy", "aria-live", "hidden", "disabled", "tabindex", "type"]
/* Generated ids differ between frameworks by design: compare their presence, not their value. */
const idLike = (name, v) => /-id$|^data-(base|uid)/.test(name) || /[«»:]|^_?r_?[0-9a-z]+_?$|[0-9a-f]{8}-[0-9a-f]{4}|^kf-[0-9a-z]+$|^v-\d+/.test(v ?? "")

/* One interaction per component kind: the first recipe whose target React renders is played on both. */
const popupTriggers = ["dialog", "alert-dialog", "drawer", "popover", "menu", "select", "combobox", "date-picker", "navigation-menu", "menubar", "command", "filter", "native-select", "color-picker", "button-group", "breadcrumb", "sidebar"].map((c) => `[data-slot="${c}-trigger"]`)
const recipes = [
  { kind: "tabs", target: '[data-slot="tabs-tab"]', nth: "last", act: "click", measure: '[data-slot="tabs-indicator"]' },
  { kind: "segmented", target: '[data-slot="segmented-control-item"]:not([data-selected]):not([data-checked]):not([data-pressed])', nth: "last", act: "click", measure: '[data-slot="segmented-control-indicator"]' },
  { kind: "switch", target: '[data-slot="switch"]', act: "click", measure: '[data-slot="switch-thumb"]' },
  { kind: "tooltip", target: '[data-slot="tooltip-trigger"], [data-slot="hover-card-trigger"]', act: "hover", measure: "popup" },
  { kind: "context-menu", target: '[data-slot="context-menu-trigger"]', act: "rightclick", measure: "popup" },
  { kind: "popup", target: popupTriggers.join(", "), act: "click", measure: "popup" },
  { kind: "disclosure", target: '[data-slot="accordion-trigger"], [data-slot="collapsible-trigger"], [data-slot="reasoning-trigger"], [data-slot="tool-call-trigger"], [data-slot="trace-trigger"]', act: "click", measure: '[data-slot="accordion-panel"], [data-slot="collapsible-panel"], [data-slot="collapsible-content"], [data-slot="reasoning-content"], [data-slot="tool-call-content"]' },
  { kind: "slider", target: '[data-slot="slider-thumb"]', act: "keys", keys: ["ArrowRight", "ArrowRight", "ArrowRight"], measure: '[data-slot="slider-indicator"], [data-slot="slider-range"]' },
  { kind: "check", target: '[data-slot="checkbox"]:not([data-checked]), [data-slot="radio"]:not([data-checked]), [data-slot="toggle"], [data-slot="rating-item"]', act: "click", measure: "target" },
  { kind: "list", target: '[data-slot="listbox-item"], [data-slot="tree-item"], [data-slot="command-item"], [data-slot="toolbar-button"], [data-slot="menubar-trigger"]', act: "keys", focus: true, keys: ["ArrowDown", "ArrowDown", "ArrowRight"], measure: "focus" },
  { kind: "pager", target: '[data-slot="pagination-next"], [data-slot="carousel-next"], [data-slot="calendar-next"], [data-slot="number-input-increment"]', act: "click", measure: "target" },
  { kind: "input", target: '[data-slot="input"], [data-slot="textarea"], [data-slot="otp-input-input"], [data-slot="password-input-input"], [data-slot="token-input-editor"], [data-slot="prompt-composer-input"], [data-slot="autocomplete-input"], [data-slot="combobox-input"]', act: "type", text: "ab", measure: "target" },
  { kind: "button", target: '[data-slot="button"]', act: "click", measure: "target" },
]

/* ---------- servers ---------- */

async function answering(port) {
  try {
    const r = await fetch(`http://localhost:${port}/`)
    return r.ok
  } catch {
    return false
  }
}
async function waitFor(port, ms = 40000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    if (await answering(port)) return true
    await new Promise((r) => setTimeout(r, 250))
  }
  return false
}
function startBench(b) {
  const vite = b === REACT ? path.join(root, "node_modules/.bin/vite") : path.join(b.dir, "node_modules/.bin/vite")
  if (!fs.existsSync(vite)) throw new Error(`${vite} is missing: run \`pnpm install --ignore-workspace\` in ${b.dir}`)
  const args = b === REACT ? ["--config", path.join(b.dir, "vite.config.ts"), "--port", String(b.port), "--strictPort"] : ["--port", String(b.port), "--strictPort"]
  const log = fs.openSync(path.join(benchDir, `.${b.name}-server.log`), "w")
  return spawn(vite, args, { cwd: b.dir, stdio: ["ignore", log, log], detached: true })
}

/* ---------- discovery ---------- */

function listExamples() {
  const react = {}
  for (const slug of fs.readdirSync(path.join(root, "src/examples")).sort()) {
    const d = path.join(root, "src/examples", slug)
    if (!fs.statSync(d).isDirectory()) continue
    react[slug] = fs.readdirSync(d).filter((f) => f.endsWith(".tsx")).map((f) => f.replace(/\.tsx$/, "")).sort()
  }
  const vueDir = path.join(benchDir, "examples/vue")
  const vue = {}
  if (fs.existsSync(vueDir))
    for (const slug of fs.readdirSync(vueDir)) {
      const d = path.join(vueDir, slug)
      if (fs.statSync(d).isDirectory()) vue[slug] = fs.readdirSync(d).filter((f) => f.endsWith(".vue")).map((f) => f.replace(/\.vue$/, ""))
    }
  return { react, vue }
}

/* The Keyframery components a Vue example imports, and which of them frameworks/vue doesn't have yet. */
function missingVueComponents(slug, ex) {
  const src = fs.readFileSync(path.join(benchDir, "examples/vue", slug, ex + ".vue"), "utf8")
  const used = [...src.matchAll(/from "@\/components\/keyframery\/([a-z0-9-]+)"/g)].map((m) => m[1])
  return [...new Set(used)].filter((c) => !fs.existsSync(path.join(root, "frameworks/vue", c, "index.ts")))
}

/* ---------- in-page probes (run in the browser) ---------- */

const snapshot = ({ styleProps, ariaAttrs }) => {
  const out = []
  const counts = {}
  for (const el of document.querySelectorAll("[data-slot]")) {
    if (el.closest("[data-bench-error]")) continue
    const slot = el.getAttribute("data-slot")
    const i = (counts[slot] = (counts[slot] ?? -1) + 1)
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    const data = {}
    for (const a of el.attributes) if (a.name.startsWith("data-") && a.name !== "data-slot") data[a.name] = a.value
    const aria = {}
    for (const n of ariaAttrs) if (el.hasAttribute(n)) aria[n] = el.getAttribute(n)
    const style = {}
    for (const p of styleProps) style[p] = cs[p]
    out.push({ key: `${slot}#${i}`, slot, tag: el.tagName.toLowerCase(), data, aria, style, rect: { x: r.x, y: r.y, w: r.width, h: r.height }, text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80) })
  }
  return out
}

/* Waits until nothing finite is animating (entrances, popups), up to `max` ms. */
const settle = async (max) => {
  await document.fonts?.ready
  const t0 = performance.now()
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  while (performance.now() - t0 < max) {
    const busy = document.getAnimations().some((a) => {
      const t = a.effect?.getTiming?.()
      return a.playState === "running" && t && t.iterations !== Infinity && (typeof t.duration !== "number" || t.duration < 5000)
    })
    if (!busy) return performance.now() - t0
    await new Promise((r) => setTimeout(r, 50))
  }
  return max
}

/* Starts recording: every animation that runs (owner slot, kind, property, duration, delay, easing), and the
   measured element's box, opacity and transform every frame, for `ms`. */
const startProbe = ({ measure, targetSel, targetNth, ms }) => {
  const rec = (window.__kfProbe = { anims: {}, frames: [], done: false })
  const owner = (el) => {
    if (!el) return "?"
    const own = el.getAttribute?.("data-slot")
    if (own) return own
    const up = el.parentElement?.closest("[data-slot]")
    return up ? `${up.getAttribute("data-slot")}>${el.tagName.toLowerCase()}` : el.tagName.toLowerCase()
  }
  const before = new Set(document.querySelectorAll("[data-open], [data-slot$='-content'], [data-slot$='-popup'], [role='dialog'], [role='menu'], [role='listbox'], [role='tooltip']"))
  const pick = () => {
    if (measure === "focus") return document.activeElement?.closest("[data-slot]") ?? document.activeElement
    if (measure === "target") {
      const all = document.querySelectorAll(targetSel)
      return targetNth === "last" ? all[all.length - 1] : all[0]
    }
    if (measure === "popup") {
      const cands = [...document.querySelectorAll("[data-slot$='-content'], [data-slot$='-popup'], [role='dialog'], [role='menu'], [role='listbox'], [role='tooltip']")].filter((e) => !before.has(e) || e.hasAttribute("data-open"))
      return cands.find((e) => e.getBoundingClientRect().width > 0) ?? null
    }
    return document.querySelector(measure)
  }
  const t0 = performance.now()
  const tick = () => {
    for (const a of document.getAnimations()) {
      const el = a.effect?.target
      const t = a.effect?.getTiming?.()
      if (!t) continue
      const kind = a.constructor.name === "CSSTransition" ? "transition" : "animation"
      const what = kind === "transition" ? a.transitionProperty : a.animationName
      const pseudo = a.effect?.pseudoElement ?? ""
      /* A transition that reverses midway runs for a shortened time that depends on when it reversed, so
         transitions are named without their timing (the declared timing is compared as computed style). */
      const timing = kind === "transition" ? "" : `|${Math.round(t.duration)}ms|${Math.round(t.delay)}ms`
      const key = `${owner(el)}${pseudo}|${kind}|${what}${timing}|${String(t.easing).replace(/\s+/g, " ").slice(0, 48)}`
      rec.anims[key] = (rec.anims[key] ?? 0) + 1
    }
    const m = pick()
    if (m) {
      const r = m.getBoundingClientRect()
      const cs = getComputedStyle(m)
      rec.frames.push({ t: performance.now() - t0, slot: m.getAttribute?.("data-slot") ?? m.tagName.toLowerCase(), x: r.x, y: r.y, w: r.width, h: r.height, o: +cs.opacity, tf: cs.transform, sc: cs.scale })
    }
    if (performance.now() - t0 < ms) requestAnimationFrame(tick)
    else rec.done = true
  }
  requestAnimationFrame(tick)
}

/* ---------- comparison ---------- */

/* Same value but for sub-pixel layout rounding (transform-origin 73.97px vs 73.98px): every number within 0.5. */
function nearlySame(a, b) {
  const num = /-?\d*\.?\d+(?:e-?\d+)?/g
  if (String(a).replace(num, "#") !== String(b).replace(num, "#")) return false
  const x = String(a).match(num) ?? []
  const y = String(b).match(num) ?? []
  return x.length === y.length && x.every((n, i) => Math.abs(Number(n) - Number(y[i])) <= 0.5)
}

function diffSnapshots(R, V, phase) {
  const diffs = []
  const vByKey = new Map(V.map((e) => [e.key, e]))
  const rKeys = new Set(R.map((e) => e.key))
  for (const r of R) {
    const v = vByKey.get(r.key)
    if (!v) {
      diffs.push({ phase, key: r.key, type: "slot missing in Vue" })
      continue
    }
    if (r.tag !== v.tag) diffs.push({ phase, key: r.key, type: "tag", react: r.tag, vue: v.tag })
    for (const [kind, rs, vs] of [["data", r.data, v.data], ["aria", r.aria, v.aria]]) {
      for (const n of new Set([...Object.keys(rs), ...Object.keys(vs)])) {
        const a = rs[n]
        const b = vs[n]
        if (a === b) continue
        if (a !== undefined && b !== undefined && idLike(n, a) && idLike(n, b)) continue
        diffs.push({ phase, key: r.key, type: kind === "data" ? "data-* attribute" : "aria/state attribute", prop: n, react: a ?? null, vue: b ?? null })
      }
    }
    for (const p of styleProps) {
      if (r.style[p] !== v.style[p] && !nearlySame(r.style[p], v.style[p])) diffs.push({ phase, key: r.key, type: `style: ${group(p)}`, prop: p, react: r.style[p], vue: v.style[p] })
    }
    if (Math.abs(r.rect.w - v.rect.w) > 1 || Math.abs(r.rect.h - v.rect.h) > 1)
      diffs.push({ phase, key: r.key, type: "size", react: `${r.rect.w.toFixed(1)}×${r.rect.h.toFixed(1)}`, vue: `${v.rect.w.toFixed(1)}×${v.rect.h.toFixed(1)}` })
    else if (Math.abs(r.rect.x - v.rect.x) > 1 || Math.abs(r.rect.y - v.rect.y) > 1)
      diffs.push({ phase, key: r.key, type: "position", react: `${r.rect.x.toFixed(1)},${r.rect.y.toFixed(1)}`, vue: `${v.rect.x.toFixed(1)},${v.rect.y.toFixed(1)}` })
  }
  for (const v of V) if (!rKeys.has(v.key)) diffs.push({ phase, key: v.key, type: "extra slot in Vue", minor: true })
  return diffs
}

/* Same motion? Compares the sampled series on a common clock, allowing one frame of slack either way. */
function diffMotion(R, V) {
  const diffs = []
  if (!R?.frames.length) return diffs
  if (!V?.frames.length) return [{ phase: "motion", type: "motion: nothing to sample in Vue", key: R.frames[0].slot }]
  /* Line both series up at the moment they start to move: the click lands a few ms later on one page than the
     other, which is not a difference in the component. */
  const align = (fr) => {
    const f0 = fr[0]
    const i = fr.findIndex((f) => Math.abs(f.w - f0.w) > 0.5 || Math.abs(f.h - f0.h) > 0.5 || Math.abs(f.x - f0.x) > 0.5 || Math.abs(f.y - f0.y) > 0.5 || Math.abs(f.o - f0.o) > 0.01 || f.tf !== f0.tf || f.slot !== f0.slot)
    const t0 = i > 0 ? fr[i - 1].t : fr[0].t
    return fr.filter((f) => f.t >= t0).map((f) => ({ ...f, t: f.t - t0 }))
  }
  R = { ...R, frames: align(R.frames) }
  V = { ...V, frames: align(V.frames) }
  const at = (fr, t) => {
    let best = fr[0]
    for (const f of fr) if (Math.abs(f.t - t) < Math.abs(best.t - t)) best = f
    return best
  }
  const near = (fr, t) => [at(fr, t - 17), at(fr, t), at(fr, t + 17)]
  const worst = { w: 0, h: 0, x: 0, y: 0, o: 0 }
  const end = Math.min(R.frames[R.frames.length - 1].t, V.frames[V.frames.length - 1].t)
  for (let t = 0; t <= end; t += 16) {
    const r = at(R.frames, t)
    const vs = near(V.frames, t)
    for (const k of ["w", "h", "x", "y", "o"]) {
      const d = Math.min(...vs.map((v) => Math.abs(v[k] - r[k])))
      if (d > worst[k]) worst[k] = d
    }
  }
  const slot = R.frames[0].slot
  for (const [k, lim, label] of [["w", 3, "width"], ["h", 3, "height"], ["x", 3, "x"], ["y", 3, "y"], ["o", 0.1, "opacity"]])
    if (worst[k] > lim) diffs.push({ phase: "motion", key: slot, type: `motion: ${label} during the move`, react: null, vue: null, prop: `max gap ${k === "o" ? worst[k].toFixed(2) : worst[k].toFixed(1) + "px"}` })
  /* The stretch (largest width over the larger end width), the moving keys' signature. */
  const stretch = (fr) => +(Math.max(...fr.map((f) => f.w)) / Math.max(fr[0].w, fr[fr.length - 1].w, 0.001)).toFixed(3)
  const rs = stretch(R.frames)
  const vs = stretch(V.frames)
  if (Math.abs(rs - vs) > 0.03) diffs.push({ phase: "motion", key: slot, type: "motion: stretch", react: rs, vue: vs })
  return diffs
}

function diffAnims(R, V) {
  const norm = (k) => k
  const r = new Set(Object.keys(R?.anims ?? {}).map(norm))
  const v = new Set(Object.keys(V?.anims ?? {}).map(norm))
  const diffs = []
  for (const k of r) if (!v.has(k)) diffs.push({ phase: "motion", key: k.split("|")[0], type: "motion: animation missing in Vue", prop: k })
  for (const k of v) if (!r.has(k)) diffs.push({ phase: "motion", key: k.split("|")[0], type: "motion: extra animation in Vue", prop: k })
  return diffs
}

/* ---------- one side of one example ---------- */

async function runSide(context, bench, id, motion, recipeIn) {
  const page = await context.newPage()
  const errors = []
  page.on("console", (m) => {
    if (m.type() !== "error") return
    const t = m.text()
    if (/Failed to load resource|\[vite\]|favicon/.test(t)) return
    errors.push(t.slice(0, 300))
  })
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 300)))
  const res = { errors, loadError: null, rest: [], after: [], probe: null, recipe: null, shots: {} }
  try {
    await page.goto(url(bench, id, motion), { waitUntil: "domcontentloaded", timeout: 30000 })
    await page.waitForFunction(() => document.documentElement.hasAttribute("data-bench-ready"), null, { timeout: 30000 })
    const state = await page.evaluate(() => document.documentElement.getAttribute("data-bench-ready"))
    if (state === "error") {
      res.loadError = await page.evaluate(() => document.querySelector("[data-bench-error]")?.textContent ?? "error")
      return res
    }
    await page.mouse.move(2, 2)
    await page.evaluate(settle, 2500)
    await page.waitForTimeout(150)
    res.rest = await page.evaluate(snapshot, { styleProps, ariaAttrs })
    if (!noShots) res.shots.rest = await page.screenshot()

    /* Pick the interaction on the React side; replay the same one on the Vue side. */
    let recipe = recipeIn
    if (!recipe) {
      for (const r of recipes) {
        const n = await page.locator(r.target).count()
        if (n) {
          recipe = r
          break
        }
      }
    }
    res.recipe = recipe?.kind ?? null
    if (recipe) {
      const all = page.locator(recipe.target)
      const n = await all.count()
      if (!n) {
        res.recipeMissing = true
      } else {
        const target = recipe.nth === "last" ? all.nth(n - 1) : all.first()
        const measure = recipe.measure
        await page.evaluate(startProbe, { measure, targetSel: recipe.target, targetNth: recipe.nth, ms: 1300 })
        try {
          if (recipe.act === "click") await target.click({ timeout: 3000 })
          else if (recipe.act === "hover") await target.hover({ timeout: 3000 })
          else if (recipe.act === "rightclick") await target.click({ button: "right", timeout: 3000 })
          else if (recipe.act === "type") {
            await target.click({ timeout: 3000 })
            await page.keyboard.type(recipe.text, { delay: 40 })
          } else if (recipe.act === "keys") {
            await target.focus({ timeout: 3000 })
            for (const k of recipe.keys) {
              await page.keyboard.press(k)
              await page.waitForTimeout(60)
            }
          }
        } catch (e) {
          res.actError = String(e.message).split("\n")[0]
        }
        await page.waitForFunction(() => window.__kfProbe?.done, null, { timeout: 5000 }).catch(() => {})
        res.probe = await page.evaluate(() => window.__kfProbe)
        await page.evaluate(settle, 2000)
        res.after = await page.evaluate(snapshot, { styleProps, ariaAttrs })
        if (!noShots) res.shots.after = await page.screenshot()
      }
    }
    return { ...res, recipeObj: recipe }
  } catch (e) {
    res.loadError = res.loadError ?? `bench: ${String(e.message).split("\n")[0]}`
    return res
  } finally {
    await page.close().catch(() => {})
  }
}

async function composite(context, file, R, V, title) {
  const img = (b) => (b ? `<img src="data:image/png;base64,${b.toString("base64")}">` : `<div class="none">—</div>`)
  const html = `<!doctype html><html><head><style>
    body{margin:0;background:#d8d8d8;font:600 12px system-ui;color:#222}
    .g{display:grid;grid-template-columns:450px 450px;gap:6px;padding:6px}
    .h{padding:4px 2px}.t{grid-column:1/3;padding:2px}
    img,.none{width:450px;height:350px;display:block;background:#fff;object-fit:contain}
    .none{display:grid;place-items:center;color:#999}
  </style></head><body><div class="g">
    <div class="t">${title}</div><div class="h">React</div><div class="h">Vue</div>
    ${img(R.shots.rest)}${img(V.shots.rest)}${img(R.shots.after)}${img(V.shots.after)}
  </div></body></html>`
  const page = await context.newPage()
  await page.setViewportSize({ width: 918, height: 760 })
  await page.setContent(html)
  await page.screenshot({ path: file, fullPage: true })
  await page.close()
}

/* ---------- one example, one motion ---------- */

async function runJob(browser, job) {
  const { slug, ex, motion } = job
  const id = `${slug}/${ex}`
  const context = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 1, reducedMotion: "no-preference" })
  try {
    const R = await runSide(context, REACT, id, motion, null)
    if (R.loadError) return { status: "react error", reactError: R.loadError, errors: { react: R.errors, vue: [] }, diffs: [] }
    const V = await runSide(context, VUE, id, motion, R.recipeObj ?? null)
    if (V.loadError && /Failed to fetch dynamically imported module: (\S+)/.test(V.loadError)) {
      /* The browser only says the import failed; Vite says why when the module is requested directly. */
      const u = V.loadError.match(/Failed to fetch dynamically imported module: (\S+)/)[1]
      try {
        const t = await (await fetch(u)).text()
        const m = t.match(/"message":"((?:[^"\\]|\\.)*)"/) ?? t.match(/(Failed to resolve import[^\n]*|does not provide an export[^\n]*|\[plugin[^\n]*)/)
        if (m) V.loadError += "\n" + JSON.parse(`"${m[1].replace(/\n/g, " ")}"`)
      } catch {}
    }
    if (V.loadError) {
      const missing = /Failed to resolve import|does not provide an export named|Failed to fetch dynamically imported module|no Vue example/.test(V.loadError)
      return { status: missing ? "missing" : "vue error", vueError: V.loadError.slice(0, 600), errors: { react: R.errors, vue: V.errors }, diffs: [], recipe: R.recipe }
    }
    const diffs = [...diffSnapshots(R.rest, V.rest, "rest")]
    if (R.recipe) {
      if (V.recipeMissing) diffs.push({ phase: "interaction", type: "interaction target missing in Vue", key: R.recipe })
      else {
        diffs.push(...diffSnapshots(R.after, V.after, "after"))
        diffs.push(...diffAnims(R.probe, V.probe))
        diffs.push(...diffMotion(R.probe, V.probe))
      }
    }
    if (V.actError && !R.actError) diffs.push({ phase: "interaction", type: "interaction failed in Vue", key: R.recipe, prop: V.actError })
    if (V.errors.length) diffs.push({ phase: "errors", type: "Vue console/page errors", key: "page", prop: V.errors.slice(0, 3).join(" | ") })
    if (!noShots) {
      const file = path.join(shotsDir, `${slug}--${ex}--${motion}.png`)
      await composite(context, file, R, V, `${id} · ${motion} · ${R.recipe ? `after: ${R.recipe}` : "no interaction"}`)
    }
    const major = diffs.filter((d) => !d.minor)
    return {
      status: major.length ? "differs" : "identical",
      recipe: R.recipe,
      errors: { react: R.errors, vue: V.errors },
      slots: { react: R.rest.length, vue: V.rest.length },
      diffs,
      stretch: R.probe?.frames?.length ? { react: stretchOf(R.probe.frames), vue: V.probe?.frames?.length ? stretchOf(V.probe.frames) : null } : null,
    }
  } finally {
    await context.close().catch(() => {})
  }
}
const stretchOf = (fr) => +(Math.max(...fr.map((f) => f.w)) / Math.max(fr[0].w, fr[fr.length - 1].w, 0.001)).toFixed(3)

/* ---------- report ---------- */

function verdicts(results, plan) {
  const comps = {}
  for (const [slug, info] of Object.entries(plan)) {
    const exs = results[slug] ?? {}
    const runs = Object.values(exs).flatMap((m) => Object.values(m))
    let verdict
    const reasons = []
    if (info.noComponent) {
      verdict = "missing in Vue"
      reasons.push("component not built (no frameworks/vue/" + slug + ")")
    } else if (info.ran === 0) {
      verdict = "missing in Vue"
      reasons.push("no Vue example ports")
    } else if (runs.length && runs.every((r) => r.status === "missing")) {
      verdict = "missing in Vue"
      reasons.push("every example fails to load in Vue: " + summarizeLoad(runs))
    } else if (runs.length && runs.every((r) => r.status === "identical")) verdict = "identical"
    else verdict = "differs"
    const types = {}
    for (const r of runs) {
      if (r.status === "missing" || r.status === "vue error") types[r.status === "missing" ? "example fails to load in Vue" : "Vue page error"] = (types[r.status === "missing" ? "example fails to load in Vue" : "Vue page error"] ?? 0) + 1
      if (r.status === "react error") types["React page error"] = (types["React page error"] ?? 0) + 1
      for (const d of r.diffs ?? []) if (!d.minor) types[d.type] = (types[d.type] ?? 0) + 1
    }
    comps[slug] = { verdict, reasons, examples: info.examples, noPort: info.noPort, missingComponents: info.missingComponents, diffTypes: types }
  }
  return comps
}
const summarizeLoad = (runs) => {
  const m = runs.map((r) => r.vueError ?? "").join("\n")
  const imp = m.match(/Failed to resolve import "([^"]+)"/)
  const exp = m.match(/does not provide an export named '([^']+)'/)
  return imp ? `cannot resolve ${imp[1]}` : exp ? `no export ${exp[1]}` : m.split("\n")[0].slice(0, 160)
}

function writeReport(results, plan, started) {
  const comps = verdicts(results, plan)
  const counts = { identical: 0, differs: 0, "missing in Vue": 0 }
  for (const c of Object.values(comps)) counts[c.verdict]++
  const exCounts = {}
  const typeCounts = {}
  const typeComps = {}
  for (const [slug, exs] of Object.entries(results))
    for (const [ex, ms] of Object.entries(exs))
      for (const [motion, r] of Object.entries(ms)) {
        exCounts[r.status] = (exCounts[r.status] ?? 0) + 1
        for (const d of r.diffs ?? []) {
          if (d.minor) continue
          typeCounts[d.type] = (typeCounts[d.type] ?? 0) + 1
          ;(typeComps[d.type] ??= new Set()).add(slug)
        }
      }
  const json = { started, finished: new Date().toISOString(), motions, summary: { components: counts, runs: exCounts, diffTypes: Object.fromEntries(Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([t, n]) => [t, { diffs: n, components: typeComps[t].size }])) }, components: comps, results }
  fs.writeFileSync(path.join(benchDir, `${outName}.json`), JSON.stringify(json, null, 1))

  const L = []
  L.push(`# Vue ↔ React bench parity`, "", `Run ${started.replace("T", " ").slice(0, 16)} UTC, motions: ${motions.join(", ")}. Re-run: \`node scripts/frameworks/bench-parity.mjs\` (add slugs to narrow it).`, "")
  L.push(`## Summary`, "", `| Verdict | Components |`, `| --- | --- |`)
  for (const [k, v] of Object.entries(counts)) L.push(`| ${k} | ${v} |`)
  L.push("", `Example runs (example × motion): ${Object.entries(exCounts).map(([k, v]) => `${v} ${k}`).join(", ")}.`, "")
  L.push(`## Most common differences`, "", `| Difference | Diffs | Components |`, `| --- | --- | --- |`)
  for (const [t, n] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 25)) L.push(`| ${t} | ${n} | ${typeComps[t].size} |`)
  L.push("", `## Components`, "", `| Component | Verdict | Examples | What differs |`, `| --- | --- | --- | --- |`)
  for (const [slug, c] of Object.entries(comps)) {
    const what = c.verdict === "missing in Vue" ? c.reasons.join("; ") : Object.entries(c.diffTypes).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t, n]) => `${t} (${n})`).join(", ")
    L.push(`| ${slug} | ${c.verdict} | ${c.examples.length}${c.noPort.length ? ` (${c.noPort.length} not ported)` : ""} | ${what || ""} |`)
  }
  L.push("", `## Details`, "")
  for (const [slug, c] of Object.entries(comps)) {
    if (c.verdict !== "differs") continue
    L.push(`### ${slug}`, "")
    for (const [ex, ms] of Object.entries(results[slug] ?? {})) {
      for (const [motion, r] of Object.entries(ms)) {
        if (r.status === "identical") {
          L.push(`- **${ex}** ${motion}: identical${r.recipe ? ` (after ${r.recipe})` : ""}`)
          continue
        }
        if (r.status !== "differs") {
          L.push(`- **${ex}** ${motion}: ${r.status}: ${(r.vueError ?? r.reactError ?? "").split("\n")[0].slice(0, 200)}`)
          continue
        }
        const major = r.diffs.filter((d) => !d.minor)
        L.push(`- **${ex}** ${motion}: ${major.length} differences${r.recipe ? ` (interaction: ${r.recipe})` : ""}, shot \`shots/${slug}--${ex}--${motion}.png\``)
        for (const d of major.slice(0, 12)) L.push(`  - ${d.phase} · \`${d.key}\` · ${d.type}${d.prop ? ` \`${String(d.prop).slice(0, 120)}\`` : ""}${d.react !== undefined && d.react !== null ? `: React \`${String(d.react).slice(0, 90)}\`` : ""}${d.vue !== undefined && d.vue !== null ? `, Vue \`${String(d.vue).slice(0, 90)}\`` : d.react !== undefined && d.react !== null ? ", Vue none" : ""}`)
        if (major.length > 12) L.push(`  - …and ${major.length - 12} more in ${outName}.json`)
      }
    }
    L.push("")
  }
  fs.writeFileSync(path.join(benchDir, `${outName}.md`), L.join("\n") + "\n")
  return { counts, exCounts, typeCounts, typeComps }
}

/* ---------- run ---------- */

async function main() {
  const started = new Date().toISOString()
  const { react, vue } = listExamples()
  const plan = {}
  const jobs = []
  for (const [slug, exs] of Object.entries(react)) {
    const wanted = exs.filter((ex) => !filters.length || filters.includes(slug) || filters.includes(`${slug}/${ex}`))
    if (!wanted.length) continue
    const noComponent = !fs.existsSync(path.join(root, "frameworks/vue", slug, "index.ts"))
    const ported = wanted.filter((ex) => vue[slug]?.includes(ex))
    plan[slug] = { examples: wanted, noPort: wanted.filter((ex) => !ported.includes(ex)), noComponent, ran: noComponent ? 0 : ported.length, missingComponents: [] }
    if (noComponent) continue
    for (const ex of ported) {
      const miss = missingVueComponents(slug, ex)
      if (miss.length) plan[slug].missingComponents.push(...miss.filter((m) => !plan[slug].missingComponents.includes(m)))
      for (const motion of motions) jobs.push({ slug, ex, motion, miss })
    }
  }
  fs.mkdirSync(shotsDir, { recursive: true })
  /* Shared servers: several runs (several builders) may use the same two benches at once. Each run holds a lease
     (frameworks/bench/.runs/<pid>); servers a bench run started are listed in .runs/servers.json and stopped by
     the last run to finish. Servers someone started by hand are never stopped. */
  const runsDir = path.join(benchDir, ".runs")
  fs.mkdirSync(runsDir, { recursive: true })
  const lease = path.join(runsDir, String(process.pid))
  fs.writeFileSync(lease, started)
  const serversFile = path.join(runsDir, "servers.json")
  const readServers = () => {
    try {
      return JSON.parse(fs.readFileSync(serversFile, "utf8"))
    } catch {
      return []
    }
  }
  const alive = (pid) => {
    try {
      process.kill(pid, 0)
      return true
    } catch {
      return false
    }
  }
  const spawned = []
  if (!noServe) {
    for (const b of [REACT, VUE]) if (!(await answering(b.port))) spawned.push({ b, p: startBench(b) })
  }
  const results = {}
  let browser
  let stopped = false
  const stop = () => {
    if (stopped) return
    stopped = true
    fs.rmSync(lease, { force: true })
    const others = fs.readdirSync(runsDir).filter((f) => /^\d+$/.test(f) && alive(Number(f)))
    if (others.length) return
    for (const pid of readServers()) {
      try {
        process.kill(-pid)
      } catch {}
    }
    fs.rmSync(serversFile, { force: true })
  }
  process.on("SIGINT", () => {
    stop()
    process.exit(130)
  })
  process.on("SIGTERM", () => {
    stop()
    process.exit(143)
  })
  try {
    for (const b of [REACT, VUE]) if (!(await waitFor(b.port))) throw new Error(`the ${b.name} bench is not answering on ${b.port} (log: frameworks/bench/.${b.name}-server.log)`)
    /* Record the servers this run started that are the ones answering (a twin started at the same moment by
       another run exits on --strictPort). */
    await new Promise((r) => setTimeout(r, 300))
    const mine = spawned.filter(({ p }) => p.exitCode === null && alive(p.pid)).map(({ p }) => p.pid)
    if (mine.length) fs.writeFileSync(serversFile, JSON.stringify([...new Set([...readServers(), ...mine])]))
    browser = await chromium.launch({ channel: "chrome", headless: true })
    /* Warm both servers (first requests compile on demand). */
    {
      const ctx = await browser.newContext()
      const p = await ctx.newPage()
      for (const b of [REACT, VUE]) await p.goto(`http://localhost:${b.port}/#/`, { waitUntil: "load", timeout: 60000 }).catch(() => {})
      await ctx.close()
    }
    let done = 0
    const queue = [...jobs]
    const worker = async () => {
      while (queue.length) {
        const job = queue.shift()
        let r
        if (job.miss.length) r = { status: "missing", vueError: `Failed to resolve import "@/components/keyframery/${job.miss[0]}" (frameworks/vue/${job.miss.join(", ")} not built)`, diffs: [], errors: { react: [], vue: [] } }
        else {
          try {
            r = await Promise.race([runJob(browser, job), new Promise((_, rej) => setTimeout(() => rej(new Error("timed out after 90s")), 90000))])
          } catch (e) {
            r = { status: "vue error", vueError: `bench: ${e.message}`, diffs: [], errors: { react: [], vue: [] } }
          }
        }
        ;((results[job.slug] ??= {})[job.ex] ??= {})[job.motion] = r
        done++
        if (!quiet) process.stdout.write(`\r${String(done).padStart(4)}/${jobs.length}  ${job.slug}/${job.ex} ${job.motion}: ${r.status}${" ".repeat(30)}`)
      }
    }
    await Promise.all(Array.from({ length: Math.max(1, jobsN) }, worker))
    if (!quiet) process.stdout.write("\n")
  } finally {
    await browser?.close().catch(() => {})
    stop()
  }
  const { counts, exCounts, typeCounts, typeComps } = writeReport(results, plan, started)
  console.log(`\nComponents: ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(", ")}`)
  console.log(`Runs: ${Object.entries(exCounts).map(([k, v]) => `${v} ${k}`).join(", ")}`)
  console.log(`Top differences:`)
  for (const [t, n] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)) console.log(`  ${t}: ${n} diffs in ${typeComps[t].size} components`)
  console.log(`\nReport: frameworks/bench/${outName}.md (and .json); shots in frameworks/bench/shots/`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
