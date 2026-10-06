// Fails if the built registry is missing a file listed in registry.json, or a file came out empty.
import fs from "node:fs"
import path from "node:path"

const here = path.dirname(new URL(import.meta.url).pathname)
const src = JSON.parse(fs.readFileSync(path.join(here, "../registry.json"), "utf8"))
let failed = false
for (const item of src.items) {
  const out = path.join(here, "../../dist/r", `${item.name}.json`)
  if (!fs.existsSync(out)) {
    console.error(`missing ${out}`)
    failed = true
    continue
  }
  const built = JSON.parse(fs.readFileSync(out, "utf8"))
  for (const f of item.files) {
    const b = built.files.find((x) => x.path === f.path)
    if (!b || !b.content?.trim()) {
      console.error(`${item.name}: ${f.path} missing or empty`)
      failed = true
    }
  }
}
if (failed) process.exit(1)
console.log(`registry ok: ${src.items.map((i) => i.name).join(", ")}`)
