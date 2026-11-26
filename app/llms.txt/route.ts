import { entries } from "@site/lib/catalog"
import { SITE } from "@site/lib/shared"
import { allPosts } from "@site/lib/blog"
import { docsLlms } from "@site/lib/source"

export const revalidate = false

const HEADER = `# Keyframery

> Keyframery is the open-source (MIT) component library for UI SDK (@ui-sdk/react): ${entries.length} React components built on UI SDK's behaviours, with the motion written in plain CSS and no animation library. Components built on UI SDK's own keep its parts and props, so an app already on UI SDK can swap one import and keep its code. Every component page has Agent view, which shows the live UI SDK snapshot an AI agent reads (labels, state, actions) and runs those actions on the real component (${SITE}/docs/agent-view.mdx). Components install as source with the shadcn CLI (npx shadcn add @keyframery/tabs) into components/keyframery/. Motion is quiet by default (Subtle: quick fades, no bounce, about as much as shadcn/ui); four more styles (Calm, Springy, Snappy, Playful) add springs, stretches and pops with one attribute, data-motion on <html>.

- Full docs in one file: ${SITE}/llms-full.txt
- Every docs page is also Markdown: add .mdx to its URL (or send Accept: text/markdown)
- Home page as Markdown: ${SITE}/index.md
- Skill for coding agents: ${SITE}/.well-known/agent-skills/keyframery/SKILL.md (in Claude Code: /plugin marketplace add keyframery/keyframery)
- Theme builder: ${SITE}/create (a preset installs with npx shadcn add @keyframery/preset-<code>; docs: ${SITE}/docs/presets.mdx)
- Registry index: ${SITE}/r/registry.json
- Source: https://github.com/keyframery/keyframery`

/** Fumadocs' index lists sections as bold bullets with site-relative links. llms.txt expects "##" sections and absolute links to the Markdown versions. */
function normalize(index: string) {
  return index
    .replace(/^# .*\n/, "")
    .replace(/^- \*\*(.+?)\*\*$/gm, "## $1\n")
    .replace(/\]\((\/docs[^)]*)\)/g, (_, path: string) => `](${SITE}${path}.mdx)`)
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export async function GET() {
  const blog = `## Blog\n\n${allPosts().map((p) => `- [${p.data.title}](${SITE}${p.url}.md): ${p.data.description}`).join("\n")}`
  return new Response(`${HEADER}\n\n${normalize(await docsLlms.index())}\n\n${blog}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
