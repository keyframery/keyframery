// Validate the distributable registry, including core files and recursive local dependencies.
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const registry = JSON.parse(fs.readFileSync(path.join(root, "registry.json"), "utf8"))
const items = new Map(registry.items.map((item) => [item.name, item]))
const slugs = fs.readdirSync(path.join(root, "src/components/ui")).filter((file) => file.endsWith(".tsx")).map((file) => file.slice(0, -4))
const sdk = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).dependencies
/* Where the shadcn CLI installs a file, relative to the project's alias folders. Files carry no `target`
   (see build-registry.mjs): the CLI keeps the part of the path after "components/" or "lib/". */
function installedAt(file) {
  assert.ok(!file.target, `${file.path} has a target; the CLI would install it outside app/ or resources/js/`)
  return file.path.replace(/^registry\//, "")
}
for (const item of registry.items) for (const file of item.files ?? []) {
  installedAt(file)
  assert.match(file.path, /^registry\/(components|lib)\//, `${file.path} must sit under registry/components or registry/lib`)
}
for (const slug of slugs) {
  const item = items.get(slug)
  assert.ok(item, `Missing registry component ${slug}`)
  assert.ok(item.description, `Missing description ${slug}`)
  const generated = JSON.parse(fs.readFileSync(path.join(root, "public/r", `${slug}.json`), "utf8"))
  const targets = new Set(item.files.map(installedAt))
  assert.ok(targets.has(`components/keyframery/${slug}.tsx`), `Missing styled file for ${slug}`)
  assert.ok(targets.has(`components/keyframery/primitives/${slug}.tsx`), `Missing primitive for ${slug}`)
  const core = fs.existsSync(path.join(root, "src/components/core", `${slug}.ts`))
  if (core) assert.ok(targets.has(`components/keyframery/core/${slug}-core.ts`), `Missing core definition for ${slug}`)
  for (const file of generated.files) {
    const relative = installedAt(file).replace("components/keyframery/", "").replace(/^core\/(.+)-core\.ts$/, "core/$1.ts")
    const original = relative.startsWith("core/") || relative.startsWith("primitives/") ? `src/components/${relative}` : `src/components/ui/${relative}`
    const current = fs.readFileSync(path.join(root, original), "utf8")
      .replaceAll('"@/components/primitives/', '"@/components/keyframery/primitives/')
      .replace(/"@\/components\/core\/([a-z0-9-]+)"/g, '"@/components/keyframery/core/$1-core"')
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
    const dependency = match[1].replace(/-core$/, "")
    /* A helper of the component's own (core/<slug>-<name>) ships in the item itself. */
    const shipsItself = item.files.some((file) => file.path.endsWith(`/core/${dependency}-core.ts`))
    if (dependency !== slug && !shipsItself) assert.ok(item.registryDependencies.includes(`@keyframery/${dependency}`), `${slug} does not install its ${dependency} dependency`)
  }
}
const all = items.get("all").registryDependencies
assert.equal(slugs.filter((slug) => all.includes(`@keyframery/${slug}`)).length, slugs.length)

/* Templates. An installed template runs in someone else's project, which has none of this site's
   files: a photo or logo left as a path on this site (/demo/…) is a broken image there. */
const templates = fs.readdirSync(path.join(root, "src/templates")).filter((slug) => fs.statSync(path.join(root, "src/templates", slug)).isDirectory())
for (const slug of templates) {
  assert.ok(items.get(slug), `Missing registry template ${slug}`)
  const generated = JSON.parse(fs.readFileSync(path.join(root, "public/r", `${slug}.json`), "utf8"))
  for (const file of generated.files) {
    const local = file.content.match(/["'`]\/demo\/[^"'`\s]*/)
    assert.ok(!local, `${slug}/${path.basename(file.path)} points at a file on this site: ${local?.[0]}`)
    assert.ok(!/"@\/components\/(ui|primitives|core)\//.test(file.content), `Source alias was not rewritten in ${slug}/${path.basename(file.path)}`)
  }
  for (const dependency of generated.registryDependencies ?? []) {
    if (dependency.startsWith("@keyframery/")) assert.ok(items.has(dependency.slice(12)), `${slug} refers to missing ${dependency}`)
  }
}
console.log(`Registry: ${slugs.length} installable components and ${templates.length} templates verified; core files, aliases, pinned SDK versions, local dependencies and template assets complete.`)
