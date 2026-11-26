#!/usr/bin/env node
/* Keyframery multi-framework parity test (stage 1).

   For each of the eight stage-1 components, in ?motion=subtle and ?motion=springy, compares the React
   lab (http://localhost:4610, must already be running) with the generated Vue, Svelte, Solid and web
   component versions (frameworks/test/<fw>, started here on 4701-4704 and stopped at the end):

   (a) at rest: every data-slot the component styles exists, and carries the same computed
       transition, animation, transform, opacity, border-radius and background (plus box-shadow and
       colour, reported separately) as React's;
   (b) on open / select: the same CSS transitions and animations run (property, duration, delay,
       easing, per slot), and for the moving keys (tabs, segmented control, switch) the same stretch:
       the largest width while moving, over the larger of the start and end widths;
   (c) no console errors.

   Screenshots: <scratchpad>/frameworks/<slug>-<motion>.png, React first, then vue, svelte, solid, web;
   top row at rest, bottom row after the action. Results: <scratchpad>/frameworks/parity.json.

   Usage: node scripts/frameworks/parity.mjs [--out dir] [--no-serve] [slug ...] */

import { spawn } from "node:child_process"
import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { sync, testSlugs } from "./sync-test.mjs"

const require = createRequire(import.meta.url)
const { chromium } = require("playwright-core")
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")

const args = process.argv.slice(2)
const outIdx = args.indexOf("--out")
const outDir = outIdx >= 0 ? args.splice(outIdx, 2)[1] : path.join(root, "frameworks/test/.parity")
const noServe = args.includes("--no-serve")
const slugs = args.filter((a) => !a.startsWith("--"))
const components = slugs.length ? slugs : testSlugs
fs.mkdirSync(outDir, { recursive: true })

const targets = {
  react: { port: 4610, url: (slug, motion) => `http://localhost:4610/?play=off&motion=${motion}#/${slug}`, scope: "[data-playback]" },
  vue: { port: 4701, url: (slug, motion) => `http://localhost:4701/?motion=${motion}#/${slug}`, scope: (slug) => `[data-demo="${slug}"]` },
  svelte: { port: 4702, url: (slug, motion) => `http://localhost:4702/?motion=${motion}#/${slug}`, scope: (slug) => `[data-demo="${slug}"]` },
  solid: { port: 4703, url: (slug, motion) => `http://localhost:4703/?motion=${motion}#/${slug}`, scope: (slug) => `[data-demo="${slug}"]` },
  web: { port: 4704, url: (slug, motion) => `http://localhost:4704/?motion=${motion}#/${slug}`, scope: (slug) => `[data-demo="${slug}"]` },
}
const motions = ["subtle", "springy"]

/* What to press, and which element of a slot to compare at rest (the one we press, so both are in the
   same state). React's demos are richer than the fixtures, so React has its own selectors. */
const actions = {
  tabs: { slot: "tabs-tab", nth: 3, measure: "tabs-indicator" },
  "segmented-control": { slot: "segmented-control-item", nth: 2, measure: "segmented-control-indicator" },
  switch: { slot: "switch", nth: 1, react: 'li:nth-child(2) [data-slot="switch"]', measure: "switch-thumb", measureReact: 'li:nth-child(2) [data-slot="switch-thumb"]', measureOther: 'label:nth-child(2) [data-slot="switch-thumb"]' },
  checkbox: { slot: "checkbox", nth: 1, react: '[data-item="charger"] [data-slot="checkbox"]' },
  accordion: { slot: "accordion-trigger", nth: 1 },
  popover: { slot: "popover-trigger", nth: 0 },
  select: { slot: "select-trigger", nth: 0 },
  dialog: { slot: "dialog-trigger", nth: 0 },
}

const restProps = ["transitionProperty", "transitionDuration", "transitionTimingFunction", "transitionDelay", "animationName", "animationDuration", "animationTimingFunction", "animationDelay", "transform", "translate", "scale", "rotate", "opacity", "borderTopLeftRadius", "borderBottomRightRadius", "backgroundColor", "filter"]
const extraProps = ["boxShadow", "color"]

