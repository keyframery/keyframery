// Is UI SDK ahead of us? Prints the version Keyframery pins and the newest one on npm.
//
//   pnpm sdk:latest           exits 1 when npm has a newer release, so it can gate a deploy if wanted
//
// Keyframery promises to support each UI SDK release within a day; run this before every deploy.
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"))
const pinned = pkg.dependencies?.["@ui-sdk/react"] ?? pkg.devDependencies?.["@ui-sdk/react"]

const res = await fetch("https://registry.npmjs.org/@ui-sdk/react", { headers: { accept: "application/vnd.npm.install-v1+json" } })
if (!res.ok) {
  console.error(`npm answered ${res.status}; try again later.`)
  process.exit(2)
}
const meta = await res.json()
const latest = meta["dist-tags"]?.latest
const versions = Object.keys(meta.versions ?? {})
const behind = versions.slice(versions.indexOf(pinned) + 1)

if (!latest || latest === pinned) {
  console.log(`UI SDK: pinned ${pinned}, newest on npm ${latest}. Up to date.`)
} else {
  console.log(`UI SDK: pinned ${pinned}, newest on npm ${latest} (${behind.length} release${behind.length === 1 ? "" : "s"} behind: ${behind.join(", ")}).`)
  console.log("Release notes: https://github.com/vercel-labs/ui/releases")
  process.exit(1)
}
