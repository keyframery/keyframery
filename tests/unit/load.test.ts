import { describe, expect, it } from "vitest"

import { nextLoadPhase, parseHold } from "../../registry/lib/keyframery/load"

describe("nextLoadPhase", () => {
  it.each([
    ["content", "loading", "waiting"],
    ["waiting", "loaded", "content"], // fast data: the skeleton is never seen
    ["waiting", "held", "skeleton"],
    ["skeleton", "loaded", "skeleton"], // stays until it has been up long enough
    ["skeleton", "shown", "settling"],
    ["settling", "settled", "content"],
    ["settling", "loading", "waiting"], // loading again mid-dissolve
    ["skeleton", "loading", "skeleton"],
    ["content", "held", "content"],
  ] as const)("%s + %s → %s", (phase, event, next) => expect(nextLoadPhase(phase, event)).toBe(next))
})

describe("parseHold", () => {
  it.each([
    ["300ms", 300],
    ["0.5s", 500],
    [" 120ms ", 120],
    ["", 300],
    ["fast", 300],
    [null, 300],
  ])("%j → %s", (raw, ms) => expect(parseHold(raw as string | null)).toBe(ms))
})
