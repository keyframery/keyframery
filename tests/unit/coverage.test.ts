import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import coverage from "../../apps/web/lib/coverage.json"
// @ts-expect-error: a plain ESM script, without types
import { coverageTable, HAND, pageFor } from "../../apps/web/scripts/gen-components.mjs"

const docs = path.resolve(process.cwd(), "../apps/web/content/docs")
const registry = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "../registry/registry.json"), "utf8"))

describe("coverage", () => {
  it("covers exactly shadcn's 63 components, once each", () => {
    const slugs = coverage.components.map((c) => c.slug)
    expect(slugs).toHaveLength(63)
    expect(new Set(slugs).size).toBe(63)
  })

  it("has a docs page for every component, and the generated ones match the data (run gen-components.mjs)", () => {
    for (const c of coverage.components) {
      const file = path.join(docs, "components", `${c.slug}.mdx`)
      expect(fs.existsSync(file), c.slug).toBe(true)
      if (!HAND.includes(c.slug)) expect(fs.readFileSync(file, "utf8"), c.slug).toBe(pageFor(c))
    }
  })

  it("prints the same coverage table as the Compatibility page", () => {
    expect(fs.readFileSync(path.join(docs, "compatibility.mdx"), "utf8")).toContain(coverageTable())
  })

  it("only names helpers that the registry ships", () => {
    const items = new Set(registry.items.map((i: { title?: string }) => i.title))
    for (const c of coverage.components)
      for (const [, , , how] of c.moves) if (how.startsWith("helper:")) expect(items.has(how.slice(7)), `${c.slug}: ${how}`).toBe(true)
  })
})
