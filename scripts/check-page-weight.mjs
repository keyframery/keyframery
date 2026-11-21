// Fails when a built page is too heavy.
//
//   pnpm build && node scripts/check-page-weight.mjs
//
// A page's size is what Vercel stores and serves for it, uncompressed: the HTML plus the data React sends with it.
// It decides how much each read costs on the free plan (one unit per 8 KB) and how long a phone takes to parse the
// page. In November 2026 the Chart page reached 2.1 MB because the closed Manual tab carried every source file as
// highlighted elements (see site/lib/rehype-lazy-code.ts). This keeps every page under the limit the SEO audit set.
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..", ".next/server/app")
const limit = 1024 * 1024
const kb = (bytes) => `${Math.round(bytes / 1024)} KB`

if (!fs.existsSync(root)) {
  console.error("Page weight: no build found. Run `pnpm build` first.")
  process.exit(1)
}

const pages = []
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(file)
    else if (entry.name.endsWith(".html")) pages.push({ page: `/${path.relative(root, file).replace(/\.html$/, "").replace(/(^|\/)index$/, "")}`, bytes: fs.statSync(file).size })
  }
}
walk(root)
pages.sort((a, b) => b.bytes - a.bytes)

const heavy = pages.filter(({ bytes }) => bytes > limit)
const total = pages.reduce((sum, { bytes }) => sum + bytes, 0)
console.log(`Page weight: ${pages.length} pages, ${kb(total / pages.length)} on average, heaviest ${pages[0].page} at ${kb(pages[0].bytes)} (limit ${kb(limit)}).`)
if (heavy.length) {
  console.error(`${heavy.length} over the limit:`)
  for (const { page, bytes } of heavy) console.error(`  ${kb(bytes).padStart(8)}  ${page}`)
  process.exit(1)
}
