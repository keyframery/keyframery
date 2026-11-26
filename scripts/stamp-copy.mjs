// Writes the one description of Keyframery (content/product.json) everywhere it is repeated outside the site:
// README.md (between <!-- product:… --> markers), package.json and funding.json. The site imports
// product.json directly. Counts and lists come from site/lib/catalog.generated.json, so run
// scripts/build-catalog.mjs first (pnpm build and site:dev do).
//
//   node scripts/stamp-copy.mjs           write
//   node scripts/stamp-copy.mjs --check   exit 1 if anything would change (pnpm check runs this)
//
// GitHub's repository description and topics live on GitHub, not in the repo: --check also compares the
// description with `gh` when it is available and prints the command to update it, but never changes it.
import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"

const root = path.resolve(import.meta.dirname, "..")
const read = (file) => fs.readFileSync(path.join(root, file), "utf8")
const check = process.argv.includes("--check")

const product = JSON.parse(read("content/product.json"))
const catalog = JSON.parse(read("site/lib/catalog.generated.json"))
const entries = catalog.entries
const groupOrder = Object.keys(product.categories)

const list = (items) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`)
const supported = product.frameworks.filter((f) => f.status === "supported")
const vars = {
  components: String(entries.length),
  ai: list(entries.filter((e) => e.group === "AI").map((e) => e.name)),
  frameworks: list(supported.map((f) => (f.targets ? `${f.name} (${list(f.targets)})` : f.name))),
}
export const fill = (text) => text.replace(/\{(\w+)\}/g, (_, key) => {
  if (!(key in vars)) throw new Error(`content/product.json: unknown placeholder {${key}}`)
  return vars[key]
})

if (product.description.length > 160) throw new Error(`content/product.json: description is ${product.description.length} characters (max 160)`)
const unknownGroups = [...new Set(entries.map((e) => e.group))].filter((g) => !groupOrder.includes(g))
if (unknownGroups.length) throw new Error(`content/product.json: categories has no blurb for ${unknownGroups.join(", ")}`)

/* ---- README ---- */
const url = (slug) => `https://keyframery.com/docs/components/${slug}`
const header = [
  `  <h1>${product.name}</h1>`,
  `  <h3>${product.tagline}</h3>`,
  `  <p>${product.description}</p>`,
].join("\n")
const body = [
  "## What is it?",
  "",
  product.summary,
  "",
  ...product.highlights.map((h) => `- **[${fill(h.title)}](https://keyframery.com${h.href})**: ${fill(h.body)}`),
  "",
  "## What's inside",
  "",
  "Every component has a live demo, a Customize panel, five motion styles and [Agent view](#agent-view).",
  "",
  "| Category | What you'll find | Components |",
  "| --- | --- | --- |",
  ...groupOrder
    .map((group) => [group, entries.filter((e) => e.group === group).sort((a, b) => a.name.localeCompare(b.name))])
    .filter(([, items]) => items.length)
    .map(([group, items]) => `| **${group}** | ${product.categories[group]} | ${items.map((e) => `[${e.name}](${url(e.slug)})`).join(", ")} |`),
].join("\n")

const replaceBlock = (text, name, content) => {
  const start = `<!-- product:${name}:start (written by scripts/stamp-copy.mjs from content/product.json) -->`
  const end = `<!-- product:${name}:end -->`
  const a = text.indexOf(start), b = text.indexOf(end)
  if (a < 0 || b < 0) throw new Error(`README.md: missing the ${name} markers`)
  return text.slice(0, a + start.length) + "\n" + content + "\n" + text.slice(b)
}
let readme = read("README.md")
readme = replaceBlock(readme, "header", header)
readme = replaceBlock(readme, "body", body)

/* ---- package.json and funding.json ---- */
const pkg = JSON.parse(read("package.json"))
pkg.description = product.description
const fundingText = read("funding.json")
const oldFunding = JSON.parse(fundingText).projects[0].description
const newFunding = `${product.name} is ${product.tagline.replace(/^The /, "the ").replace(/\.$/, "")}: ${vars.components} free, MIT-licensed components and two page templates (a landing page and an admin dashboard). ${product.summary} Every docs page also has a plain Markdown version so AI coding agents can read it. There is no paid tier.`
/* Only the description string changes, so the rest of the manifest keeps its own formatting. */
const funding = fundingText.replace(JSON.stringify(oldFunding), JSON.stringify(newFunding))

const outputs = [
  ["README.md", readme],
  ["package.json", JSON.stringify(pkg, null, 2) + "\n"],
  ["funding.json", funding],
]
const stale = outputs.filter(([file, next]) => read(file) !== next).map(([file]) => file)

if (check) {
  let github = ""
  try {
    github = execFileSync("gh", ["api", "repos/keyframery/keyframery", "--jq", ".description"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
  } catch {}
  if (github && github !== product.description)
    console.log(`Note: GitHub's repository description differs from content/product.json. To update it (it's public):\n  gh repo edit keyframery/keyframery --description ${JSON.stringify(product.description)}`)
  if (stale.length) {
    console.error(`Copy: ${stale.join(", ")} differ from content/product.json. Run node scripts/stamp-copy.mjs.`)
    process.exit(1)
  }
  console.log("Copy: README.md, package.json and funding.json match content/product.json.")
} else {
  for (const [file, next] of outputs) if (stale.includes(file)) fs.writeFileSync(path.join(root, file), next)
  console.log(`Copy: ${stale.length ? `wrote ${stale.join(", ")}` : "nothing to change"}.`)
}
