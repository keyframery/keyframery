/* Test-app wiring, mirrors what the pipeline installs:
   - src/components/keyframery/core/<name>-core.ts  copies of src/components/core/<name>.ts, alias rewritten
   - src/components/keyframery/<slug>              symlinks: frameworks/overrides/vue/<slug>, else frameworks/vue/<slug>
   - src/lib/{utils,keyframery}.ts                  frameworks/vue/_lib when it exists, else local stubs */
import fs from "node:fs"
import path from "node:path"
const here = import.meta.dirname
const repo = path.resolve(here, "../../..")
const coreSrc = path.join(repo, "src/components/core")
const coreOut = path.join(here, "src/components/keyframery/core")
fs.mkdirSync(coreOut, { recursive: true })
for (const f of fs.readdirSync(coreSrc).filter((f) => f.endsWith(".ts"))) {
  const name = f.slice(0, -3)
  const text = fs.readFileSync(path.join(coreSrc, f), "utf8").replace(/@\/components\/core\/([a-z0-9-]+)/g, "@/components/keyframery/core/$1-core")
  fs.writeFileSync(path.join(coreOut, `${name}-core.ts`), text)
}
const kfDir = path.join(here, "src/components/keyframery")
const slugs = new Set([
  ...(fs.existsSync(path.join(repo, "frameworks/overrides/vue")) ? fs.readdirSync(path.join(repo, "frameworks/overrides/vue")) : []),
  ...fs.readdirSync(path.join(repo, "frameworks/vue")).filter((s) => !s.includes(".") && !s.startsWith("_") && s !== "lib" && s !== "core"),
])
for (const slug of slugs) {
  const over = path.join(repo, "frameworks/overrides/vue", slug)
  const target = fs.existsSync(over) ? over : path.join(repo, "frameworks/vue", slug)
  if (!fs.statSync(target).isDirectory()) continue
  const link = path.join(kfDir, slug)
  try { fs.rmSync(link, { recursive: false, force: true }) } catch {}
  fs.symlinkSync(target, link)
}
/* Test-only stubs for dependencies other builders haven't delivered yet. */
for (const slug of fs.readdirSync(path.join(here, "stubs/components"))) {
  const link = path.join(kfDir, slug)
  if (slugs.has(slug)) continue
  try { fs.rmSync(link, { force: true }) } catch {}
  fs.symlinkSync(path.join(here, "stubs/components", slug), link)
  console.log("stub:", slug)
}
const lib = path.join(repo, "frameworks/vue/_lib")
for (const f of ["utils.ts", "keyframery.ts"]) {
  const src = fs.existsSync(path.join(lib, f)) ? path.join(lib, f) : path.join(here, "stubs", f)
  fs.copyFileSync(src, path.join(here, "src/lib", f))
}
const css = [path.join(lib, "keyframery.css"), path.join(repo, "frameworks/vue/keyframery.css"), path.join(repo, "frameworks/test/vue/src/kf/keyframery.css")].find((f) => fs.existsSync(f))
fs.copyFileSync(css, path.join(here, "src/keyframery.css"))
console.log("synced", slugs.size, "slugs; lib from", fs.existsSync(lib) ? "_lib" : "stubs")
