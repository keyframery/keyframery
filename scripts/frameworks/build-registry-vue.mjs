// Builds the Vue registry: one shadcn-vue item per component at https://keyframery.com/r/vue/<slug>.json.
//
//   node scripts/frameworks/build-registry-vue.mjs [outDir]   (default outDir: public/r/vue)
//   KF_VUE_BASE=http://localhost:4720/r/vue node …             (base URL for dependencies, for local install tests)
//
// Source: frameworks/vue/<slug>/ (what the parity bench proves against React), frameworks/vue/core/*-core.ts and
// frameworks/vue/_lib/keyframery.ts. The motion item carries the same CSS as React's (public/r/motion.json), so
// run scripts/build-registry.mjs first. Users install with
//   npx shadcn-vue@latest add https://keyframery.com/r/vue/<slug>.json
// and every file lands under their components alias, in components/keyframery/<slug>/ and
// components/keyframery/core/, with lib/keyframery.ts under their lib alias. cn comes from the lib/utils.ts
// that `shadcn-vue init` writes, so it isn't shipped.
//
// Dependencies are full URLs, so an install works with or without a @keyframery namespace in components.json.
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "../..")
const outDir = path.resolve(root, process.argv[2] ?? "public/r/vue")
const BASE = (process.env.KF_VUE_BASE ?? "https://keyframery.com/r/vue").replace(/\/$/, "")
const vueDir = path.join(root, "frameworks/vue")
const read = (f) => fs.readFileSync(f, "utf8")
const SCHEMA = "https://shadcn-vue.com/schema/registry-item.json"

const testPkg = JSON.parse(read(path.join(root, "frameworks/test/vue/package.json")))
const allDeps = { ...testPkg.dependencies, ...testPkg.devDependencies }
const pin = (name) => (name.startsWith("@ui-sdk/") && allDeps[name] ? `${name}@${allDeps[name].replace(/^[\^~]/, "")}` : name)

const content = JSON.parse(read(path.join(root, "content/components.json")))
const describe = (slug) => (typeof content[slug] === "string" ? content[slug] : content[slug]?.description ?? "")

const slugs = fs
  .readdirSync(vueDir)
  .filter((d) => !d.startsWith("_") && d !== "core" && fs.statSync(path.join(vueDir, d)).isDirectory())
  .sort()

/* Bare package names a file imports (vue and our own aliases left out). */
const importsOf = (code) =>
  [...code.matchAll(/^\s*(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s+)?["']([^"'.][^"']*)["']/gm)].map((m) => m[1])
const pkgName = (spec) => (spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0])

/* Core files a piece of code needs, following core-to-core imports. */
function coresOf(code, seen = new Set()) {
  for (const m of code.matchAll(/["'](?:@\/components\/keyframery\/core\/|\.\/)([\w-]+-core)["']/g)) {
    const name = m[1]
    if (seen.has(name)) continue
    const file = path.join(vueDir, "core", `${name}.ts`)
    if (!fs.existsSync(file)) continue
    seen.add(name)
    coresOf(read(file), seen)
  }
  return seen
}

fs.mkdirSync(outDir, { recursive: true })
const problems = []

for (const slug of slugs) {
  const dir = path.join(vueDir, slug)
  const files = fs.readdirSync(dir).filter((f) => /\.(vue|ts)$/.test(f)).sort()
  const code = files.map((f) => read(path.join(dir, f))).join("\n")
  const npm = new Set(["@ui-sdk/vue", "@ui-sdk/core"].map(pin))
  const reg = new Set([`${BASE}/motion.json`, "utils"])
  for (const spec of importsOf(code)) {
    if (spec === "vue" || spec.startsWith("@/")) continue
    npm.add(pin(pkgName(spec)))
  }
  for (const m of code.matchAll(/["']@\/components\/keyframery\/([\w-]+)["']/g))
    if (m[1] !== slug && m[1] !== "core") {
      if (!slugs.includes(m[1])) problems.push(`${slug} imports missing component ${m[1]}`)
      reg.add(`${BASE}/${m[1]}.json`)
    }
  const cores = [...coresOf(code)].sort()
  for (const c of cores) for (const spec of importsOf(read(path.join(vueDir, "core", `${c}.ts`))))
    if (!spec.startsWith("@/") && spec !== "vue") npm.add(pin(pkgName(spec)))
  const item = {
    $schema: SCHEMA,
    name: slug,
    type: "registry:component",
    title: slug.replace(/(^|-)(\w)/g, (_, s, c) => (s ? " " : "") + c.toUpperCase()),
    description: describe(slug),
    dependencies: [...npm].sort(),
    registryDependencies: [...reg],
    files: [
      ...files.map((f) => ({ path: `registry/components/keyframery/${slug}/${f}`, type: "registry:component", content: read(path.join(dir, f)) })),
      ...cores.map((c) => ({ path: `registry/components/keyframery/core/${c}.ts`, type: "registry:component", content: read(path.join(vueDir, "core", `${c}.ts`)) })),
    ],
  }
  fs.writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify(item, null, 2) + "\n")
}

/* motion: lib/keyframery.ts plus the same CSS React's motion item adds (tokens, the five styles, ease utilities). */
const reactMotion = JSON.parse(read(path.join(root, "public/r/motion.json")))
const motion = {
  $schema: SCHEMA,
  name: "motion",
  type: "registry:lib",
  title: "Motion",
  description: "Keyframery's motion tokens and the five motion styles, plus speed for Vue (provide/inject) and KeyframeryProvider. Every Keyframery component depends on it.",
  dependencies: ["clsx", "tailwind-merge"],
  registryDependencies: ["utils"],
  files: [{ path: "keyframery.ts", type: "registry:lib", content: read(path.join(vueDir, "_lib/keyframery.ts")) }],
  css: reactMotion.css,
}
fs.writeFileSync(path.join(outDir, "motion.json"), JSON.stringify(motion, null, 2) + "\n")

const all = {
  $schema: SCHEMA,
  name: "all",
  type: "registry:item",
  title: "All components",
  description: `Every Keyframery component for Vue (${slugs.length}) and the motion tokens.`,
  registryDependencies: [`${BASE}/motion.json`, ...slugs.map((s) => `${BASE}/${s}.json`)],
}
fs.writeFileSync(path.join(outDir, "all.json"), JSON.stringify(all, null, 2) + "\n")

/* The index shadcn-vue's directory and `shadcn-vue search` read. */
fs.writeFileSync(
  path.join(outDir, "registry.json"),
  JSON.stringify(
    {
      $schema: "https://shadcn-vue.com/schema/registry.json",
      name: "keyframery",
      homepage: "https://keyframery.com/docs/installation/vue",
      items: [motion, ...slugs.map((s) => JSON.parse(read(path.join(outDir, `${s}.json`)))), all].map(({ $schema, content, files, css, ...rest }) => ({
        ...rest,
        ...(files ? { files: files.map(({ content, ...f }) => f) } : {}),
      })),
    },
    null,
    2,
  ) + "\n",
)

if (problems.length) {
  console.error(`registry (vue): ${problems.join("; ")}`)
  process.exit(1)
}
console.log(`registry (vue): ${slugs.length} components + motion + all -> ${path.relative(root, outDir)}`)
