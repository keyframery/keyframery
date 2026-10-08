/* Markdown versions of the pages outside the docs, for AI agents that ask for Markdown (Accept: text/markdown).
   Built from the same constants as the site and the MCP server, so they can't drift from them. */

import { KINDS, kindsMarkdown, REGISTER } from "./kinds"
import { SITE, TAGLINE } from "./seo"

/** What the home page says, as Markdown: what it is, how to install it, what to read next. */
export function homeMarkdown(): string {
  const helpers = KINDS.filter((k) => k.helper).map((k) => `- **${k.helper}**: ${k.covers}. \`${k.install}\`. Docs: ${SITE}/docs/${k.docs}`)
  return [
    "# Keyframery: the shadcn/ui animation library, in one line",
    "",
    `${TAGLINE} Add one line and a shadcn/ui app animates: dialogs grow from the button you clicked, tabs slide, and lists, numbers, loading and empty states move instead of jumping. The components themselves don't change. A motion theme (Quiet, Crisp, Expressive or your own) sets the feel for the whole app.`,
    "",
    "- About 7 KB gzipped, no dependencies.",
    "- Works with Base UI and Radix, in Next.js, Vite and React Router.",
    "- MIT licensed. The shadcn CLI copies the code into the project.",
    "- Profiles, local saves, share links, JSON import/export and installation handoff are free. No account is required.",
    "",
    "## Install",
    "",
    "```bash",
    REGISTER,
    "npx shadcn add @keyframery/cuts",
    "```",
    "",
    'Then render `<Cuts />` once in the root layout, after the content: `import { Cuts } from "@/components/keyframery/cuts"`. Dialogs, alert dialogs, sheets, drawers, tabs, toasts and the command menu then animate on their own.',
    "",
    "## Five helpers for the changes shadcn has no component for",
    "",
    ...helpers,
    "",
    "Keep one root <Cuts /> mounted for helper motion. StateCut transitions whole content, LoadCut manages skeleton delay, and ValueCut animates a small value. Reduced motion is respected.",
    "",
    "## With AI coding agents",
    "",
    "- Claude Code plugin: `/plugin marketplace add keyframery/keyframery`, then `/plugin install keyframery@keyframery`.",
    `- MCP server for any client: ${SITE}/mcp (read-only, no account).`,
    `- All docs as plain text: ${SITE}/llms-full.txt`,
    "",
    "## Read next",
    "",
    `- Quick start: ${SITE}/docs/installation`,
    `- What animates automatically: ${SITE}/docs/automatic`,
    `- Motion theme builder: ${SITE}/theme`,
    `- Reuse and install a theme: ${SITE}/docs/motion-themes`,
    `- Compared with Motion, Animate UI, Magic UI and tw-animate-css: ${SITE}/docs/compare`,
    `- Source: https://github.com/keyframery/keyframery`,
    "",
  ].join("\n")
}

/** The /cuts page: the seven kinds of change and the cut for each. */
export function cutsMarkdown(): string {
  return `${kindsMarkdown(SITE)}\nSee each cut play: ${SITE}/cuts\n`
}

/** The /theme page: what the builder does, with the docs that hold every value. */
export function themeMarkdown(): string {
  return [
    "# Motion theme builder for shadcn/ui",
    "",
    `The page at ${SITE}/theme starts with Quiet, Crisp or Expressive. Preview a real workflow using shadcn components and all five helpers, tune cuts and shared pace and easing, then copy complete installation instructions, a \`<Cuts />\` configuration and CSS variables. Profiles generate props and CSS; there is no runtime profile prop.`,
    "",
    "Save a named theme locally in this browser, share a link, or import/export a validated version-1 JSON file. Local saves are device-specific. All these features are free and require no account.",
    "",
    "Travel, blur and depth affect rack-focus dialogs specifically. Drawer swipe behavior is preserved, and the preview respects system reduced motion.",
    "",
    `Every variable, default and \`<Cuts>\` prop is documented, as Markdown, at ${SITE}/docs/customize.mdx`,
    "",
    "An agent can also build a theme through the read-only MCP server's `make_theme` tool with a quiet, crisp or expressive profile plus individual overrides. The builder can copy an agent prompt carrying the exact configuration.",
    "",
    `Theme reuse and installation guide: ${SITE}/docs/motion-themes.mdx`,
    "",
  ].join("\n")
}

export const MARKDOWN_HEADERS = { "Content-Type": "text/markdown; charset=utf-8" }
