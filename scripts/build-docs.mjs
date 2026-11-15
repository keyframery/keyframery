// Writes one docs page per component to content/docs/components/<slug>.mdx.
//
//   node scripts/build-docs.mjs
//
// Each page is built from the component's own source: its demo (the live preview and the example),
// its exports (the parts table), content/components.json (the description) and content/moves.json
// (what moves). Hand-written pages live next to them in content/docs and are never touched.
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const read = (f) => fs.readFileSync(path.join(root, f), "utf8")
const descriptions = JSON.parse(read("content/components.json"))
const motion = JSON.parse(read("content/moves.json"))
const out = path.join(root, "content/docs/components")
fs.mkdirSync(out, { recursive: true })

const sdkPart = { "context-menu": "menu", "motion-style": "preferences" }
const dateSlugs = ["calendar", "date-picker", "date-input"]

/* Paths as they land in a user's project after `npx shadcn add`. */
const installed = (code) =>
  code.replaceAll('"@/components/primitives/', '"@/components/keyframery/primitives/').replaceAll('"@/components/ui/', '"@/components/keyframery/')

/* The demo, cut down to an example: no `play` script, no `meta`. */
const example = (slug) =>
  installed(read(`src/demos/${slug}.tsx`))
    .replace(/\/\*[^*]*(?:\*(?!\/)[^*]*)*\*\/\s*export const play[\s\S]*?\n\]\n/, "")
    .replace(/export const play[\s\S]*?\n\]\n/, "")
    .replace(/export const meta = \{[^}]*\}\n/, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

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

for (const f of fs.readdirSync(out)) if (f.endsWith(".mdx") && f !== "index.mdx") fs.rmSync(path.join(out, f))

for (const slug of slugs) {
  const demo = read(`src/demos/${slug}.tsx`)
  const name = demo.match(/export const meta = \{\s*name:\s*"([^"]+)"/)?.[1] ?? slug
  const ui = read(`src/components/ui/${slug}.tsx`)
  const primitive = read(`src/components/primitives/${slug}.tsx`)
  const part = sdkPart[slug] ?? slug
  const sdk = primitive.includes(`"@ui-sdk/react/${part}"`) || (part === "menu" && primitive.includes('"@/components/primitives/menu"')) ? part : null
  const parts = exportsOf(ui)
  const moves = motion.components[slug] ?? []
  const description = descriptions[slug] ?? ""
  const lower = name.toLowerCase()

  const importLine = (from) => {
    const one = `import { ${parts.join(", ")} } from "${from}"`
    return one.length <= 96 ? one : `import {\n${parts.map((p) => `  ${p},`).join("\n")}\n} from "${from}"`
  }

  const faq = [
    {
      q: `Does the ${name} need an animation library?`,
      a: `No. Every move is plain CSS, so there is nothing to install besides the component${sdk ? " and UI SDK" : ""}.`,
    },
    sdk
      ? {
          q: `Can I keep my own styling and only take the motion?`,
          a: `Yes. Import from \`@/components/keyframery/primitives/${slug}\` instead. It has the same parts and props as \`@ui-sdk/react/${sdk}\` and adds motion only.`,
        }
      : null,
    { q: "What happens when someone turns on reduced motion?", a: "Nothing moves. State changes happen at once, or with a short fade." },
  ].filter(Boolean)

  const page = [
    "---",
    `title: ${yaml(name)}`,
    `heading: ${yaml(`${name}`)}`,
    `description: ${yaml(description)}`,
    `component: ${yaml(slug)}`,
    "faq:",
    ...faq.flatMap(({ q, a }) => [`  - q: ${yaml(q)}`, `    a: ${yaml(a)}`]),
    "---",
    "",
    `<ComponentPreview slug="${slug}">`,
    "",
    fence("tsx", example(slug), "example.tsx"),
    "",
    "</ComponentPreview>",
    "",
    "## Installation",
    "",
    fence("npm", `npx shadcn@latest add @keyframery/${slug}`),
    "",
    `This adds \`components/keyframery/${slug}.tsx\` and its primitive, \`components/keyframery/primitives/${slug}.tsx\`, to your project${sdk ? ", and installs `@ui-sdk/react`" : ""}. The motion tokens are added to your global CSS the first time you install a component.`,
    "",
    "## Usage",
    "",
    fence("tsx", importLine(`@/components/keyframery/${slug}`)),
    "",
    sdk
      ? `The parts and props are the same as UI SDK's ${sdk === slug ? name : `\`${sdk}\``}. For every prop, see the [UI SDK ${sdk === slug ? lower : sdk} reference](https://ui-sdk.dev/docs/components/${sdk}).`
      : `UI SDK has no ${lower} component, so this one is built from plain elements with the same two layers as the rest: a primitive that holds the motion, and a finished component on top.`,
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
    ...(moves.length
      ? [
          "## What moves",
          "",
          "| Move | What you see |",
          "| --- | --- |",
          ...moves.map(([m, text]) => `| **${m}** | ${text} |`),
          "",
          "Timing and springiness follow the [motion style](/docs/motion-styles) you set, so this component moves like the rest of your app.",
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
    "## Parts",
    "",
    `The finished component exports ${parts.length === 1 ? "one part" : `${parts.length} parts`}:`,
    "",
    parts.map((p) => `\`${p}\``).join(", "),
    "",
    "## Accessibility",
    "",
    sdk
      ? `Keyboard, focus and screen-reader behaviour come from UI SDK and are not changed. With reduced motion turned on, the ${lower} stops moving: changes happen at once or with a short fade. More in [Accessibility](/docs/accessibility).`
      : `With reduced motion turned on, the ${lower} stops moving: changes happen at once or with a short fade. More in [Accessibility](/docs/accessibility).`,
    "",
    "## Source",
    "",
    "The code that lands in your project. It is yours to change.",
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
    "</Accordions>",
    "",
  ].join("\n")

  fs.writeFileSync(path.join(out, `${slug}.mdx`), page)
}

console.log(`docs: ${slugs.length} component pages -> content/docs/components`)
