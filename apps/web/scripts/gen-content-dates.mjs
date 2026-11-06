// Writes lib/content-dates.json: for every docs page, the day it was first published and the day its content last
// changed, from git history. Commits that only touched the frontmatter's search fields (title, seoTitle, heading,
// description, noindex) don't count as a content change, so a reworded meta description doesn't fake freshness.
// A page with uncommitted body edits counts as changed today. Run it before committing docs changes:
//   node scripts/gen-content-dates.mjs
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const web = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
const docsDir = path.join(web, "content/docs")
const META = /^[+-]\s*(title|seoTitle|heading|description|noindex):/
const git = (...args) => execFileSync("git", args, { cwd: web, encoding: "utf8" })

/** True when a diff changes anything other than the search fields. */
function touchesContent(diff) {
  return diff
    .split("\n")
    .filter((l) => (l.startsWith("+") || l.startsWith("-")) && !l.startsWith("+++") && !l.startsWith("---"))
    .some((l) => l.trim() !== "+" && l.trim() !== "-" && !META.test(l))
}

function datesFor(file) {
  const rel = path.relative(web, file)
  const log = git("log", "--follow", "--format=%H %cs", "--", rel).trim().split("\n").filter(Boolean)
  if (!log.length) return null
  const published = log.at(-1).split(" ")[1]
  let modified = published
  const pending = git("diff", "HEAD", "--", rel)
  if (pending && touchesContent(pending)) modified = new Date().toISOString().slice(0, 10)
  else
    for (const line of log) {
      const [hash, day] = line.split(" ")
      if (touchesContent(git("show", "--format=", hash, "--", rel))) {
        modified = day
        break
      }
    }
  return { published, modified }
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p) : e.name.endsWith(".mdx") ? [p] : []
  })
}

const out = {}
for (const file of walk(docsDir)) {
  const slug = path.relative(docsDir, file).replace(/\.mdx$/, "").replace(/(^|\/)index$/, "")
  const dates = datesFor(file)
  if (dates) out[`/docs${slug ? `/${slug}` : ""}`] = dates
}
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(path.join(web, "lib/content-dates.json"), `${JSON.stringify(sorted, null, 2)}\n`)
console.log(`wrote dates for ${Object.keys(sorted).length} docs pages`)
