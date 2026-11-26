/* Test-app wiring only: links my overrides into src/components/keyframery/<slug> and copies the React
   core files to src/components/keyframery/core/<name>-core.ts with their @/components/core imports rewritten,
   the layout an installed Vue component has. */
import fs from "node:fs"
import path from "node:path"
const here = import.meta.dirname
const repo = path.resolve(here, "../../..")
const kf = path.join(here, "src/components/keyframery")
const coreOut = path.join(kf, "core")
fs.mkdirSync(coreOut, { recursive: true })
for (const f of fs.readdirSync(path.join(repo, "src/components/core"))) {
  if (!f.endsWith(".ts")) continue
  const src = fs.readFileSync(path.join(repo, "src/components/core", f), "utf8")
    .replace(/(["'])@\/components\/core\/([\w-]+)\1/g, (_m, q, n) => `${q}@/components/keyframery/core/${n}-core${q}`)
  fs.writeFileSync(path.join(coreOut, f.replace(/\.ts$/, "-core.ts")), src)
}
const overrides = path.join(repo, "frameworks/overrides/vue")
for (const e of fs.readdirSync(kf)) if (fs.lstatSync(path.join(kf, e)).isSymbolicLink()) fs.unlinkSync(path.join(kf, e))
for (const slug of fs.readdirSync(overrides)) {
  const link = path.join(kf, slug)
  if (!fs.existsSync(link)) fs.symlinkSync(path.relative(kf, path.join(overrides, slug)), link)
}
/* Components I compose but don't own: the generated Vue ones (frameworks/vue/<slug>), linked if not overridden. */
for (const slug of fs.readdirSync(path.join(repo, "frameworks/vue"))) {
  const dir = path.join(repo, "frameworks/vue", slug)
  if (!fs.statSync(dir).isDirectory() || slug === "_lib") continue
  const link = path.join(kf, slug)
  if (!fs.existsSync(link)) fs.symlinkSync(path.relative(kf, dir), link)
}
console.log("synced")
