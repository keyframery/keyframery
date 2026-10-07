import { describe, expect, it } from "vitest"

import { initialSettle, isHidden, nextSettle, type SettleEvent } from "../../apps/web/components/home/settle"

const run = (open: boolean, events: SettleEvent[]) => events.reduce(nextSettle, initialSettle(open))

describe("staged dialog settling", () => {
  it("starts hidden when closed and shown when open", () => {
    expect(isHidden(initialSettle(false))).toBe(true)
    expect(isHidden(initialSettle(true))).toBe(false)
  })

  it("stays visible through its exit, and hides once the exit has ended", () => {
    expect(isHidden(run(false, ["open", "close"]))).toBe(false)
    expect(isHidden(run(false, ["open", "close", "ended"]))).toBe(true)
  })

  it("never hides an open dialog, whatever late event arrives", () => {
    expect(isHidden(run(false, ["open", "ended"]))).toBe(false)
    expect(isHidden(run(false, ["open", "close", "ended", "open", "ended"]))).toBe(false)
  })

  it("plays the next exit again after reopening", () => {
    expect(isHidden(run(false, ["open", "close", "ended", "open", "close"]))).toBe(false)
  })
})
