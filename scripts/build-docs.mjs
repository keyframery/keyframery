// Writes one docs page per component to content/docs/components/<slug>.mdx.
//
//   node scripts/build-docs.mjs
//
// Each page is built from the component's own source: its demo (the live preview and the example),
// its exports (the parts table), content/components.json (the description) and content/moves.json
// (what moves). Hand-written pages live next to them in content/docs and are never touched.
import { integrateContent } from "./integrate-content.mjs"
import fs from "node:fs"
import path from "node:path"
import ts from "typescript"

import { readProps } from "./lib/props.mjs"
import { createPreviewSource } from "./lib/preview-source.mjs"

const root = path.resolve(import.meta.dirname, "..")
integrateContent(root)
const read = (f) => fs.readFileSync(path.join(root, f), "utf8")
const descriptions = JSON.parse(read("content/components.json"))
const motion = JSON.parse(read("content/moves.json"))
/* Optional shorter motion lines for search snippets, when a description is too long to fit after the lead. */
const seoDescriptions = fs.existsSync(path.join(root, "content/seo-descriptions.json")) ? JSON.parse(read("content/seo-descriptions.json")) : {}
const theming = fs.existsSync(path.join(root, "content/theming.json")) ? JSON.parse(read("content/theming.json")) : {}
const out = path.join(root, "content/docs/components")
fs.mkdirSync(out, { recursive: true })

const sdkPart = { "context-menu": "menu", "motion-style": "preferences" }
const dateSlugs = ["calendar", "date-picker", "date-input"]

/* Paths as they land in a user's project after `npx shadcn add`. */
const installed = (code) =>
  code
    .replaceAll('"@/components/primitives/', '"@/components/keyframery/primitives/')
    .replace(/"@\/components\/core\/([a-z0-9-]+)"/g, '"@/components/keyframery/core/$1-core"')
    .replaceAll('"@/components/ui/', '"@/components/keyframery/')

/* Code and edit positions come from the demo itself, never a separate hand-written snippet. */
const example = (slug) => createPreviewSource(read(`src/demos/${slug}.tsx`), `${slug}.tsx`)

/* ---- examples, props and keyboard for the new page sections ---- */

/* An example file starts with `// Title` and optional `// description` lines. */
function exampleHeader(code) {
  const lines = code.match(/^(?:\/\/.*\n)+/)?.[0].split("\n").filter(Boolean).map((l) => l.replace(/^\/\/\s?/, "")) ?? []
  return { title: lines[0] ?? "Example", about: lines.slice(1).join(" ").trim() }
}
const exampleCode = (code) => installed(code.replace(/^(?:\/\/.*\n)+\n*/, "")).trim()

/* The usage example's JSX, cut down to the component's own parts, as a tree. Repeated siblings
   (three items in a row) show once. */
function anatomy(code, parts) {
  const sf = ts.createSourceFile("usage.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const build = (node) => {
    const out = []
    const visit = (n) => {
      if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
        const tag = (ts.isJsxElement(n) ? n.openingElement : n).tagName.getText(sf)
        const kids = ts.isJsxElement(n) ? n.children.flatMap((c) => build(c)) : []
        if (parts.has(tag)) {
          out.push({ tag, kids })
          return
        }
        out.push(...kids)
        return
      }
      ts.forEachChild(n, visit)
    }
    visit(node)
    return out
  }
  const fn = sf.statements.find((s) => ts.isFunctionDeclaration(s) && s.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)) ?? sf
  const key = (n) => n.tag + "(" + n.kids.map(key).join(",") + ")"
  const dedupe = (nodes) => nodes.filter((n, i) => i === 0 || key(n) !== key(nodes[i - 1])).map((n) => ({ ...n, kids: dedupe(n.kids) }))
  const roots = dedupe(build(fn))
  if (!roots.length) return null
  const lines = []
  const draw = (n, prefix, last, top) => {
    lines.push(top ? n.tag : `${prefix}${last ? "└── " : "├── "}${n.tag}`)
    const next = top ? "" : prefix + (last ? "    " : "│   ")
    n.kids.forEach((k, i) => draw(k, next, i === n.kids.length - 1, false))
  }
  roots.forEach((r) => draw(r, "", true, true))
  return lines.join("\n")
}
const usageOrder = (tree) => (tree ? [...new Set(tree.split("\n").map((l) => l.replace(/^[\s│├└─]+/, "")))] : [])

