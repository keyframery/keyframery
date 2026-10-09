import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import site from "../../apps/web/lib/tested.json"
// @ts-expect-error: a plain ESM script, without types
import { testedLine, testedTable } from "../../apps/web/scripts/gen-tested.mjs"
// @ts-expect-error: a plain ESM script, without types
import { tested } from "../../fixtures/tested.mjs"
// @ts-expect-error: a plain ESM script, without types
import { parseDryRun } from "../../scripts/drift.mjs"

const root = path.resolve(process.cwd(), "..")
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8")

describe("tested versions", () => {
  it("names on the site only what the fixtures really run (run apps/web/scripts/gen-tested.mjs)", () => {
    expect(site).toEqual(tested())
    expect(read("apps/web/content/docs/compatibility.mdx")).toContain(testedTable())
    expect(read("apps/web/content/docs/installation.mdx")).toContain(testedLine())
  })

  it("pins the shadcn CLI in one place, fixtures/tested.json", () => {
    for (const script of ["create.mjs", "sync.mjs", "vite-check.mjs", "monorepo-check.mjs"]) {
      const src = read(`fixtures/${script}`)
      expect(src, script).toContain('import { SHADCN_CLI } from "./tested.mjs"')
      expect(src, script).not.toMatch(/shadcn@\d/)
    }
  })
})

describe("parseDryRun", () => {
  const output = (files: string[], summary: string) =>
    ["- Resolving items.", "┌ shadcn add badge, kbd (dry run)", "│", `├ Files (${files.length}) ${summary}`, ...files, "│", "├ Dependencies (1)", "│ + cn", "│", "└ Run without --dry-run to apply."].join("\n")

  it("reads which files match the registry, changed or are new", () => {
    const text = output(
      ["│ = components/ui/accordion.tsx         skip (identical)", "│ ~ components/ui/badge.tsx             overwrite", "│ + components/ui/kbd.tsx               create"],
      "+1 new, ~1 overwrite, =1 skip",
    )
    expect(parseDryRun(text)).toEqual([
      { path: "components/ui/accordion.tsx", status: "same" },
      { path: "components/ui/badge.tsx", status: "changed" },
      { path: "components/ui/kbd.tsx", status: "new" },
    ])
  })

  it("ignores terminal colours", () => {
    expect(parseDryRun(output(["│ \x1b[32m=\x1b[39m components/ui/badge.tsx  skip (identical)"], "=1 skip"))).toEqual([{ path: "components/ui/badge.tsx", status: "same" }])
    expect(parseDryRun(`\x1b[2m${output(["│ = components/ui/badge.tsx  skip (identical)"], "=1 skip")}\x1b[22m`)).toHaveLength(1)
  })

  it("fails loudly when the CLI's output changes shape, instead of reporting no drift", () => {
    expect(() => parseDryRun("┌ shadcn add badge\n└ done")).toThrow(/no file list/)
    expect(() => parseDryRun(output(["│ ? components/ui/badge.tsx  something new"], "?1 other"))).toThrow(/listed 1 files, but 0/)
  })
})
