import { describe, expect, it } from "vitest"

import { MOVE_NAMES, moveFor } from "../../registry/lib/keyframery/moves"

const icon = (...classes: string[]) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("class", ["lucide", ...classes].join(" "))
  return svg
}

describe("icon moves", () => {
  it("finds a move by the class lucide renders, including the older name it adds", () => {
    expect(moveFor(icon("lucide-settings"))).toBeTypeOf("function")
    expect(moveFor(icon("lucide-house", "lucide-home"))).toBe(moveFor(icon("lucide-house")))
    expect(moveFor(icon("lucide-chart-column", "lucide-bar-chart-3"))).toBe(moveFor(icon("lucide-chart-column")))
  })

  it("maps newer lucide names onto an existing move", () => {
    expect(moveFor(icon("lucide-trash-2"))).toBe(moveFor(icon("lucide-trash")))
    expect(moveFor(icon("lucide-circle-question-mark"))).toBe(moveFor(icon("lucide-circle-help")))
  })

  it("has no move for an icon it doesn't know, so the caller redraws or punches it", () => {
    expect(moveFor(icon("lucide-credit-card"))).toBeNull()
    expect(moveFor(icon("tabler-icon", "tabler-icon-check"))).toBeNull()
  })

  it("ships around fifty moves", () => {
    expect(MOVE_NAMES.length).toBeGreaterThanOrEqual(50)
  })
})
