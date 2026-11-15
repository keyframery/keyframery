import { SITE } from "@site/lib/shared"
import { docsLlms } from "@site/lib/source"

export const revalidate = false

const HEADER = `# Keyframery

> Keyframery is an open-source (MIT) set of 60 animated React components for UI SDK (@ui-sdk/react), written in plain CSS with no animation library. Each component keeps UI SDK's parts and props, so an app can swap one import and keep its code. Components install as source with the shadcn CLI (npx shadcn add @keyframery/tabs) into components/keyframery/. Four motion styles (Calm, Springy, Snappy, Playful) change how every component moves with one attribute, data-motion, on <html>.

- Full docs in one file: ${SITE}/llms-full.txt
- Every docs page is also Markdown: add .mdx to its URL
- Skill for coding agents: ${SITE}/.well-known/agent-skills/keyframery/SKILL.md (in Claude Code: /plugin marketplace add keyframery/keyframery)
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
  return new Response(`${HEADER}\n\n${normalize(await docsLlms.index())}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
