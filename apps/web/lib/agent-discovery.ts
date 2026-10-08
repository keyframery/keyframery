/* The files agents look for to discover what a site offers (the checks at isitagentready.com). Each describes only
   what Keyframery really has: a public, read-only MCP server, a shadcn registry and one skill. No accounts, no OAuth
   and no A2A agent, so there are no files claiming those. */

import { createHash } from "node:crypto"
import fs from "node:fs"
import path from "node:path"

import { SERVER_INFO } from "./mcp"
import { SITE } from "./seo"

const MCP = `${SITE}/mcp`
const SERVER_CARD = `${SITE}/.well-known/mcp/server-card.json`
const SKILL_PATH = "/.well-known/agent-skills/keyframery/SKILL.md"

/** /.well-known/mcp/server-card.json (MCP SEP-1649). */
export const serverCard = () => ({
  serverInfo: SERVER_INFO,
  description:
    "Keyframery's docs for AI tools: the seven kinds of change and the cut for each, any docs page as Markdown, docs search, and motion themes for shadcn/ui. Read-only, no account.",
  url: MCP,
  transport: { type: "streamable-http" },
  capabilities: { tools: true },
})

/** /.well-known/api-catalog (RFC 9727): the two things a program can call. */
export const apiCatalog = () => ({
  linkset: [
    {
      anchor: MCP,
      "service-desc": [{ href: SERVER_CARD, type: "application/json" }],
      "service-doc": [{ href: `${SITE}/docs/ai-tools`, type: "text/html" }],
    },
    {
      anchor: `${SITE}/r/registry.json`,
      "service-desc": [{ href: "https://ui.shadcn.com/schema/registry.json", type: "application/schema+json" }],
      "service-doc": [{ href: `${SITE}/docs/installation`, type: "text/html" }],
    },
  ],
})

/** The skill, byte for byte as the Claude Code plugin ships it. Read at build time (the routes are static). */
export function skillFile(): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "../../plugins/keyframery/skills/keyframery/SKILL.md"))
}

/** /.well-known/agent-skills/index.json (Agent Skills Discovery v0.2.0). */
export const skillsIndex = () => ({
  $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  skills: [
    {
      name: "keyframery",
      type: "skill-md",
      description: "Add Keyframery's animations to a shadcn/ui app: install it, render <Cuts />, pick a motion theme, and pick the right cut for each kind of change.",
      url: SKILL_PATH,
      digest: `sha256:${createHash("sha256").update(skillFile()).digest("hex")}`,
    },
  ],
})

/** /.well-known/ai-catalog.json (ARD, ai-catalog data model). */
export const aiCatalog = () => ({
  specVersion: "1.0",
  host: { displayName: "Keyframery", identifier: "did:web:keyframery.com" },
  entries: [
    {
      identifier: "urn:air:keyframery.com:server:keyframery",
      displayName: "Keyframery MCP server",
      type: "application/mcp-server-card+json",
      url: SERVER_CARD,
      representativeQueries: ["how do I animate a shadcn dialog", "animate loading and error content with StateCut", "make a Quiet motion theme for shadcn/ui"],
    },
    {
      identifier: "urn:air:keyframery.com:skill:keyframery",
      displayName: "Keyframery skill",
      type: "text/markdown",
      url: `${SITE}${SKILL_PATH}`,
      representativeQueries: ["add animations to my shadcn app", "animate dialogs, tabs and toasts in shadcn/ui", "install Keyframery"],
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
    `- MCP server: ${MCP} (Streamable HTTP; tools list_kinds, search_docs, get_doc, make_theme).`,
    `- shadcn registry: ${SITE}/r/registry.json, items at ${SITE}/r/{name}.json, installed with the shadcn CLI.`,
    `- Docs as Markdown: send Accept: text/markdown to any page, or read ${SITE}/llms-full.txt`,
    "",
    "There is no OAuth server, API key or rate-limited tier. Please crawl politely; the search API and /mcp are for tools, not crawling.",
    "",
  ].join("\n")
