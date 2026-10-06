// Copies Keyframery's registry source into the site, exactly as `shadcn add` would place it, and the
// built registry JSON into public/r (served at keyframery.com/r/{name}.json).
import fs from "node:fs"
import path from "node:path"

const web = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
const registry = path.resolve(web, "../../registry")
const built = path.resolve(web, "../../dist/r")

for (const dir of ["components/keyframery", "lib/keyframery"]) {
  fs.rmSync(path.join(web, dir), { recursive: true, force: true })
  fs.cpSync(path.join(registry, dir), path.join(web, dir), { recursive: true })
}
if (!fs.existsSync(built)) throw new Error("dist/r is missing: run `pnpm registry:build` at the repo root first")
fs.rmSync(path.join(web, "public/r"), { recursive: true, force: true })
fs.cpSync(built, path.join(web, "public/r"), { recursive: true })
console.log("keyframery synced into apps/web")
