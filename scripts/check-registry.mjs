// Validate the distributable registry, including core files and recursive local dependencies.
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const registry = JSON.parse(fs.readFileSync(path.join(root, "registry.json"), "utf8"))
const items = new Map(registry.items.map((item) => [item.name, item]))
const slugs = fs.readdirSync(path.join(root, "src/components/ui")).filter((file) => file.endsWith(".tsx")).map((file) => file.slice(0, -4))
const sdk = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).dependencies
for (const slug of slugs) {
  const item = items.get(slug)
  assert.ok(item, `Missing registry component ${slug}`)
  assert.ok(item.description, `Missing description ${slug}`)
  const generated = JSON.parse(fs.readFileSync(path.join(root, "public/r", `${slug}.json`), "utf8"))
  const targets = new Set(item.files.map((file) => file.target))
  assert.ok(targets.has(`components/keyframery/${slug}.tsx`), `Missing styled file for ${slug}`)
  assert.ok(targets.has(`components/keyframery/primitives/${slug}.tsx`), `Missing primitive for ${slug}`)
  const core = fs.existsSync(path.join(root, "src/components/core", `${slug}.ts`))
  if (core) assert.ok(targets.has(`components/keyframery/core/${slug}.ts`), `Missing core definition for ${slug}`)
  for (const file of generated.files) {
    const relative = file.target.replace("components/keyframery/", "")
    const original = relative.startsWith("core/") || relative.startsWith("primitives/") ? `src/components/${relative}` : `src/components/ui/${relative}`
    const current = fs.readFileSync(path.join(root, original), "utf8")
      .replaceAll('"@/components/primitives/', '"@/components/keyframery/primitives/')
      .replaceAll('"@/components/core/', '"@/components/keyframery/core/')
      .replaceAll('"@/components/ui/', '"@/components/keyframery/')
    assert.equal(file.content, current, `${slug} registry contains stale ${original}; regenerate it`)
  }
  const source = generated.files.map((file) => file.content).join("\n")
  assert.ok(!/"@\/components\/(ui|primitives|core)\//.test(source), `Source alias was not rewritten in ${slug}`)
  if (/\bfrom ["']@ui-sdk\//.test(source)) {
    for (const name of ["@ui-sdk/core", "@ui-sdk/react"]) assert.ok(item.dependencies.includes(`${name}@${sdk[name]}`), `${slug} does not pin ${name}`)
  }
  for (const dependency of item.registryDependencies) {
    if (dependency.startsWith("@keyframery/")) assert.ok(items.has(dependency.slice(12)), `${slug} refers to missing ${dependency}`)
  }
  for (const match of source.matchAll(/"@\/components\/keyframery\/(?:primitives\/|core\/)?([a-z-]+)"/g)) {
    const dependency = match[1]
    if (dependency !== slug) assert.ok(item.registryDependencies.includes(`@keyframery/${dependency}`), `${slug} does not install its ${dependency} dependency`)
  }
}
const all = items.get("all").registryDependencies
assert.equal(slugs.filter((slug) => all.includes(`@keyframery/${slug}`)).length, slugs.length)
console.log(`Registry: ${slugs.length} installable components verified; core files, aliases, pinned SDK versions and local dependencies complete.`)
