import { describe, expect, it } from "vitest"

import { aimAt, carrySettings, mirrorCut, offsetBetween } from "../../registry/lib/keyframery/aim"
import type { Press } from "../../registry/lib/keyframery/press"

const press = (el: Element): Press => ({ el, rect: el.getBoundingClientRect(), t: 0 })

it("offsetBetween points from the target's centre to the opener's centre", () => {
  expect(offsetBetween({ left: 0, top: 0, width: 100, height: 40 }, { left: 400, top: 300, width: 200, height: 100 })).toEqual({ dx: -450, dy: -330 })
})

describe("aimAt", () => {
  it("aims at the centre when nothing opened it", () => {
    const d = document.createElement("div")
    aimAt(d, null, false)
    expect([d.style.getPropertyValue("--kf-dx"), d.style.getPropertyValue("--kf-dy")]).toEqual(["0px", "0px"])
  })
  it("honours data-cut-origin", () => {
    document.body.innerHTML = '<button id="b"></button><div id="d" data-cut-origin="center"></div>'
    const d = document.getElementById("d") as HTMLElement
    aimAt(d, press(document.getElementById("b")!), false)
    expect(d.style.getPropertyValue("--kf-dx")).toBe("0px")
  })
})

describe("carrySettings", () => {
  it("copies an ancestor data-cut=none onto portaled content", () => {
    document.body.innerHTML = '<section data-cut="none"><button id="b"></button></section><div id="c"></div>'
    carrySettings(document.getElementById("c") as HTMLElement, document.getElementById("b"))
    expect(document.getElementById("c")!.getAttribute("data-cut")).toBe("none")
  })
  it("never carries a named cut", () => {
    document.body.innerHTML = '<section data-cut="whip"><button id="b"></button></section><div id="c"></div>'
    carrySettings(document.getElementById("c") as HTMLElement, document.getElementById("b"))
    expect(document.getElementById("c")!.hasAttribute("data-cut")).toBe(false)
  })
  it("leaves content alone that has its own data-cut", () => {
    document.body.innerHTML = '<section data-cut="none"><button id="b"></button></section><div id="c" data-cut="fade"></div>'
    carrySettings(document.getElementById("c") as HTMLElement, document.getElementById("b"))
    expect(document.getElementById("c")!.getAttribute("data-cut")).toBe("fade")
  })
})

it("mirrorCut copies the content's choice onto its backdrop", () => {
  document.body.innerHTML = '<div id="o" data-slot="dialog-overlay"></div><div id="c" data-slot="dialog-content" data-cut="fade"></div>'
  mirrorCut(document.getElementById("c") as HTMLElement, '[data-slot="dialog-overlay"]')
  expect(document.getElementById("o")!.getAttribute("data-cut")).toBe("fade")
})
