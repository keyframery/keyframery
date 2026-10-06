import { describe, expect, it } from "vitest"

import { changedUnits, formatValue, previousUnit, unitsOf } from "../../registry/lib/keyframery/value"

describe("unitsOf", () => {
  it("splits numbers into characters, keeps text whole", () => {
    expect(unitsOf(1284, "1,284")).toEqual(["1", ",", "2", "8", "4"])
    expect(unitsOf("Paid", "Paid")).toEqual(["Paid"])
  })
})

describe("changedUnits (aligned from the right)", () => {
  it("only the ones place changes for +1", () => expect(changedUnits([..."1,284"], [..."1,285"])).toEqual([false, false, false, false, true]))
  it("a new leading digit and the digit it displaced change when the count grows", () =>
    expect(changedUnits([..."1,284"], [..."10,284"])).toEqual([true, true, false, false, false, false]))
  it("text is one unit", () => expect(changedUnits(["Pending"], ["Paid"])).toEqual([true]))
})

it("previousUnit finds what sat in the same place-value", () => {
  expect(previousUnit([..."1,284"], [..."10,284"], 1)).toBe("1")
  expect(previousUnit([..."1,284"], [..."10,284"], 0)).toBeUndefined()
})

it("formatValue uses Intl for numbers and leaves text alone", () => {
  expect(formatValue(1284, "en-US")).toBe("1,284")
  expect(formatValue(1500, "en-US", { notation: "compact" })).toBe("1.5K")
  expect(formatValue("Paid")).toBe("Paid")
})
