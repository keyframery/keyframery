import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { agentPrompt, KINDS, kindsMarkdown, REGISTER } from "../../apps/web/lib/kinds"

// Resolved from the tests package, like css.test.ts: under happy-dom, URL is happy-dom's, which fs doesn't accept.
const docs = path.resolve(process.cwd(), "../apps/web/content/docs")

describe("kinds", () => {
  it("has the seven kinds: two automatic, five with one helper each", () => {
    expect(KINDS).toHaveLength(7)
    expect(KINDS.filter((k) => k.helper === null)).toHaveLength(2)
    expect(KINDS.map((k) => k.helper).filter(Boolean)).toEqual(["MatchCut", "ListCut", "ValueCut", "LoadCut", "StateCut"])
  })

  it("points every kind at a docs page that exists", () => {
    for (const k of KINDS) expect(fs.existsSync(path.join(docs, `${k.docs}.mdx`)), k.docs).toBe(true)
  })

  it("renders Markdown that names <Cuts />, every helper and absolute docs links", () => {
    const md = kindsMarkdown()
    expect(md).toContain("<Cuts />")
    for (const h of ["MatchCut", "ListCut", "ValueCut", "LoadCut", "StateCut"]) expect(md).toContain(h)
    expect(md).toContain("The seven kinds of change")
    expect(md).not.toContain("Every change on a screen")
    expect(md).toContain("https://keyframery.com/docs/helpers/list-cut")
    // shadcn's registry index resolves @keyframery; registering is only the fallback for an "Unknown registry" answer.
    expect(md).toContain("npx shadcn add @keyframery/cuts")
    expect(md).toContain(`Unknown registry "@keyframery"\`, register Keyframery once with \`${REGISTER}\``)
  })

  it("writes a prompt a coding agent can follow from an empty start", () => {
    const prompt = agentPrompt()
    expect(prompt).toContain("1. Install the layer:\n   npx shadcn add @keyframery/cuts")
    expect(prompt).toContain(`Unknown registry "@keyframery", run this once, then install again: ${REGISTER}`)
    expect(prompt).toContain('import { Cuts } from "@/components/keyframery/cuts"')
    expect(prompt).toContain("<Cuts />")
    for (const k of KINDS.filter((k) => k.helper)) {
      expect(prompt).toContain(k.helper!)
      expect(prompt).toContain(k.install)
      expect(prompt).toContain(`https://keyframery.com/docs/${k.docs}.mdx`)
    }
    expect(prompt).toContain("https://keyframery.com/llms-full.txt")
    expect(prompt).toContain("https://keyframery.com/mcp")
    expect(prompt).toContain("Quiet, Crisp or Expressive")
    expect(prompt).toContain("StateCut for whole-content state switches")
    // Plain text: it is pasted into a chat box, so no Markdown fences and no trailing whitespace.
    expect(prompt).not.toContain("```")
    expect(prompt).toBe(prompt.trim())
  })
})
