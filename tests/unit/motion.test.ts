import { afterEach, describe, expect, it, vi } from "vitest"

import { emitCut, parsePace, REDUCED_MS, scaled } from "../../registry/lib/keyframery/motion"

describe("parsePace", () => {
  it.each([
    ["", 1],
    ["2", 2],
    [" 0.5 ", 0.5],
    ["0", 1],
    ["-1", 1],
    ["fast", 1],
    [null, 1],
  ])("%j is %s", (raw, value) => expect(parsePace(raw as string | null)).toBe(value))
})

describe("scaled", () => {
  afterEach(() => vi.unstubAllGlobals())
  it("multiplies by the element's --kf-pace", () => {
    const d = document.createElement("div")
    d.style.setProperty("--kf-pace", "2")
    document.body.append(d)
    expect(scaled(340, d)).toBe(680)
  })
  it("caps every cut at a short fade under reduced motion", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("reduce") }))
    const d = document.createElement("div")
    expect(scaled(340, d)).toBe(REDUCED_MS)
    expect(scaled(80, d)).toBe(80)
  })
})

it("emitCut dispatches keyframery:cut with its detail", () => {
  const seen: unknown[] = []
  document.addEventListener("keyframery:cut", (e) => seen.push((e as CustomEvent).detail), { once: true })
  emitCut({ cut: "fade", component: "dialog", phase: "enter", ms: 200 })
  expect(seen).toEqual([{ cut: "fade", component: "dialog", phase: "enter", ms: 200 }])
})
