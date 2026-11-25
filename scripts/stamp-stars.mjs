// Writes site/lib/github-stars.generated.json with the repo's current star count, for the header's GitHub link.
//
//   node scripts/stamp-stars.mjs
//
// Read once per build (no request from visitors, no layout shift). If GitHub can't be reached, the last
// written count stays, so a build never fails or shows nothing because of the network.
import fs from "node:fs"

const out = "site/lib/github-stars.generated.json"
const previous = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : { stars: null }
try {
  const res = await fetch("https://api.github.com/repos/keyframery/keyframery", {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "keyframery-build" },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const { stargazers_count: stars } = await res.json()
  if (typeof stars !== "number") throw new Error("no stargazers_count")
  fs.writeFileSync(out, `${JSON.stringify({ stars }, null, 2)}\n`)
  console.log(`GitHub stars: ${stars}`)
} catch (error) {
  if (!fs.existsSync(out)) fs.writeFileSync(out, `${JSON.stringify(previous, null, 2)}\n`)
  console.warn(`GitHub stars: kept ${previous.stars ?? "none"} (${error.message})`)
}
