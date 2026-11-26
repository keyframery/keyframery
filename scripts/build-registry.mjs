// Builds the shadcn registry for Keyframery UI.
//
//   node scripts/build-registry.mjs [outDir]      (default outDir: public/r)
//
// Source of truth: src/components/{core,primitives,ui}/<slug>, the motion tokens in src/index.css
// and content/components.json (descriptions). The script writes installable copies to
// registry/components/keyframery/..., a registry.json at the project root, then runs
// `shadcn build`, which serves each item at https://keyframery.com/r/<slug>.json.
//
// In a user's project every component lands in components/keyframery/, so nothing overwrites
// the components/ui/ files a shadcn project already has.
import { execFileSync } from "node:child_process"
import { integrateContent } from "./integrate-content.mjs"
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
integrateContent(root)
const outDir = path.resolve(root, process.argv[2] ?? "public/r")
const src = (...p) => path.join(root, "src", ...p)
const descriptions = JSON.parse(fs.readFileSync(path.join(root, "content/components.json"), "utf8"))

/* Pin UI SDK to the exact version the components were tested against: it is in beta. */
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"))
const pin = (name) => `${name}@${pkg.dependencies[name]}`

const slugs = fs
  .readdirSync(src("components/ui"))
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => f.replace(/\.tsx$/, ""))
  .sort()

const title = (slug) =>
  slug
    .split("-")
    .map((w) => (w === "otp" ? "OTP" : w[0].toUpperCase() + w.slice(1)))
    .join(" ")

/* Rewrite the lab's imports to where the files land in a user's project. The shadcn CLI then
   maps "@/components" and "@/lib" onto the project's own aliases. */
function rewrite(code) {
  return code
    .replaceAll('"@/components/primitives/', '"@/components/keyframery/primitives/')
    .replace(/"@\/components\/core\/([a-z0-9-]+)"/g, '"@/components/keyframery/core/$1-core"')
    .replaceAll('"@/components/ui/', '"@/components/keyframery/')
}

function npmDeps(code) {
  const deps = new Set()
  /* Only real import/export statements: a comment or a string that says `from "…"` is not a package. */
  for (const [, spec] of code.matchAll(/^\s*(?:import|export)\b[^;]*?\bfrom\s+["']([^"']+)["']/gm)) {
    if (spec.startsWith("@ui-sdk/")) {
      deps.add(pin("@ui-sdk/react"))
      deps.add(pin("@ui-sdk/core"))
    }
    else if (!spec.startsWith("@/") && !spec.startsWith(".") && spec !== "react" && spec !== "react-dom")
      deps.add(spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0])
  }
  return deps
}

/* A core file named `<component>-<something>.ts` that isn't a component itself is that component's own
   helper (diff-viewer-diff.ts holds Diff Viewer's algorithm): it ships inside the component's item. */
const helpersOf = (slug, all) =>
  fs.readdirSync(src("components/core")).map((f) => f.replace(/\.ts$/, "")).filter((name) => name.startsWith(`${slug}-`) && !all.includes(name))

function localDeps(code, self, helpers = []) {
  const deps = new Set()
  for (const [, slug] of code.matchAll(/"@\/components\/(?:ui|primitives|core)\/([a-z0-9-]+)"/g)) if (slug !== self && !helpers.includes(slug)) deps.add(slug)
  return deps
}

/* ---- the shared motion item: tokens, the four styles and the three easing utilities ---- */
const css = fs.readFileSync(src("index.css"), "utf8")
const ease = Object.fromEntries([...css.matchAll(/--ease-(house|spring|pop):\s*([^;]+);/g)].slice(0, 3).map((m) => [m[1], m[2].trim()]))
/* The defaults on :root (Subtle: --kf-speed and --kf-flourish), read from the :root block in index.css that
   sets them, so the registry and the site can't drift. */
