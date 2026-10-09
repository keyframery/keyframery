import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import coverage from "../../apps/web/lib/coverage.json"
import { entryOf, MENUS, snippetsFor } from "../../apps/web/lib/knobs"

const root = path.resolve(process.cwd(), "..")
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8")
const HELPERS = ["ListCut", "LoadCut", "MatchCut", "StateCut", "ValueCut"]

describe("what each component page says you can change", () => {
  it("names a part that shadcn's component really exports, on both bases", () => {
    for (const c of coverage.components as { slug: string; kind: string; part?: string | null }[]) {
      if (c.kind === "still") continue
      expect(c, c.slug).toHaveProperty("part")
      if (!c.part || HELPERS.includes(c.part)) continue
      for (const base of ["next-base", "next-radix"]) {
        const file = `fixtures/${base}/components/ui/${c.slug}.tsx`
        if (!fs.existsSync(path.join(root, file))) continue // toast is Base UI only
        expect(read(file), `${c.slug}: ${c.part} on ${base}`).toMatch(new RegExp(`^function ${c.part}\\b`, "m"))
      }
    }
  })

  it("offers exactly the cuts the engine accepts", () => {
    const engine = read("registry/lib/keyframery/engine.ts")
    const TYPES: Record<string, string> = { dialog: "DialogCut", sheet: "SheetCut", drawer: "DrawerCut", tabs: "TabsCut", toast: "ToastCut" }
    for (const [menu, type] of Object.entries(TYPES)) {
      const union = new RegExp(`export type ${type} = ([^\\n]+)`).exec(engine)![1]
      const accepted = [...union.matchAll(/"([^"]+)"/g)].map((m) => m[1]).filter((c) => c !== "none")
      expect(MENUS[menu].cuts.map((c) => c.id), menu).toEqual(accepted)
    }
  })

  it("gives the default first, so a page's first cut is what ships", () => {
    const engine = read("registry/lib/keyframery/engine.ts")
    for (const [menu, def] of engine.matchAll(/^\s+(dialog|sheet|drawer|tabs|toast): "([^"]+)",$/gm).map((m) => [m[1], m[2]])) expect(MENUS[menu].cuts[0].id, menu).toBe(def)
  })

  it("writes the line to copy for a choice", () => {
    expect(snippetsFor(entryOf("dialog")!, { cut: "rack-focus", pace: 1, off: false })).toEqual([])
    expect(snippetsFor(entryOf("dialog")!, { cut: "fade", pace: 1, off: false }).map((s) => s.code)).toEqual(['<Cuts dialog="fade" />', '<DialogContent data-cut="fade" />'])
    expect(snippetsFor(entryOf("popover")!, { pace: 1.6, off: false }).map((s) => s.code)).toEqual(["<Cuts pace={1.6} />", '<PopoverContent data-cut-pace="1.6" />'])
    expect(snippetsFor(entryOf("checkbox")!, { pace: 1, off: true }).map((s) => s.code)).toEqual(['<Cuts responses="none" />', '<Checkbox data-cut="none" />'])
    expect(snippetsFor(entryOf("badge")!, { pace: 0.6, off: false }).map((s) => s.code)).toEqual(["<ValueCut pace={0.6}>…</ValueCut>"])
    // Command and toasts have no part of their own to set it on: only the <Cuts> line.
    expect(snippetsFor(entryOf("command")!, { cut: "fade", pace: 1, off: false }).map((s) => s.code)).toEqual(['<Cuts dialog="fade" />'])
  })
})
