// Writes a docs page for every shadcn/ui component from lib/coverage.json, the components sidebar, and the
// coverage table on the Compatibility page. Hand-written pages (HAND) keep their own text. Run it after
// editing the data: `pnpm -C apps/web docs:components`. A unit test fails if the pages drift from the data.
import fs from "node:fs"
import path from "node:path"

const web = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
const { menus: MENUS, components } = JSON.parse(fs.readFileSync(path.join(web, "lib/coverage.json"), "utf8"))
const dir = path.join(web, "content/docs/components")

/** Pages with their own hand-written text: the generator leaves them alone. */
export const HAND = ["alert-dialog", "command", "dialog", "drawer", "sheet", "tabs", "toast"]

const HELPER_DOCS = { MatchCut: "match-cut", ListCut: "list-cut", ValueCut: "value-cut", LoadCut: "load-cut", StateCut: "state-cut" }
/** Each helper's own cut prop, as its component types it. */
const HELPER_CUTS = { MatchCut: '"match-cut" | "none"', ListCut: '"none"', ValueCut: '"punch-in" | "none"', LoadCut: '"dissolve" | "none"', StateCut: '"fade" | "slide" | "none"' }
const HOW = { automatic: "Automatic", "add-on": "[Icon moves](/docs/helpers/icon-moves)", own: "Its own motion" }
const howOf = (how) => (how.startsWith("helper:") ? `[${how.slice(7)}](/docs/helpers/${HELPER_DOCS[how.slice(7)]})` : HOW[how])
const range = (t) => t.replace(/(\d)-(\d)/g, "$1–$2")
const KIND_WORD = { cut: "Cut", tuned: "Tuned", helper: "Helper", response: "Response", still: "Still by design" }
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const EASE_EXIT = "cubic-bezier(0.5, 0, 0.75, 0)"

function clamp(text, min, max, pad) {
  let out = text
  if (out.length < min) out = `${out} ${pad}`
  if (out.length > max) out = `${out.slice(0, max - 1).replace(/\s+\S*$/, "")}.`
  return out
}

const tsx = (...code) => ["```tsx", ...code, "```", ""]
/** A shadcn CLI command, which the docs show with npm, pnpm, yarn and bun tabs. */
const npm = (command) => ["```npm", command, "```", ""]
const code = (v) => `\`${v.replaceAll("|", "\\|")}\``
/** One prop: where it goes, its name, the values it takes, its default and what it does. */
const prop = (name, on, description, type, def) => ({ name, on, description, type, def })

/** The props, grouped by where they go (your root layout, one component, your CSS), each group its own small table. */
function propsTables(props) {
  const groups = new Map()
  for (const p of props) groups.set(p.on, [...(groups.get(p.on) ?? []), p])
  const lead = (on) =>
    on === "`<Cuts>`" ? "**On `<Cuts />`**, in your root layout:" : on === "your CSS" ? "**In your global CSS:**" : on.startsWith("`<") ? `**On ${on}:**` : `**On one ${on}**, for just that one:`
  const out = []
  for (const [on, rows] of groups) {
    out.push(lead(on), "", "| Prop | Values | Default | What it does |", "|---|---|---|---|")
    for (const r of rows) out.push(`| ${code(r.name)} | ${code(r.type)} | ${r.def ? code(r.def) : "–"} | ${r.description} |`)
    out.push("")
  }
  return out
}

/** Every cut on a menu as cards with a live preview; the Markdown table inside is what the page's Markdown copy shows. */
function cutCards(menuId, menu) {
  return [
    `<CutCards menu="${menuId}">`,
    "",
    "| Cut | What you see | Code |",
    "|---|---|---|",
    ...menu.cuts.map((k, i) => `| ${k.name}${i === 0 ? " (default)" : ""} | ${k.says} | \`<Cuts ${menuId}="${k.id}" />\` |`),
    "",
    "</CutCards>",
    "",
  ]
}

/** "Which cut it uses", in words a five-year-old could follow. */
function usesFor(c, menu, helpers) {
  if (menu) {
    const [first] = menu.cuts
    const pick = menu.cuts.length > 1 ? ` There are ${menu.cuts.length} to pick from, and each one is a single prop:` : ""
    return [`${c.name} uses the **${first.name}** cut. A cut is how something arrives on the screen and how it leaves.${pick}`, "", ...cutCards(c.menu, menu)]
  }
  if (c.kind === "tuned")
    return [`${c.name} keeps shadcn's own little grow and fade. Keyframery only changes its timing, so it matches the speed and the curve of everything else in your app. We call this **tuned**.`]
  if (c.kind === "helper")
    return [`${c.name} moves with **${helpers.join("** and **")}**: a small Keyframery component you wrap around the part that changes.`]
  return [`${c.name} doesn't open or close, so it has no cut. It gets a **response** instead: a small reaction when you press it, tick it or drag it, so you can feel that it worked.`]
}

