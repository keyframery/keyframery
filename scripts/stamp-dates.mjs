// Writes content/dates.json: the date each indexed page last changed, from git.
//
//   node scripts/stamp-dates.mjs
//
// The sitemap's lastmod and each docs page's dateModified read this file, so search engines see real
// dates instead of the build date. A component page changes when its component does, so it is dated by
// its source files. Where git history is missing (a CLI deploy uploads no .git), the committed file is
// kept as it is.
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const outFile = path.join(root, "content/dates.json")
const today = new Date().toISOString().slice(0, 10)

/** The day a file first appeared in git (following renames), or today for a file with no commits yet. */
function firstDate(file) {
  const out = execFileSync("git", ["log", "--follow", "--diff-filter=A", "--format=%cs", "--", file], { cwd: root, encoding: "utf8" }).trim()
  return out.split("\n").filter(Boolean).pop() || today
}

function gitDate(files) {
  const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...files], { cwd: root, encoding: "utf8" }).trim()
  // A file with no commits yet is new today.
  return out || today
}

try {
  execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: root, stdio: "ignore" })
} catch {
  console.log("dates: no git history here, keeping content/dates.json")
  process.exit(0)
}

const dates = {
  "/": gitDate(["app/(home)/page.tsx", "site/components/landing"]),
  "/privacy": gitDate(["app/(home)/privacy"]),
  "/terms": gitDate(["app/(home)/terms"]),
}
const published = {}
const docsDir = path.join(root, "content/docs")

for (const file of fs.readdirSync(docsDir, { recursive: true })) {
  if (!file.endsWith(".mdx")) continue
  const rel = file.replace(/\.mdx$/, "").replace(/(^|\/)index$/, "")
  const url = rel ? `/docs/${rel}` : "/docs"
  const component = rel.match(/^components\/([a-z-]+)$/)?.[1]
  // Generated component pages: dated by the component, its primitive and its demo.
  const sources = component
    ? [`src/components/ui/${component}.tsx`, `src/components/primitives/${component}.tsx`, `src/demos/${component}.tsx`, "content/moves.json", "scripts/build-docs.mjs"]
    : [`content/docs/${file}`]
  dates[url] = gitDate(sources)
  // First published: when the page's own source first appeared (a component page: its component).
  published[url] = firstDate(component ? `src/components/ui/${component}.tsx` : `content/docs/${file}`)
}

const sorted = Object.fromEntries(Object.entries(dates).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(outFile, JSON.stringify(sorted, null, 2) + "\n")
console.log(`dates: ${Object.keys(sorted).length} pages -> content/dates.json`)
const firsts = Object.fromEntries(Object.entries(published).sort(([a], [b]) => a.localeCompare(b)))
fs.writeFileSync(path.join(root, "content/published.json"), JSON.stringify(firsts, null, 2) + "\n")
console.log(`published: ${Object.keys(firsts).length} docs pages -> content/published.json`)
