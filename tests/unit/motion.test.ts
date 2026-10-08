import { afterEach, describe, expect, it, vi } from "vitest"

import { easingOf, emitCut, parsePace, REDUCED_MS, scaled } from "../../registry/lib/keyframery/motion"

describe("easingOf", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("reads the element's entrance and exit curves separately", () => {
    const el = document.createElement("div")
    el.style.setProperty("--kf-ease", "  ease-in-out ")
    el.style.setProperty("--kf-ease-exit", "steps(2, end)")
    document.body.append(el)
    expect(easingOf(el)).toBe("ease-in-out")
    expect(easingOf(el, "exit")).toBe("steps(2, end)")
    el.remove()
  })

  it("uses phase defaults or an authored fallback when no curve is configured", () => {
    const el = document.createElement("div")
    expect(easingOf(el)).toBe("cubic-bezier(0.22, 1, 0.36, 1)")
    expect(easingOf(el, "exit")).toBe("cubic-bezier(0.5, 0, 0.75, 0)")
    expect(easingOf(el, "enter", "ease-out")).toBe("ease-out")
  })

  it.each(["spring", "inherit", "initial", "unset", "revert", "revert-layer", "ease, linear", "var(--other-curve)", "cubic-bezier(2, 0, 1, 1)"])("rejects %s before it reaches WAAPI", (value) => {
    vi.stubGlobal("CSS", { supports: (_property: string, curve: string) => !["spring", "cubic-bezier(2, 0, 1, 1)"].includes(curve) })
    const el = document.createElement("div")
    el.style.setProperty("--kf-ease", value)
    document.body.append(el)
    expect(easingOf(el, "enter", "ease-out")).toBe("ease-out")
    el.remove()
  })

  it("accepts one curve whose arguments contain commas", () => {
    const el = document.createElement("div")
    el.style.setProperty("--kf-ease", "cubic-bezier(0.2, 0.9, 0.1, 1)")
    document.body.append(el)
    expect(easingOf(el)).toBe("cubic-bezier(0.2, 0.9, 0.1, 1)")
    el.remove()
  })

  it("keeps an invalid authored fallback out of WAAPI too", () => {
    vi.stubGlobal("CSS", { supports: () => false })
    expect(easingOf(document.createElement("div"), "exit", "spring")).toBe("cubic-bezier(0.5, 0, 0.75, 0)")
  })
})

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