const SPEED_TYPE = '"fast" | "normal" | "slow" | number'

function rootPart(slug, api) {
  return api.parts.find((p) => p.props.some((x) => x.name === "speed"))?.name ?? null
}

function speedSnippet(slug, root) {
  if (slug === "toast") return `<ToastRegion speed="fast" />`
  if (slug === "preferences") return `<PreferenceSwitcher preference={view} speed="fast" />`
  if (slug === "motion-style") return `<MotionStyleSwitcher speed="fast" />`
  return `<${root} speed="fast">\n  …\n</${root}>`
}

/* One table per part that has props of its own, the root first; the rest in one line. */
function apiSections(api, order) {
  const rank = (name) => {
    const i = order.indexOf(name)
    return i === -1 ? 999 : i
  }
  const withProps = api.parts.filter((p) => p.props.length).sort((a, b) => rank(a.name) - rank(b.name))
  const plain = api.parts.filter((p) => !p.props.length).sort((a, b) => rank(a.name) - rank(b.name))
  const out = []
  for (const part of withProps) {
    const rows = part.props.map((p) => ({ ...p, type: p.name === "speed" ? SPEED_TYPE : p.type, full: p.name === "speed" ? undefined : p.full }))
    out.push(`### ${part.name}`, "")
    if (part.element) out.push(`Renders a \`<${part.element}>\`, and takes its props too.`, "")
    out.push(`<PropsTable rows={${JSON.stringify(rows.map(({ name, type, full, default: d, description, required }) => ({ name, type, full, default: d, description, required })))}} />`, "")
  }
  if (plain.length)
    out.push(
      withProps.length ? "### Other parts" : "### Parts",
      "",
      "These take the props of the element they render, and nothing else:",
      "",
      ...plain.map((p) => `- \`${p.name}\`${p.element && p.element !== "element" ? `: a \`<${p.element}>\`` : ""}`),
      "",
    )
  return out
}

/* What the registry says this component needs, so the Manual tab can list it. */
const registry = fs.existsSync(path.join(root, "registry.json")) ? JSON.parse(read("registry.json")) : { items: [] }
function registryItem(slug) {
  const item = registry.items.find((i) => i.name === slug) ?? {}
  const npm = [...new Set([...(item.dependencies ?? []), "clsx", "tailwind-merge"])]
  const local = (item.registryDependencies ?? []).map((d) => d.replace("@keyframery/", "")).filter((d) => d !== "motion")
  return { npm, local }
}

/* The names a file exports with `export { A, B }` (types left out). */
function exportsOf(code) {
  const names = []
  for (const [, body] of code.matchAll(/export \{([^}]+)\}(?! from)/g))
    for (const part of body.split(",")) {
      const name = part.trim().split(/\s+as\s+/).pop()
      if (name && !/^type\s/.test(part.trim()) && /^[A-Z]/.test(name)) names.push(name)
    }
  return [...new Set(names)]
}

const fence = (lang, code, title) => "```" + lang + (title ? ` title="${title}"` : "") + "\n" + code.trimEnd() + "\n```"
const yaml = (s) => JSON.stringify(s)

const slugs = fs
  .readdirSync(path.join(root, "src/components/ui"))
  .map((f) => f.replace(/\.tsx$/, ""))
  .filter((s) => fs.existsSync(path.join(root, "src/demos", `${s}.tsx`)))
  .sort()

// Preserve live pages while regenerating: deleting/readding them makes the dev docs loader briefly return 404.
for (const file of fs.readdirSync(out))
  if (file.endsWith(".mdx") && file !== "index.mdx" && !slugs.includes(file.slice(0, -4))) fs.rmSync(path.join(out, file))

const props = readProps(root, slugs)
const keyboard = fs.existsSync(path.join(root, "content/keyboard.json")) ? JSON.parse(read("content/keyboard.json")) : {}
const hookDocs = JSON.parse(read("content/prop-docs.json"))

for (const slug of slugs) {
  const demo = read(`src/demos/${slug}.tsx`)
  const name = demo.match(/export const meta = \{\s*name:\s*"([^"]+)"/)?.[1] ?? slug
  const ui = read(`src/components/ui/${slug}.tsx`)
  const primitive = read(`src/components/primitives/${slug}.tsx`)
  const part = sdkPart[slug] ?? slug
  const sdk = primitive.includes(`"@ui-sdk/react/${part}"`) || (part !== slug && primitive.includes(`"@/components/primitives/${part}"`)) ? part : null
  /* A component UI SDK doesn't ship is defined on its core, in src/components/core/<slug>.ts. */
  const coreFile = `src/components/core/${slug}.ts`
  const core = fs.existsSync(path.join(root, coreFile)) ? read(coreFile) : null
  const onSdk = Boolean(sdk || core)
  const parts = exportsOf(ui)
  const moves = motion.components[slug] ?? []
  const description = descriptions[slug] ?? ""
  const lower = name.toLowerCase()

  const importLine = (from) => {
    const one = `import { ${parts.join(", ")} } from "${from}"`
    return one.length <= 96 ? one : `import {\n${parts.map((p) => `  ${p},`).join("\n")}\n} from "${from}"`
  }

  // The first question is this component's own (its moves), so no two pages carry the same questions.
  const faq = [
    moves.length
      ? {
          q: onSdk ? `How does the animated ${name} for UI SDK move?` : `How does the animated ${name} move?`,
          a: moves.map(([m, text]) => `${m}: ${text.replace(/\.?$/, ".")}`).join(" "),
        }
      : null,
    {
      q: `Do I need Motion or Framer Motion for the animated ${name}?`,
      a: `No. Every move is plain CSS, so there is nothing to install besides the component${onSdk ? " and UI SDK" : ""}.`,
    },
    sdk
      ? {
          q: `Can I keep my own styling and only take the motion?`,
          a: `Yes. Import from \`@/components/keyframery/primitives/${slug}\` instead. It has the same parts and props as \`@ui-sdk/react/${sdk}\` and adds motion only.`,
        }
      : null,
    core
      ? {
          q: `UI SDK has no ${lower}. How is this one built on UI SDK?`,
          a: `Its behaviour is one definition written with UI SDK's core (\`definePrimitive\`), in \`components/keyframery/core/${slug}-core.ts\`. Its parts are rendered by UI SDK's adapter, so they take \`render\`, state-based class names and \`data-slot\`, like every UI SDK component.`,
        }
      : null,
    { q: `What happens to the ${name} when someone turns on reduced motion?`, a: "Nothing moves. State changes happen at once, or with a short fade." },
  ].filter(Boolean)

  const usageFile = `src/examples/${slug}/usage.tsx`
  const usage = fs.existsSync(path.join(root, usageFile)) ? exampleCode(read(usageFile)) : null
  const tree = usage ? anatomy(usage, new Set(parts)) : null
  const exampleFiles = fs.existsSync(path.join(root, "src/examples", slug))
    ? fs.readdirSync(path.join(root, "src/examples", slug)).filter((f) => /^\d+-[\w-]+\.tsx$/.test(f)).sort()
    : []
  const api = props[slug]
  const keys = keyboard[slug] ?? []
  const deps = registryItem(slug)

  const page = [
    "---",
    `title: ${yaml(name)}`,
    `heading: ${yaml(onSdk ? `Animated ${name} for UI SDK` : `Animated ${name}`)}`,
    `description: ${yaml(description)}`,
    ...(seoDescriptions[slug] ? [`seoDescription: ${yaml(seoDescriptions[slug])}`] : []),
    `component: ${yaml(slug)}`,
    "faq:",
    ...faq.flatMap(({ q, a }) => [`  - q: ${yaml(q)}`, `    a: ${yaml(a)}`]),
    "---",
    "",
    `<ComponentPreview slug="${slug}" source={${JSON.stringify(example(slug))}} />`,
    "",
    "## Installation",
    "",
    '<Tabs items={["CLI", "Manual"]}>',
    '<Tab value="CLI">',
    "",
    fence("npm", `npx shadcn@latest add @keyframery/${slug}`),
    "",
    `This adds \`components/keyframery/${slug}.tsx\` and its primitive to your project${onSdk ? ", and installs UI SDK" : ""}${deps.local.length ? `, along with ${deps.local.map((d) => `[${d}](/docs/components/${d})`).join(", ")}, which it builds on` : ""}. The motion tokens are added to your global CSS the first time you install a component.`,
    "",
    "</Tab>",
    '<Tab value="Manual">',
    "",
    "<Steps>",
    "<Step>",
    "",
    "**Install the dependencies**",
    "",
    fence("npm", `npm install ${deps.npm.join(" ")}`),
    "",
    "</Step>",
    "<Step>",
    "",
    "**Add the motion tokens**",
    "",
    "Copy the [motion tokens](/docs/installation#what-the-cli-adds-to-your-css) into your global CSS, and this file into `lib/keyframery.tsx`. Every component shares them.",
    "",
    "<Accordions>",
    '<Accordion title="lib/keyframery.tsx">',
    "",
    fence("tsx", read("src/lib/keyframery.tsx")),
    "",
    "</Accordion>",
    "</Accordions>",
    "",
    "</Step>",
    ...(deps.local.length
      ? ["<Step>", "", "**Add what it builds on**", "", `Install ${deps.local.map((d) => `[${d}](/docs/components/${d})`).join(", ")} the same way first.`, "", "</Step>"]
      : []),
    "<Step>",
    "",
    "**Copy the component**",
    "",
    "<Accordions>",
    `<Accordion title="components/keyframery/${slug}.tsx">`,
    "",
    fence("tsx", installed(ui)),
    "",
    "</Accordion>",
    `<Accordion title="components/keyframery/primitives/${slug}.tsx">`,
    "",
    fence("tsx", installed(primitive)),
    "",
    "</Accordion>",
    ...(core ? [`<Accordion title="components/keyframery/core/${slug}-core.ts">`, "", fence("ts", installed(core)), "", "</Accordion>"] : []),
    "</Accordions>",
    "",
    "</Step>",
    "<Step>",
    "",
    "**Check the import paths**",
    "",
    "The files import from `@/components/keyframery/…` and `@/lib/…`. Change those if your project's aliases differ.",
    "",
    "</Step>",
    "</Steps>",
    "",
    "</Tab>",
    "</Tabs>",
    "",
    "## Usage",
    "",
    fence("tsx", usage ?? importLine(`@/components/keyframery/${slug}`)),
    "",
    ...(dateSlugs.includes(slug)
      ? [
          '<Callout title="Next.js with cacheComponents">',
          "",
          `The ${lower} reads today's date while it renders. With \`cacheComponents\` turned on, render it inside \`<Suspense>\` after \`await connection()\`. [See the fix](/docs/troubleshooting#nextjs-stops-with-unstable-value-datenow).`,
          "",
          "</Callout>",
          "",
        ]
      : []),
    ...(tree && tree.split("\n").length > 2
      ? ["### Anatomy", "", "How the parts fit together:", "", fence("text", tree), ""]
      : []),
    ...(exampleFiles.length
      ? [
          "## Examples",
          "",
          ...exampleFiles.flatMap((f) => {
            const code = read(`src/examples/${slug}/${f}`)
            const { title, about } = exampleHeader(code)
            const key = `${slug}/${f.replace(/^\d+-|\.tsx$/g, "")}`
            return [`### ${title}`, "", ...(about ? [about, ""] : []), `<ExamplePreview name="${key}">`, "", fence("tsx", exampleCode(code)), "", "</ExamplePreview>", ""]
          }),
        ]
      : []),
    ...(moves.length
      ? [
          "## Motion",
          "",
          "| Move | What you see |",
          "| --- | --- |",
          ...moves.map(([m, text]) => `| **${m}** | ${text} |`),
          "",
          `Timing and springiness follow the [motion style](/docs/motion-styles) you set. To change how fast this ${lower} moves, pass \`speed\`:`,
          "",
          fence("tsx", speedSnippet(slug, rootPart(slug, api))),
          "",
          '`"fast"` is 0.6×, `"slow"` 1.4×, and a number sets the multiplier. With reduced motion turned on, nothing moves: changes happen at once or with a short fade.',
          "",
        ]
      : []),
    ...(theming[slug]?.length
      ? [
          "## Theming",
          "",
          "Set these CSS variables on the component or a parent. Leave them unset to follow the light and dark theme. The open Customize panel below the preview lets you try these settings.",
          "",
          "| Variable | What it changes | Default |",
          "| --- | --- | --- |",
          ...theming[slug].map(([name, description, fallback]) => `| \`${name}\` | ${description.replaceAll("|", "\\|")} | ${fallback.replaceAll("|", "\\|")} |`),
          "",
        ]
      : []),
    "## API reference",
    "",
    sdk
      ? `Every part takes \`className\` and \`children\`. Parts from UI SDK also take \`render\`, to draw your own element, and a function of their state for \`className\` and \`style\`. Props not listed here are in the [UI SDK ${sdk === slug ? lower : sdk} reference](https://ui-sdk.dev/docs/components/${sdk}).`
      : core
        ? "Every part takes `className` and `children`, along with the props of the element it renders. The parts are rendered by UI SDK, so they also take `render`, to draw your own element, and a function of their state for `className` and `style`."
        : "Every part takes `className` and `children`, along with the props of the element it renders.",
    "",
    ...apiSections(api, usageOrder(tree)),
    ...(api.hooks.length
      ? [
          "## Hooks",
          "",
          ...api.hooks.flatMap((h) => [
            `### ${h.name}`,
            "",
            hookDocs[h.name] ?? "Call it inside the component to read and change its state.",
            "",
            ...(h.fields.length
              ? [`<PropsTable rows={${JSON.stringify(h.fields.map((f) => ({ name: f.name, type: f.type, description: f.description || hookDocs[`${h.name}.${f.name}`] || "" })))}} />`, ""]
              : []),
          ]),
        ]
      : []),
    ...(keys.length
      ? ["## Keyboard", "", "| Key | What it does |", "| --- | --- |", ...keys.map(([k, what]) => `| ${k.split(" + ").map((x) => `<kbd>${x}</kbd>`).join(" + ")} | ${what} |`), ""]
      : []),
    "## Accessibility",
    "",
    sdk
      ? `Keyboard, focus and screen-reader behaviour come from UI SDK and are not changed. More in [Accessibility](/docs/accessibility).`
      : core
        ? `Roles, keyboard and focus are declared on the component's UI SDK primitive, and state is announced through the matching ARIA attributes. More in [Accessibility](/docs/accessibility).`
        : `Focus is visible on every interactive part, and state is announced through the matching ARIA attributes. More in [Accessibility](/docs/accessibility).`,
    "",
    ...(core
      ? [
          "## Built on UI SDK's core",
          "",
          `UI SDK doesn't ship a ${lower}, so this one is defined with its core: one \`definePrimitive\` in \`components/keyframery/core/${slug}-core.ts\`, with no React in it. UI SDK's adapters can render that same definition in Vue, Svelte, Solid and web components. To keep your own styling and take only the motion, import from \`@/components/keyframery/primitives/${slug}\`.`,
          "",
        ]
      : []),
    ...(sdk
      ? [
          "## Swap the import",
          "",
          `Already using UI SDK's ${sdk === slug ? lower : sdk} with your own styles? Keep your markup and change one line. The primitive adds motion and nothing else.`,
          "",
          fence(
            "tsx",
            `// Before\nimport { … } from "@ui-sdk/react/${sdk}"\n\n// After: same parts, same props, now animated\nimport { … } from "@/components/keyframery/primitives/${slug}"`,
          ),
          "",
        ]
      : []),
  ].join("\n")

  const destination = path.join(out, `${slug}.mdx`)
  if (!fs.existsSync(destination) || fs.readFileSync(destination, "utf8") !== page) fs.writeFileSync(destination, page)
}

console.log(`docs: ${slugs.length} component pages -> content/docs/components`)