export function pageFor(c) {
  const helpers = [...new Set(c.moves.map((m) => m[3]).filter((h) => h.startsWith("helper:")).map((h) => h.slice(7)))]
  const automatic = c.moves.some((m) => m[3] === "automatic")
  const addOn = c.moves.some((m) => m[3] === "add-on")
  const menu = c.menu ? MENUS[c.menu] : null
  const helper = c.kind === "helper" ? c.part : null
  const pad = c.kind === "still" ? `Keyframery leaves the shadcn/ui ${c.name} as it ships.` : helper ? `Works on Base UI and Radix with <${helper}>.` : "Works on Base UI and Radix through <Cuts />."
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
  if (c.kind === "still") {
    lines.push(
      `<Callout title="Nothing moves here, on purpose">`,
      "There's nothing to set up and nothing to turn off: use it the way you always do. Motion on something that never changes would only be noise.",
      "</Callout>",
      "",
    )
    if (c.moves.length) {
      lines.push("## What moves", "", "| When | What you see | Timing | How |", "|---|---|---|---|")
      for (const [when, motion, timing, how] of c.moves) lines.push(`| ${when} | ${motion} | ${timing === "tuned" ? "your theme's timing" : range(timing) || "its own"} | ${howOf(how)} |`)
      lines.push("")
    }
    if (c.note) lines.push(c.note, "")
    lines.push("## Install", "", `Nothing to install. The ${c.name} works as it ships with \`<Cuts />\` mounted, with focus and accessibility intact.`, "")
    return lines.join("\n")
  }

  lines.push(`<Playground slug="${c.slug}" />`, "", "## Which cut it uses", "", ...usesFor(c, menu, helpers), "")
  lines.push("## What moves", "", "| When | What you see | Timing | How |", "|---|---|---|---|")
  for (const [when, motion, timing, how] of c.moves) lines.push(`| ${when} | ${motion} | ${timing === "tuned" ? "your theme's timing" : range(timing) || "its own"} | ${howOf(how)} |`)
  lines.push("")
  if (c.note) lines.push(c.note, "")

  lines.push("## Install", "")
  if (automatic) lines.push(`${c.name} is shadcn's own component. With \`<Cuts />\` in your root layout ([Quick start](/docs/installation)), there's nothing else to add:`, "", ...npm(`npx shadcn add ${c.slug}`))
  for (const h of helpers) lines.push(`Install [${h}](/docs/helpers/${HELPER_DOCS[h]}) and wrap the part that changes:`, "", ...npm(`npx shadcn add @keyframery/${HELPER_DOCS[h]}`))
  if (addOn) lines.push("For each icon's own move when it's pressed, add [Icon moves](/docs/helpers/icon-moves):", "", ...npm("npx shadcn add @keyframery/icon-moves"))

  lines.push("## Change it", "", "Every change is one prop. The controls at the top of the page try them live.", "")
  if (menu && menu.cuts.length > 1 && c.part)
    lines.push("### Change just one", "", `The \`${c.menu}\` prop on \`<Cuts />\` changes all ${menu.label}. For just one ${c.name.toLowerCase()}, put \`data-cut\` on its \`${c.part}\`:`, "", ...tsx(`<${c.part} data-cut="${menu.cuts[1].id}" />`))
  lines.push("### Make it faster or slower", "", "`pace` multiplies every duration: `1.6` is slower, `0.6` is faster.", "")
  if (helper) lines.push(...tsx(`<${helper} pace={1.6}>…</${helper}>`))
  else lines.push(...tsx("// In your root layout: every motion in your app", "<Cuts pace={1.6} />", ...(c.part ? ["", "// Or just this one", `<${c.part} data-cut-pace="1.6" />`] : [])))
  lines.push("### Turn it off", "")
  if (helper) lines.push(...tsx(`<${helper} cut="none">…</${helper}>`))
  else {
    const off = []
    if (menu) off.push(`// In your root layout: no motion on ${menu.label}`, `<Cuts ${c.menu}="none" />`)
    if (c.kind === "response") off.push("// In your root layout: no responses anywhere (cuts keep playing)", '<Cuts responses="none" />')
    if (c.part) off.push(...(off.length ? [""] : []), `// Just this one keeps shadcn's own motion`, `<${c.part} data-cut="none" />`)
    lines.push(...tsx(...off))
  }
  lines.push("With reduced motion turned on in the system settings, movement becomes a short fade or nothing.", "")

  const props = []
  if (menu) props.push(prop(c.menu, "`<Cuts>`", `The cut for all ${menu.label}.`, [...menu.cuts.map((k) => `"${k.id}"`), '"none"'].join(" | "), `"${menu.cuts[0].id}"`))
  if (helper) {
    props.push(prop("pace", `\`<${helper}>\``, "Multiplies every duration of this one.", "number", "1"))
    props.push(prop("cut", `\`<${helper}>\``, '"none" swaps it instantly.', HELPER_CUTS[helper]))
  } else {
    props.push(prop("pace", "`<Cuts>`", "Multiplies every duration in your app.", "number", "1"))
    if (c.kind === "response") props.push(prop("responses", "`<Cuts>`", '"none" turns off every response and keeps the cuts.', '"on" | "none"', '"on"'))
    if (c.part) {
      props.push(prop("data-cut", `\`${c.part}\``, menu ? "The cut for this one. Beats the `<Cuts>` prop." : "`none` keeps shadcn's own motion on this one.", menu ? [...menu.cuts.map((k) => `"${k.id}"`), '"none"'].join(" | ") : '"none"'))
      props.push(prop("data-cut-pace", `\`${c.part}\``, "Multiplies every duration of this one.", "number", "1"))
    }
  }
  props.push(prop("--kf-ease", "your CSS", "The curve things arrive on. Or pick a theme at [/theme](/theme).", "string", EASE))
  props.push(prop("--kf-ease-exit", "your CSS", "The curve things leave on.", "string", EASE_EXIT))
  lines.push("## Props", "", ...propsTables(props))
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
