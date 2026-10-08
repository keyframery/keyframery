import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

const css = fs.readFileSync(path.resolve(process.cwd(), "../registry/components/keyframery/keyframery.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
const parts = css.split(/,\s*\n|\{/)

describe("every menu value has an enter and an exit rule, in its menu form and its per-element form", () => {
  const MENUS: Record<string, string[]> = { dialog: ["rack-focus", "punch-in", "fade"], sheet: ["slide-sink", "slide", "fade"] }
  for (const [group, cuts] of Object.entries(MENUS)) {
    for (const cut of cuts) {
      it(`${group}=${cut}`, () => {
        expect(css).toContain(`[data-kf-${group}="${cut}"]`)
        expect(css).toContain(`[data-cut="${cut}"]`)
      })
    }
  }
})

it("menu rules exclude elements with their own data-cut, so the two forms never compete", () => {
  const menuParts = parts.filter((p) => /\[data-kf-(dialog|sheet)="(?!none)/.test(p))
  expect(menuParts.length).toBeGreaterThan(0)
  for (const p of menuParts) expect(p).toContain(':not([data-cut], [data-cut="none"] *)')
})

it("every rule that moves something is scoped under html[data-kf]", () => {
  const rules = css.split("}").map((r) => r.trim()).filter((r) => /(^|[\s;{])(animation|animation-name|transition|scale):/.test(r))
  expect(rules.length).toBeGreaterThan(10)
  // The selector is the part right before the declarations; an @media wrapper in front of it isn't one.
  for (const r of rules) expect(r.split("{").at(-2)).toContain("html[data-kf")
})

it("every authored CSS entrance and exit uses its corresponding theme curve", () => {
  const animations = [...css.matchAll(/animation:\s*(kf-[\w-]+)([^;]+);/g)]
  expect(animations.length).toBeGreaterThan(10)
  for (const [, name, timing] of animations) {
    const phase = name.endsWith("-out") || name === "kf-shrink" ? "exit" : "enter"
    expect(timing, name).toContain(phase === "exit" ? "var(--kf-ease-exit)" : "var(--kf-ease)")
  }
})

it("the sinking page uses the entrance curve on opening and exit curve on closing", () => {
  expect(css).toMatch(/\[data-kf-sink\][\s\S]*?transition:[\s\S]*?var\(--kf-ease\)/)
  expect(css).toMatch(/\[data-kf-sink="off"\][\s\S]*?transition-timing-function:\s*var\(--kf-ease-exit\)/)
})
