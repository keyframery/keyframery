import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { KINDS, kindsMarkdown } from "../../apps/web/lib/kinds"

// Resolved from the tests package, like css.test.ts: under happy-dom, URL is happy-dom's, which fs doesn't accept.
const docs = path.resolve(process.cwd(), "../apps/web/content/docs")

describe("kinds", () => {
  it("has the six kinds: two automatic, four with one helper each", () => {
    expect(KINDS).toHaveLength(6)
    expect(KINDS.filter((k) => k.helper === null)).toHaveLength(2)
    expect(KINDS.map((k) => k.helper).filter(Boolean)).toEqual(["MatchCut", "ListCut", "ValueCut", "LoadCut"])
  })

  it("points every kind at a docs page that exists", () => {
    for (const k of KINDS) expect(fs.existsSync(path.join(docs, `${k.docs}.mdx`)), k.docs).toBe(true)
  })

  it("renders Markdown that names <Cuts />, every helper and absolute docs links", () => {
    const md = kindsMarkdown()
    expect(md).toContain("<Cuts />")
    for (const h of ["MatchCut", "ListCut", "ValueCut", "LoadCut"]) expect(md).toContain(h)
    expect(md).toContain("https://keyframery.com/docs/helpers/list-cut")
    // A fresh project doesn't know @keyframery until it is registered once.
    expect(md).toContain('npx shadcn registry add "@keyframery=https://keyframery.com/r/{name}.json"')
  })
})
