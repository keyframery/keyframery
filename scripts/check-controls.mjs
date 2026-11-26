// End-to-end check of every Customize control, in the browser, against the Vite lab (`pnpm dev`, :4610).
//
//   node scripts/check-controls.mjs [slug ...]        defaults to every component
//
// For each control of each demo it loads the demo with one non-default value (through the lab's
// `?controls=` parameter, the same values the site's Customize panel passes) and compares it with the
// demo at its defaults. A control passes when the page has no errors and the render changes: the demo's
// markup at rest, or for a popup, its open content. Controls that change neither are listed as
// "no visible change" for a person to look at: some are behaviour only (loop, dismissible…) and pass by
// design. Writes shots/controls/results.json.
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import ts from "typescript"

const require = createRequire(import.meta.url)
const { chromium } = require("playwright-core")
const root = path.resolve(import.meta.dirname, "..")
const LAB = process.env.LAB_URL ?? "http://localhost:4610"
const WORKERS = Number(process.env.WORKERS ?? 3)

/* The controls a demo exports, read from its source like scripts/check-customization.mjs does. */
function readControls(slug) {
  const code = fs.readFileSync(path.join(root, "src/demos", `${slug}.tsx`), "utf8")
  const source = ts.createSourceFile(`${slug}.tsx`, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const decl = source.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])
    .find((d) => d.name.getText() === "controls")
  if (!decl?.initializer) return {}
  const text = ts.transpileModule(`const value = (${decl.initializer.getText()});`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
  return new Function(`${text};return value`)()
}

/* One value that differs from the default, as the URL carries it. */
function otherValue(control) {
  switch (control.type) {
    case "switch":
      return String(!control.default)
    case "select":
      return control.options.find((option) => option !== control.default)
    case "slider":
      return String(control.default !== control.max ? control.max : control.min)
    case "color":
      return control.default === "#e11d48" ? "#16a34a" : "#e11d48"
    default:
      return `${control.default ?? ""} Kf`.trim()
  }
}

const urlFor = (slug, pair) => `${LAB}/?play=off${pair ? `&controls=${encodeURIComponent(pair)}` : ""}#/${slug}`

/* The demo's markup, plus any open popup's, with React's generated ids taken out. */
async function fingerprint(page, slug, open) {
  if (open) {
    const demo = page.locator(`[data-demo="${slug}"]`)
    const trigger = demo.locator('[data-slot$="-trigger"]:visible, [aria-haspopup]:visible, input:visible').first()
    if (await trigger.count()) {
      await trigger.click({ timeout: 3000 }).catch(() => {})
      await page.waitForTimeout(600)
    }
  }
  return page.evaluate((slug) => {
    const strip = (html) => html.replace(/\b(id|for|aria-[a-z]+|anchor-name|position-anchor)="[^"]*"/g, "").replace(/--anchor-[\w-]+/g, "")
    const demo = document.querySelector(`[data-demo="${slug}"]`)
    const popups = [...document.querySelectorAll('[data-slot$="-content"][data-open], [data-slot$="-content"][data-starting-style], [role="dialog"][data-open]')]
      .filter((el) => !demo.contains(el))
      .map((el) => el.outerHTML)
    return strip((demo?.outerHTML ?? "") + popups.join(""))
  }, slug)
}

async function load(page, url, slug, errors) {
  await page.goto(url, { waitUntil: "networkidle" })
  await page.locator(`[data-demo="${slug}"]`).waitFor({ state: "visible", timeout: 15000 })
  await page.waitForTimeout(250)
  return errors
}

const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(path.join(root, "src/components/ui")).filter((n) => n.endsWith(".tsx")).map((n) => n.slice(0, -4))

const browser = await chromium.launch({ channel: "chrome", headless: true })
const results = []
const queue = [...slugs]
await Promise.all(
  Array.from({ length: WORKERS }, async () => {
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 } })
    let errors = []
    page.on("pageerror", (error) => errors.push(error.message))
    while (queue.length) {
      const slug = queue.shift()
      const controls = readControls(slug)
      const row = { slug, controls: Object.keys(controls).length, changed: [], openChanged: [], unchanged: [], failed: [] }
      errors = []
      let base
      try {
        await load(page, urlFor(slug), slug, errors).catch(() => load(page, urlFor(slug), slug, errors))
        base = await fingerprint(page, slug, false)
      } catch (error) {
        row.failed.push(`demo did not load: ${String(error.message).split("\n")[0]}`)
        results.push(row)
        console.log(`${slug}: FAILED to load`)
        continue
      }
      let baseOpen
      for (const [name, control] of Object.entries(controls)) {
        const value = otherValue(control)
        if (value === undefined) { row.unchanged.push(`${name} (no other value)`); continue }
        const pair = `${name}:${encodeURIComponent(value)}`
        try {
          errors = []
          await load(page, urlFor(slug, pair), slug, errors)
          const rest = await fingerprint(page, slug, false)
          if (errors.length) { row.failed.push(`${name}=${value}: ${errors[0]}`); continue }
          if (rest !== base) { row.changed.push(name); continue }
          const opened = await fingerprint(page, slug, true)
          if (baseOpen === undefined) {
            await load(page, urlFor(slug), slug, errors)
            baseOpen = await fingerprint(page, slug, true)
          }
          if (errors.length) row.failed.push(`${name}=${value}: ${errors[0]}`)
          else if (opened !== baseOpen) row.openChanged.push(name)
          else row.unchanged.push(`${name}=${value}`)
        } catch (error) {
          row.failed.push(`${name}=${value}: ${String(error.message).split("\n")[0]}`)
        }
      }
      results.push(row)
      const total = row.changed.length + row.openChanged.length
      console.log(`${slug}: ${total}/${row.controls} change the render${row.unchanged.length ? `, no visible change: ${row.unchanged.join(", ")}` : ""}${row.failed.length ? `, FAILED: ${row.failed.join(" | ")}` : ""}`)
    }
  }),
)
await browser.close()

fs.mkdirSync(path.join(root, "shots/controls"), { recursive: true })
fs.writeFileSync(path.join(root, "shots/controls/results.json"), JSON.stringify(results.sort((a, b) => a.slug.localeCompare(b.slug)), null, 2))
const sum = (key) => results.reduce((n, r) => n + (Array.isArray(r[key]) ? r[key].length : r[key]), 0)
console.log(`\n${results.length} demos, ${sum("controls")} controls: ${sum("changed")} change the demo, ${sum("openChanged")} change the open popup, ${sum("unchanged")} no visible change, ${sum("failed")} failed.`)
process.exit(sum("failed") ? 1 : 0)
