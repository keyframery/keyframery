import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import coverage from "../../apps/web/lib/coverage.json"
// @ts-expect-error: a plain ESM script, without types
import { coverageTable, HAND, MERGED, pageFor } from "../../apps/web/scripts/gen-components.mjs"

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
      // A merged component is documented on its target's page and has none of its own.
      const merged = (MERGED as Record<string, string>)[c.slug]
      const file = path.join(docs, "components", `${merged ?? c.slug}.mdx`)
      expect(fs.existsSync(file), c.slug).toBe(true)
      if (merged) expect(fs.existsSync(path.join(docs, "components", `${c.slug}.mdx`)), c.slug).toBe(false)
      else if (!HAND.includes(c.slug)) expect(fs.readFileSync(file, "utf8"), c.slug).toBe(pageFor(c))
    }
  })

  it("gives every generated page its own search snippet of a length Google shows in full", () => {
    const seen = new Set<string>()
    for (const c of coverage.components) {
      if (HAND.includes(c.slug) || (MERGED as Record<string, string>)[c.slug]) continue
      const d = pageFor(c).match(/^description: "(.+)"$/m)?.[1] ?? ""
      expect(d.length, c.slug).toBeGreaterThanOrEqual(110)
      expect(d.length, c.slug).toBeLessThanOrEqual(158)
      expect(seen.has(d), c.slug).toBe(false)
      seen.add(d)
    }
  })

  it("prints the same coverage table as the Compatibility page", () => {
    expect(fs.readFileSync(path.join(docs, "compatibility.mdx"), "utf8")).toContain(coverageTable())
  })

  it("does not advertise an animation on components that stay still", () => {
    for (const c of coverage.components.filter((component) => component.kind === "still")) {
      const page = pageFor(c)
      expect(page.match(/^seoTitle: (.+)$/m)?.[1], c.slug).not.toMatch(/animation/i)
      expect(page.match(/^heading: (.+)$/m)?.[1], c.slug).not.toMatch(/animation/i)
      expect(page, c.slug).toContain('title="Nothing moves here, on purpose"')
    }
  })

  it("only names helpers that the registry ships", () => {
    const items = new Set(registry.items.map((i: { title?: string }) => i.title))
    for (const c of coverage.components)
      for (const [, , , how] of c.moves) if (how.startsWith("helper:")) expect(items.has(how.slice(7)), `${c.slug}: ${how}`).toBe(true)
  })
})
