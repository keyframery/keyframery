import { beforeEach, describe, expect, it } from "vitest"

import { isActive, optedOut, phaseOf } from "../../registry/lib/keyframery/state"

function el(html: string) {
  document.body.innerHTML = html
  return document.body.firstElementChild as HTMLElement
}

describe("phaseOf", () => {
  it.each([
    ['<div data-state="open"></div>', "open"],
    ['<div data-state="delayed-open"></div>', "open"],
    ['<div data-state="instant-open"></div>', "open"],
    ["<div data-open></div>", "open"],
    ['<div data-open="false"></div>', null],
    ['<div data-state="closed"></div>', "closed"],
    ["<div data-closed></div>", "closed"],
    ["<div></div>", null],
  ])("%s is %s", (html, phase) => expect(phaseOf(el(html))).toBe(phase))
})

describe("isActive", () => {
  it.each([
    ['<button data-state="active"></button>', true],
    ["<button data-active></button>", true],
    ['<button aria-selected="true"></button>', true],
    ['<button data-state="inactive"></button>', false],
  ])("%s is %s", (html, value) => expect(isActive(el(html))).toBe(value))
})

describe("optedOut", () => {
  beforeEach(() => document.documentElement.setAttribute("data-kf", ""))
  it("is true while the layer is disabled", () => {
    document.documentElement.removeAttribute("data-kf")
    expect(optedOut(el("<div></div>"))).toBe(true)
  })
  it("follows data-cut=none on any ancestor", () => {
    document.body.innerHTML = '<section data-cut="none"><p id="x"></p></section>'
    expect(optedOut(document.getElementById("x")!)).toBe(true)
  })
  it("ignores named cuts on ancestors", () => {
    document.body.innerHTML = '<section data-cut="fade"><p id="x"></p></section>'
    expect(optedOut(document.getElementById("x")!)).toBe(false)
  })
})
