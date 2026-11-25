// Writes site/lib/catalog.generated.json: every component's name, group, description, UI SDK part and moves.
//
//   node scripts/build-catalog.mjs
//
// site/lib/catalog.ts imports the JSON instead of reading src/ while the site runs. Reading files by
// paths built at run time made Next trace the whole project into the server function (hundreds of MB,
// over Netlify's 250 MB function limit); a static import carries only this file.
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), "utf8")
const exists = (file) => fs.existsSync(path.join(root, file))
const descriptions = JSON.parse(read("content/components.json"))
const motion = JSON.parse(read("content/moves.json"))

/* Components built on a UI SDK part with a different name. */
const sdkPart = { "context-menu": "menu", "motion-style": "preferences" }

function entryOf(slug) {
  const meta = read(`src/demos/${slug}.tsx`).match(/export const meta = \{\s*name:\s*"([^"]+)",\s*group:\s*"([^"]+)"/)
  const primitive = `src/components/primitives/${slug}.tsx`
  const part = sdkPart[slug] ?? slug
  const code = exists(primitive) ? read(primitive) : ""
  const sdk = code.includes(`"@ui-sdk/react/${part}"`) || (part !== slug && code.includes(`"@/components/primitives/${part}"`)) ? part : null
  const core = exists(`src/components/core/${slug}.ts`)
  return { slug, name: meta?.[1] ?? slug, group: meta?.[2] ?? "Other", description: descriptions[slug] ?? "", sdk, core, moves: motion.components[slug] ?? [] }
}

const entries = fs
  .readdirSync(path.join(root, "src/components/ui"))
  .map((f) => f.replace(/\.tsx$/, ""))
  .filter((slug) => exists(`src/demos/${slug}.tsx`))
  .map(entryOf)
  .sort((a, b) => a.name.localeCompare(b.name))

const out = path.join(root, "site/lib/catalog.generated.json")
const body = `${JSON.stringify({ moves: motion.moves, entries }, null, 2)}\n`
if (!fs.existsSync(out) || fs.readFileSync(out, "utf8") !== body) fs.writeFileSync(out, body)
console.log(`Catalog: ${entries.length} components → site/lib/catalog.generated.json`)
