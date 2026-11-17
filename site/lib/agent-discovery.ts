/* The files agents look for to discover what a site offers (the checks at isitagentready.com). Each describes only
   what Keyframery really has: public Markdown docs, a shadcn registry and one skill. There is no MCP server, no
   accounts, no OAuth and no Web Bot Auth, so there are no files claiming those. */

import { INSTALL_ALL, INSTALL_ONE, PLUGIN } from "./agent"
import { entries } from "./catalog"
import { REPO, SITE } from "./shared"

export const SKILL_PATH = "/.well-known/agent-skills/keyframery/SKILL.md"
export const SKILL_MEDIA_TYPE = 'text/markdown; profile="urn:air:agent-skills"'

/** /.well-known/api-catalog (RFC 9727): the one thing a program can call, the shadcn registry. */
export const apiCatalog = () => ({
  linkset: [
    {
      anchor: `${SITE}/r/registry.json`,
      "service-desc": [{ href: "https://ui.shadcn.com/schema/registry.json", type: "application/schema+json" }],
      "service-doc": [{ href: `${SITE}/docs/installation`, type: "text/html" }],
    },
  ],
})

/** /.well-known/ai-catalog.json (ARD, ai-catalog data model). */
export const aiCatalog = () => ({
  specVersion: "1.0",
  host: { displayName: "Keyframery", identifier: "did:web:keyframery.com" },
  entries: [
    {
      identifier: "urn:air:keyframery.com:skill:keyframery",
      displayName: "Keyframery skill",
      type: SKILL_MEDIA_TYPE,
      url: `${SITE}${SKILL_PATH}`,
      representativeQueries: ["animate my UI SDK components", "add animated tabs, dialogs and menus to a UI SDK app", "install Keyframery"],
    },
  ],
})

/** /auth.md: there is nothing to authenticate against, and saying so saves an agent the search. */
export const authMd = () =>
  [
    "# Keyframery auth.md",
    "",
    "No registration, no accounts and no credentials. Everything Keyframery offers agents is public and read-only:",
    "",
    `- Skill for coding agents: ${SITE}${SKILL_PATH}`,
    `- shadcn registry: ${SITE}/r/registry.json, items at ${SITE}/r/{name}.json, installed with the shadcn CLI.`,
    `- Docs as Markdown: send Accept: text/markdown to any page, or read ${SITE}/llms-full.txt`,
    "",
    "There is no OAuth server, API key or rate-limited tier. Please crawl politely; the search API is for tools, not crawling.",
    "",
  ].join("\n")

/** The home page as Markdown (/index.md, or / with Accept: text/markdown). */
export const homeMarkdown = () =>
  [
    "# Keyframery: the component library for UI SDK",
    "",
    `> Keyframery is the free, open-source (MIT) component library for UI SDK (@ui-sdk/react): ${entries.length} React components with the motion written in plain CSS and no animation library. Components keep UI SDK's parts and props, so an app already on UI SDK swaps one import and keeps its code. Every component page has Agent view, which shows what an AI agent reads and can do: ${SITE}/docs/agent-view`,
    "",
    `URL: ${SITE}`,
    "",
    "## Install",
    "",
    "```bash",
    `${INSTALL_ONE}   # one component`,
    `${INSTALL_ALL}    # all ${entries.length}`,
    "```",
    "",
    "Components land in `components/keyframery/`, next to your `components/ui/`. UI SDK is installed for you.",
    "",
    "## Swap the import",
    "",
    "```tsx",
    '// before: import { Tabs, TabsList, TabsTab } from "@ui-sdk/react/tabs"',
    'import { Tabs, TabsList, TabsTab } from "@/components/keyframery/primitives/tabs"',
    "```",
    "",
    "## Motion styles",
    "",
    'Four styles change how every component moves: Calm, Springy (default), Snappy and Playful. Set one with `<html data-motion="calm">`.',
    "",
    "## With a coding agent",
    "",
    `In Claude Code: \`${PLUGIN[0]}\`, then \`${PLUGIN[1]}\`, and ask it to animate your UI SDK components. The skill is also at ${SITE}${SKILL_PATH}.`,
    "",
    "## Components",
    "",
    ...entries.map((e) => `- [${e.name}](${SITE}/docs/components/${e.slug}.mdx): ${e.description}`),
    "",
    "## More",
    "",
    `- Docs: ${SITE}/docs`,
    `- Full docs in one file: ${SITE}/llms-full.txt`,
    `- Blog: ${SITE}/blog`,
    `- Source: ${REPO}`,
    "",
  ].join("\n")