const rootBody = [...css.matchAll(/\n:root\s*\{([^}]+)\}/g)].map((m) => m[1]).find((body) => body.includes("--kf-speed")) ?? ""
const rootVars = Object.fromEntries([...rootBody.matchAll(/(--kf-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
if (rootVars["--kf-speed"] === undefined || rootVars["--kf-flourish"] === undefined) throw new Error("index.css: :root must set --kf-speed and --kf-flourish")
const styles = {}
for (const [, name, body] of css.matchAll(/\[data-motion="(\w+)"\]\s*\{([^}]+)\}/g)) {
  styles[`[data-motion="${name}"]`] = Object.fromEntries(
    [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
  )
}
/* No file has a `target`. The shadcn CLI puts a targeted file at the project root (or src/), which is
   outside the app in React Router (app/) and Laravel (resources/js/). Without one, the CLI places each
   file under the project's own components or lib alias, keeping the path after "components/" or "lib/":
   registry/components/keyframery/tabs.tsx installs as <components>/keyframery/tabs.tsx everywhere. */
const motionItem = {
  name: "motion",
  type: "registry:item",
  title: "Motion",
  description:
    "Keyframery's motion tokens: the house easing, two springs written as CSS, a speed setting, the five motion styles (Subtle, the default, plus Calm, Springy, Snappy and Playful), the flourish setting and the speed prop helpers with KeyframeryProvider. Every Keyframery component depends on it.",
  dependencies: ["clsx", "tailwind-merge"],
  registryDependencies: ["utils"],
  files: [{ path: "registry/lib/keyframery.tsx", type: "registry:lib" }],
  css: {
    "@layer base": {
      ":root": {
        ...rootVars,
        "--ease-house": ease.house,
        "--ease-spring": ease.spring,
        "--ease-pop": ease.pop,
      },
      ...styles,
    },
    "@utility ease-house": { "transition-timing-function": "var(--ease-house)" },
    "@utility ease-spring": { "transition-timing-function": "var(--ease-spring)" },
    "@utility ease-pop": { "transition-timing-function": "var(--ease-pop)" },
  },
}

/* ---- one item per component ---- */
const genDir = path.join(root, "registry")
fs.rmSync(genDir, { recursive: true, force: true })
fs.mkdirSync(path.join(genDir, "components/keyframery/primitives"), { recursive: true })
fs.mkdirSync(path.join(genDir, "components/keyframery/core"), { recursive: true })
fs.mkdirSync(path.join(genDir, "lib"), { recursive: true })
fs.copyFileSync(src("lib/keyframery.tsx"), path.join(genDir, "lib/keyframery.tsx"))

const items = [motionItem]
/* Shared core helpers travel with the components that use them, without installing unrelated UI. */
for (const name of ["agent-content"]) {
  const rel = `components/keyframery/core/${name}-core.ts`
  const code = fs.readFileSync(src("components/core", `${name}.ts`), "utf8")
  fs.writeFileSync(path.join(genDir, rel), rewrite(code))
  items.push({
    name,
    type: "registry:item",
    title: "Agent content",
    description: "Read-only content exposure for Keyframery's UI SDK primitives.",
    files: [{ path: `registry/${rel}`, type: "registry:component" }],
  })
}
for (const slug of slugs) {
  const files = []
  const deps = new Set()
  const reg = new Set(["@keyframery/motion"])
  const helpers = helpersOf(slug, slugs)
  /* A component UI SDK doesn't ship has a third file: its behaviour, defined on UI SDK's core, plus any
     helpers of its own. */
  for (const [kind, rel, ext, name] of [
    ...helpers.map((h) => ["core", `components/keyframery/core/${h}-core.ts`, "ts", h]),
    ["core", `components/keyframery/core/${slug}-core.ts`, "ts", slug],
    ["primitives", `components/keyframery/primitives/${slug}.tsx`, "tsx", slug],
    ["ui", `components/keyframery/${slug}.tsx`, "tsx", slug],
  ]) {
    const file = src("components", kind, `${name}.${ext}`)
    if (!fs.existsSync(file)) continue
    const code = fs.readFileSync(file, "utf8")
    npmDeps(code).forEach((d) => deps.add(d))
    localDeps(code, slug, helpers).forEach((d) => reg.add(`@keyframery/${d}`))
    fs.writeFileSync(path.join(genDir, rel), rewrite(code))
    files.push({ path: `registry/${rel}`, type: "registry:component" })
  }
  if (!descriptions[slug]) console.warn(`! no description for ${slug} in content/components.json`)
  items.push({
    name: slug,
    type: "registry:component",
    title: title(slug),
    description: descriptions[slug] ?? `${title(slug)} for UI SDK, animated.`,
    dependencies: [...deps].sort(),
    registryDependencies: [...reg],
    files,
  })
}

/* ---- templates: whole pages and apps (src/templates/<slug>), installed into components/<slug>/ ---- */
const templatesDir = src("templates")
const templateSlugs = fs.existsSync(templatesDir)
  ? fs.readdirSync(templatesDir).filter((name) => fs.statSync(path.join(templatesDir, name)).isDirectory()).sort()
  : []
const templateFacts = fs.readFileSync(path.join(root, "site/lib/templates.ts"), "utf8")
for (const slug of templateSlugs) {
  const files = []
  const deps = new Set()
  const reg = new Set(["@keyframery/motion"])
  fs.mkdirSync(path.join(genDir, "components", slug), { recursive: true })
  for (const file of fs.readdirSync(path.join(templatesDir, slug)).sort()) {
    if (!/\.(tsx|ts|css)$/.test(file)) continue
    const code = fs.readFileSync(path.join(templatesDir, slug, file), "utf8")
    if (!file.endsWith(".css")) {
      npmDeps(code).forEach((d) => deps.add(d))
      localDeps(code, slug).forEach((d) => reg.add(`@keyframery/${d}`))
    }
    // The photos stay on keyframery.com until a project swaps in its own. A path can open with any
    // quote: data.ts builds each print's photo in a template string.
    fs.writeFileSync(path.join(genDir, "components", slug, file), rewrite(code).replace(/(["'`])\/demo\//g, "$1https://keyframery.com/demo/"))
    files.push({ path: `registry/components/${slug}/${file}`, type: "registry:component" })
  }
  const entry = templateFacts.match(new RegExp(`slug: "${slug}"[\\s\\S]*?\\n  \\}`))?.[0] ?? ""
  const description = entry.match(/description:\s*"([^"]+)"/)?.[1]
  if (!description) console.warn(`! no description for the ${slug} template in site/lib/templates.ts`)
  items.push({
    name: slug,
    type: "registry:block",
    title: entry.match(/registryTitle:\s*"([^"]+)"/)?.[1] ?? `${title(slug)} landing page`,
    description: description ?? `${title(slug)}: a landing page template.`,
    dependencies: [...deps].sort(),
    registryDependencies: [...reg],
    files,
  })
}

/* "all" installs every component in one go. */
items.push({
  name: "all",
  type: "registry:item",
  title: "All components",
  description: `Every Keyframery UI component (${slugs.length}) and the motion tokens.`,
  registryDependencies: ["@keyframery/motion", ...slugs.map((s) => `@keyframery/${s}`)],
})

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "keyframery",
  homepage: "https://keyframery.com",
  items,
}
fs.writeFileSync(path.join(root, "registry.json"), JSON.stringify(registry, null, 2) + "\n")

fs.mkdirSync(outDir, { recursive: true })
execFileSync(path.join(root, "node_modules/.bin/shadcn"), ["build", "registry.json", "-o", outDir], {
  cwd: root,
  stdio: "inherit",
})
console.log(`registry: ${slugs.length} components + ${templateSlugs.length} templates + motion + all -> ${path.relative(root, outDir)}`)

/* The website loads each demo on demand. List them for it (the lab finds them with a glob). */
const demoSlugs = fs
  .readdirSync(src("demos"))
  .map((f) => f.replace(/\.tsx$/, ""))
  .filter((s) => slugs.includes(s))
  .sort()
fs.writeFileSync(
  path.join(root, "site/lib/demo-loaders.ts"),
  `// Generated by scripts/build-registry.mjs. Do not edit.\n` +
    `import type { DemoModule } from "./demo-types"\n\n` +
    `export const demoLoaders: Record<string, () => Promise<DemoModule>> = {\n` +
    demoSlugs.map((s) => `  "${s}": () => import("@/demos/${s}"),`).join("\n") +
    `\n}\n`,
)
console.log(`site: ${demoSlugs.length} demo loaders -> site/lib/demo-loaders.ts`)

/* The small examples on each docs page: src/examples/<slug>/<nn>-<name>.tsx, loaded on demand as
   "<slug>/<name>". usage.tsx is shown as code only, so it isn't listed. */
const examples = []
for (const slug of fs.existsSync(src("examples")) ? fs.readdirSync(src("examples")).sort() : [])
  for (const f of fs.readdirSync(src("examples", slug)).sort())
    if (/^\d+-[\w-]+\.tsx$/.test(f)) examples.push([`${slug}/${f.replace(/^\d+-|\.tsx$/g, "")}`, `${slug}/${f.replace(/\.tsx$/, "")}`])
fs.writeFileSync(
  path.join(root, "site/lib/example-loaders.ts"),
  `// Generated by scripts/build-registry.mjs. Do not edit.\n` +
    `import type * as React from "react"\n\n` +
    `export const exampleLoaders: Record<string, () => Promise<{ default: React.ComponentType }>> = {\n` +
    examples.map(([key, file]) => `  "${key}": () => import("@/examples/${file}"),`).join("\n") +
    `\n}\n`,
)
console.log(`site: ${examples.length} example loaders -> site/lib/example-loaders.ts`)