/* ---------- servers ---------- */

async function waitFor(port, ms = 30000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    try {
      const r = await fetch(`http://localhost:${port}/`)
      if (r.ok) return true
    } catch {}
    await new Promise((r) => setTimeout(r, 250))
  }
  return false
}

function serve() {
  const procs = []
  for (const fw of ["vue", "svelte", "solid", "web"]) {
    const dir = path.join(root, "frameworks/test", fw)
    const p = spawn(path.join(dir, "node_modules/.bin/vite"), ["--port", String(targets[fw].port), "--strictPort"], { cwd: dir, stdio: "ignore", detached: true })
    procs.push(p)
  }
  return procs
}

/* ---------- in-page probes ---------- */

const probeRest = ({ slots, scopeSel, target, props, extra }) => {
  const scope = document.querySelector(scopeSel) ?? document
  const out = {}
  for (const slot of slots) {
    let el = null
    if (target && target.slot === slot) {
      const all = target.selector ? [document.querySelector(target.selector)] : [...scope.querySelectorAll(`[data-slot="${slot}"]`)]
      el = target.selector ? all[0] : all[target.nth]
    } else el = scope.querySelector(`[data-slot="${slot}"]`) ?? document.querySelector(`[data-slot="${slot}"]`)
    if (!el) continue
    const cs = getComputedStyle(el)
    const v = {}
    for (const p of [...props, ...extra]) v[p] = cs[p]
    v.tag = el.tagName.toLowerCase()
    out[slot] = v
  }
  return out
}

