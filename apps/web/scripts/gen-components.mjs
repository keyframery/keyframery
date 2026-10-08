// Writes a docs page for every shadcn/ui component from lib/coverage.json, the components sidebar, and the
// coverage table on the Compatibility page. Hand-written pages (HAND) keep their own text. Run it after
// editing the data: `pnpm -C apps/web docs:components`. A unit test fails if the pages drift from the data.
import fs from "node:fs"
import path from "node:path"

const web = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
const { components } = JSON.parse(fs.readFileSync(path.join(web, "lib/coverage.json"), "utf8"))
const dir = path.join(web, "content/docs/components")

/** Pages with their own hand-written text: the generator leaves them alone. */
export const HAND = ["alert-dialog", "command", "dialog", "drawer", "sheet", "tabs", "toast"]

const HELPER_DOCS = { MatchCut: "match-cut", ListCut: "list-cut", ValueCut: "value-cut", LoadCut: "load-cut", StateCut: "state-cut" }
const HOW = { automatic: "Automatic", "add-on": "[Icon moves](/docs/helpers/icon-moves)", own: "Its own motion" }
const howOf = (how) => (how.startsWith("helper:") ? `[${how.slice(7)}](/docs/helpers/${HELPER_DOCS[how.slice(7)]})` : HOW[how])
const range = (t) => t.replace(/(\d)-(\d)/g, "$1–$2")
const KIND_WORD = { cut: "Cut", tuned: "Tuned", helper: "Helper", response: "Response", still: "Still by design" }

function clamp(text, min, max, pad) {
  let out = text
  if (out.length < min) out = `${out} ${pad}`
  if (out.length > max) out = `${out.slice(0, max - 1).replace(/\s+\S*$/, "")}.`
  return out
}

export function pageFor(c) {
  const helpers = [...new Set(c.moves.map((m) => m[3]).filter((h) => h.startsWith("helper:")).map((h) => h.slice(7)))]
  const automatic = c.moves.some((m) => m[3] === "automatic")
  const addOn = c.moves.some((m) => m[3] === "add-on")
  const pad = c.kind === "still" ? `Keyframery leaves the shadcn/ui ${c.name} as it ships.` : "Works on Base UI and Radix through <Cuts />."
  const description = clamp(c.summary, 70, 160, pad)
  const lines = [
    "---",
    `title: ${c.name}`,
    `seoTitle: "shadcn/ui ${c.name} animation"`,
    // Like the hand-written pages: "Checkbox animation"; a component where nothing moves keeps its plain name.
    `heading: "${c.kind === "still" ? c.name : `${c.name} animation`}"`,
    `description: ${JSON.stringify(description)}`,
    "---",
    "",
    "{/* Generated from lib/coverage.json by scripts/gen-components.mjs. Edit the data, then run the script. */}",
    "",
  ]
  if (c.kind !== "still") lines.push("<Preview>", `  <ComponentDemo slug="${c.slug}" />`, "</Preview>", "")
  if (c.moves.length) {
    lines.push("## What moves", "", "| When | What you see | Timing | How |", "|---|---|---|---|")
    for (const [when, motion, timing, how] of c.moves) lines.push(`| ${when} | ${motion} | ${timing === "tuned" ? "your theme's timing" : range(timing) || "its own"} | ${howOf(how)} |`)
    lines.push("")
  }
  if (c.note) lines.push(c.note, "")
  lines.push("## Install", "")
  if (c.kind === "still") {
    lines.push(`Nothing to install. Keyframery leaves the ${c.name} as shadcn ships it, because nothing on screen changes and motion there would only be noise. It works with \`<Cuts />\` mounted, with focus and accessibility intact.`, "")
  } else {
    if (automatic) {
      lines.push(`${c.name} is shadcn's own component. With \`<Cuts />\` in your root layout ([Quick start](/docs/installation)), there's nothing else to add:`, "", "```bash", `npx shadcn add ${c.slug}`, "```", "")
    }
    for (const h of helpers) lines.push(`Install [${h}](/docs/helpers/${HELPER_DOCS[h]}) and wrap the part that changes: \`npx shadcn add @keyframery/${HELPER_DOCS[h]}\`.`, "")
    if (addOn) lines.push("For each icon's own move when it's pressed, add [Icon moves](/docs/helpers/icon-moves): `npx shadcn add @keyframery/icon-moves`.", "")
  }
  if (c.kind !== "still") {
    lines.push(
      "## Turn it off",
      "",
      `Put \`data-cut="none"\` on a ${c.name.toLowerCase()} (or anything around it) to keep shadcn's own motion there. \`<Cuts responses="none" />\` turns off every response across the app and keeps the cuts. With reduced motion, movement becomes a short fade or nothing.`,
      "",
    )
  }
  return lines.join("\n")
}

export function coverageTable() {
  const rows = ["| Component | Keyframery | What moves |", "|---|---|---|"]
  for (const c of components) {
    const what = c.moves.length ? c.moves.map((m) => m[1].charAt(0).toLowerCase() + m[1].slice(1)).join("; ") : "nothing changes on screen"
    rows.push(`| [${c.name}](/docs/components/${c.slug}) | ${KIND_WORD[c.kind]} | ${what} |`)
  }
  return rows.join("\n")
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  fs.mkdirSync(dir, { recursive: true })
  for (const c of components) if (!HAND.includes(c.slug)) fs.writeFileSync(path.join(dir, `${c.slug}.mdx`), pageFor(c))
  fs.rmSync(path.join(dir, "tuned.mdx"), { force: true })
  const sorted = [...components].sort((a, b) => a.name.localeCompare(b.name)).map((c) => c.slug)
  fs.writeFileSync(path.join(dir, "meta.json"), `${JSON.stringify({ title: "Components", pages: sorted }, null, 2)}\n`)
  const compat = path.join(web, "content/docs/compatibility.mdx")
  const text = fs.readFileSync(compat, "utf8")
  const start = text.indexOf("| Component |")
  const end = text.indexOf("\n\n", start)
  fs.writeFileSync(compat, `${text.slice(0, start)}${coverageTable()}${text.slice(end)}`)
  console.log(`wrote ${components.length - HAND.length} component pages, the sidebar and the coverage table`)
}
