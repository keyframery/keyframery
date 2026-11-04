/* The files agents look for to discover what a site offers (the checks at isitagentready.com). Each describes only
   what Keyframery really has: public Markdown docs, a shadcn registry and one skill. No MCP server, no accounts,
   no OAuth and no A2A agent, so there are no files claiming those. */

import { createHash } from "node:crypto"
import fs from "node:fs"
import path from "node:path"

import { SITE } from "./seo"

const SKILL_PATH = "/.well-known/agent-skills/keyframery/SKILL.md"
export const SKILL_MEDIA_TYPE = 'text/markdown; profile="urn:air:agent-skills"'

/** /.well-known/api-catalog (RFC 9727): the one thing a program can call. */
export const apiCatalog = () => ({
  linkset: [
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
      identifier: "urn:air:keyframery.com:skill:keyframery",
      displayName: "Keyframery skill",
      type: SKILL_MEDIA_TYPE,
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
    `- Skill for coding agents: ${SITE}${SKILL_PATH}`,
    `- shadcn registry: ${SITE}/r/registry.json, items at ${SITE}/r/{name}.json, installed with the shadcn CLI.`,
    `- Docs as Markdown: send Accept: text/markdown to any page, or read ${SITE}/llms-full.txt`,
    "",
    "There is no OAuth server, API key or rate-limited tier. Please crawl politely; the search API is for tools, not crawling.",
    "",
  ].join("\n")
