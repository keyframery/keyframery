// Writes what the site says Keyframery is tested with, from what the fixture apps really run (fixtures/tested.mjs):
// lib/tested.json (the home page), the "Tested versions" table on /docs/compatibility and the line under the
// Quick start's install command. tests/unit/tested.test.ts fails when they drift. Run: node apps/web/scripts/gen-tested.mjs
import fs from "node:fs"
import path from "node:path"

import { tested } from "../../../fixtures/tested.mjs"

const web = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
const LABELS = { next: "Next.js", react: "React", tailwindcss: "Tailwind CSS" }

export function testedTable(t = tested()) {
  return [
    "| Package | Version |",
    "|---|---|",
    `| shadcn CLI | ${t.shadcnCli} |`,
    ...t.packages.map((p) => `| ${LABELS[p.name] ?? p.name} | ${p.version} |`),
    "| Browsers | Chromium, WebKit (Safari) and Firefox, current stable |",
  ].join("\n")
}

export function testedLine(t = tested()) {
  return `Tested with shadcn CLI ${t.shadcnCli}, on Base UI and Radix ([all versions](/docs/compatibility#tested-versions)).`
}

/** Replaces the block that starts with `marker` and runs to the next blank line. */
function replaceBlock(file, marker, block) {
  const text = fs.readFileSync(file, "utf8")
  const start = text.indexOf(marker)
  if (start < 0) throw new Error(`${path.relative(web, file)} has no "${marker}" to replace`)
  const end = text.indexOf("\n\n", start)
  fs.writeFileSync(file, `${text.slice(0, start)}${block}${end < 0 ? "\n" : text.slice(end)}`)
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const t = tested()
  fs.writeFileSync(path.join(web, "lib/tested.json"), `${JSON.stringify(t, null, 2)}\n`)
  replaceBlock(path.join(web, "content/docs/compatibility.mdx"), "| Package |", testedTable(t))
  replaceBlock(path.join(web, "content/docs/installation.mdx"), "Tested with shadcn CLI", testedLine(t))
  console.log(`wrote the tested versions: shadcn CLI ${t.shadcnCli}, ${t.packages.map((p) => `${p.name} ${p.version}`).join(", ")}`)
}