const startProbe = ({ measure, scopeSel }) => {
  /* Records every animation that starts in the next frames, and the measured slot's box per frame. */
  window.__kf = { anims: new Map(), boxes: [] }
  const owner = (el) => {
    if (!el) return "?"
    const own = el.getAttribute?.("data-slot")
    if (own) return own
    const up = el.parentElement?.closest("[data-slot]")
    return up ? `${up.getAttribute("data-slot")}>${el.tagName.toLowerCase()}` : el.tagName.toLowerCase()
  }
  const t0 = performance.now()
  const tick = () => {
    for (const a of document.getAnimations()) {
      const el = a.effect?.target
      const t = a.effect.getTiming()
      const kind = a.constructor.name
      const what = kind === "CSSTransition" ? a.transitionProperty : a.animationName
      const pseudo = a.effect?.pseudoElement ? a.effect.pseudoElement : ""
      const key = `${owner(el)}${pseudo}|${kind === "CSSTransition" ? "transition" : "animation"}|${what}|${Math.round(t.duration)}ms|${Math.round(t.delay)}ms|${t.easing.replace(/\s+/g, " ").slice(0, 60)}`
      window.__kf.anims.set(key, (window.__kf.anims.get(key) ?? 0) + 1)
    }
    if (measure) {
      const scope = document.querySelector(scopeSel) ?? document
      const m = /[\[ ]/.test(measure) ? scope.querySelector(measure) : scope.querySelector(`[data-slot="${measure}"]`)
      if (m) {
        const r = m.getBoundingClientRect()
        window.__kf.boxes.push({ t: performance.now() - t0, x: r.left, w: r.width, h: r.height })
      }
    }
    if (performance.now() - t0 < 1400) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/* ---------- comparison ---------- */

const norm = (p, v) => {
  if (v == null) return v
  /* Same value, different spelling: Chrome lists a transition shorthand's durations per property. */
  return String(v).replace(/\s+/g, " ").trim()
}

function diffRest(react, other) {
  const diffs = []
  for (const [slot, rv] of Object.entries(react)) {
    const ov = other[slot]
    if (!ov) {
      diffs.push({ slot, kind: "missing" })
      continue
    }
    for (const p of [...restProps, ...extraProps]) {
      if (norm(p, rv[p]) !== norm(p, ov[p])) diffs.push({ slot, prop: p, react: rv[p], other: ov[p], minor: extraProps.includes(p) })
    }
  }
  return diffs
}

function stretch(boxes) {
  if (!boxes?.length) return null
  const first = boxes[0]
  const last = boxes[boxes.length - 1]
  const moved = boxes.some((b) => Math.abs(b.x - first.x) > 1)
  const maxW = Math.max(...boxes.map((b) => b.w))
  const maxH = Math.max(...boxes.map((b) => b.h))
  const base = Math.max(first.w, last.w)
  return { moved, ratio: +(maxW / base).toFixed(3), from: Math.round(first.x), to: Math.round(last.x), maxW: +maxW.toFixed(1), endW: +last.w.toFixed(1), maxH: +maxH.toFixed(1) }
}

/* ---------- run ---------- */

async function run() {
  sync()
  let procs = []
  if (!noServe) procs = serve()
  const results = { started: new Date().toISOString(), components: {} }
  const browser = await chromium.launch({ channel: "chrome", headless: true })
  try {
    for (const fw of Object.keys(targets)) if (!(await waitFor(targets[fw].port))) throw new Error(`${fw} is not answering on ${targets[fw].port}`)
    for (const slug of components) {
      const data = JSON.parse(fs.readFileSync(path.join(root, "frameworks/classes", slug + ".json"), "utf8"))
      const slots = Object.keys(data.slots)
      const act = actions[slug]
      results.components[slug] = {}
      for (const motion of motions) {
        const per = {}
        const shots = {}
        for (const fw of Object.keys(targets)) {
          const t = targets[fw]
          const page = await browser.newPage({ viewport: { width: 760, height: 520 }, deviceScaleFactor: 1 })
          const errors = []
          page.on("console", (m) => {
            if (m.type() === "error" && !/Failed to load resource.*404/.test(m.text())) errors.push(m.text())
          })
          page.on("pageerror", (e) => errors.push(e.message))
          await page.goto(t.url(slug, motion), { waitUntil: "networkidle" })
          await page.waitForTimeout(700)
          await page.mouse.move(5, 5)
          const scopeSel = typeof t.scope === "function" ? t.scope(slug) : t.scope
          const target = fw === "react" && act.react ? { slot: act.slot, selector: act.react } : { slot: act.slot, nth: act.nth }
          const rest = await page.evaluate(probeRest, { slots, scopeSel, target, props: restProps, extra: extraProps })
          const restShot = path.join(outDir, `${slug}-${motion}-${fw}-rest.png`)
          await page.screenshot({ path: restShot })

          /* Act: press the element, record what animates. */
          const measure = (fw === "react" ? act.measureReact : act.measureOther) ?? act.measure
          await page.evaluate(startProbe, { measure, scopeSel })
          const locator = fw === "react" && act.react ? page.locator(act.react).first() : page.locator(`${scopeSel} [data-slot="${act.slot}"]`).nth(act.nth)
          await locator.click()
          await page.mouse.move(5, 5)
          await page.waitForTimeout(1500)
          const probe = await page.evaluate(() => ({ anims: [...window.__kf.anims.keys()].sort(), boxes: window.__kf.boxes }))
          const after = await page.evaluate(probeRest, { slots, scopeSel, target: null, props: restProps, extra: extraProps })
          const actShot = path.join(outDir, `${slug}-${motion}-${fw}-after.png`)
          await page.screenshot({ path: actShot })
          shots[fw] = { rest: restShot, after: actShot }
          /* Only what animates on this component's own parts (the lab's chrome animates too). */
          const mine = probe.anims.filter((k) => {
            const owner = k.split("|")[0].split(">")[0].replace(/::.*$/, "")
            return slots.includes(owner) || owner.startsWith(slug)
          })
          per[fw] = { rest, after, anims: mine, stretch: stretch(probe.boxes), errors }
          await page.close()
        }

        /* Compare every framework with React. */
        const report = {}
        const reactAnims = new Set(per.react.anims.map(animKey))
        for (const fw of ["vue", "svelte", "solid", "web"]) {
          const p = per[fw]
          const fwAnims = new Set(p.anims.map(animKey))
          report[fw] = {
            restDiffs: diffRest(per.react.rest, p.rest),
            afterDiffs: diffRest(pick(per.react.after, Object.keys(per.react.after)), p.after),
            animsMissing: [...reactAnims].filter((a) => !fwAnims.has(a)),
            animsExtra: [...fwAnims].filter((a) => !reactAnims.has(a)),
            stretch: p.stretch,
            errors: p.errors,
          }
        }
        results.components[slug][motion] = { react: { stretch: per.react.stretch, errors: per.react.errors, anims: per.react.anims }, ...report }
        await composite(browser, slug, motion, shots)
      }
    }
  } finally {
    await browser.close()
    for (const p of procs) {
      try {
        process.kill(-p.pid)
      } catch {}
    }
  }
  fs.writeFileSync(path.join(outDir, "parity.json"), JSON.stringify(results, null, 2))
  printSummary(results)
}

/* Animation identity for comparison: slot, kind, property, duration, delay, easing. Elements inside
   a slot are named by tag, so a <p> cascading in an accordion panel matches across frameworks. */
const animKey = (a) => a
const pick = (o, keys) => Object.fromEntries(keys.map((k) => [k, o[k]]))

async function composite(browser, slug, motion, shots) {
  const fws = Object.keys(shots)
  const img = (f) => `data:image/png;base64,${fs.readFileSync(f).toString("base64")}`
  const html = `<!doctype html><html><body style="margin:0;background:#ddd;font:600 13px system-ui">
  <div style="display:grid;grid-template-columns:repeat(${fws.length},380px);gap:6px;padding:6px">
  ${fws.map((f) => `<div style="text-align:center">${f}</div>`).join("")}
  ${fws.map((f) => `<img src="${img(shots[f].rest)}" style="width:380px;display:block">`).join("")}
  ${fws.map((f) => `<img src="${img(shots[f].after)}" style="width:380px;display:block">`).join("")}
  </div></body></html>`
  const page = await browser.newPage({ viewport: { width: fws.length * 386 + 6, height: 600 } })
  await page.setContent(html)
  await page.screenshot({ path: path.join(outDir, `${slug}-${motion}.png`), fullPage: true })
  await page.close()
  for (const f of fws) {
    fs.rmSync(shots[f].rest, { force: true })
    fs.rmSync(shots[f].after, { force: true })
  }
}

function printSummary(results) {
  for (const [slug, byMotion] of Object.entries(results.components)) {
    for (const [motion, r] of Object.entries(byMotion)) {
      const rs = r.react.stretch
      console.log(`\n${slug} ${motion}${rs ? `  react stretch ${rs.ratio}` : ""}${r.react.errors.length ? `  REACT ERRORS ${r.react.errors.length}` : ""}`)
      for (const fw of ["vue", "svelte", "solid", "web"]) {
        const x = r[fw]
        const major = x.restDiffs.filter((d) => !d.minor)
        const minor = x.restDiffs.filter((d) => d.minor)
        const amajor = x.afterDiffs.filter((d) => !d.minor)
        console.log(
          `  ${fw.padEnd(7)} rest ${major.length ? `${major.length} diffs` : "same"}${minor.length ? ` (+${minor.length} shadow/colour)` : ""}` +
            `  after ${amajor.length ? `${amajor.length} diffs` : "same"}` +
            `  anims ${x.animsMissing.length || x.animsExtra.length ? `-${x.animsMissing.length}/+${x.animsExtra.length}` : "same"}` +
            `${x.stretch ? `  stretch ${x.stretch.ratio}` : ""}${x.errors.length ? `  ERRORS ${x.errors.length}` : ""}`,
        )
      }
    }
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
