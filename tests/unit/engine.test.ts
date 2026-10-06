import { afterEach, expect, it } from "vitest"

import { applyMenus, setEnabled, setPace, start } from "../../registry/lib/keyframery/engine"

const tick = () => new Promise((r) => setTimeout(r, 0))
const html = document.documentElement

function paced() {
  const s = document.createElement("section")
  s.setAttribute("data-cut-pace", "2")
  document.body.append(s)
  return s
}

afterEach(() => {
  document.body.innerHTML = ""
})

it("writes every menu to <html>, filling in the defaults", () => {
  applyMenus({ dialog: "punch-in" })
  expect(html.getAttribute("data-kf-dialog")).toBe("punch-in")
  expect(html.getAttribute("data-kf-sheet")).toBe("slide-sink")
  expect(html.getAttribute("data-kf-drawer")).toBe("slide-sink")
  expect(html.getAttribute("data-kf-tabs")).toBe("j-cut")
  expect(html.getAttribute("data-kf-toast")).toBe("cut-on-action")
})

it("setEnabled and setPace", () => {
  setEnabled(true)
  expect(html.hasAttribute("data-kf")).toBe(true)
  setPace(2)
  expect(html.style.getPropertyValue("--kf-pace")).toBe("2")
  setPace(undefined)
  expect(html.style.getPropertyValue("--kf-pace")).toBe("")
  setEnabled(false)
  expect(html.hasAttribute("data-kf")).toBe(false)
})

it("is reference-counted, and the last release restores <html>", async () => {
  setEnabled(true)
  applyMenus({})
  const a = start()
  const b = start()
  const s1 = paced()
  await tick()
  expect(s1.style.getPropertyValue("--kf-pace")).toBe("2")
  a()
  a() // releasing twice is harmless
  const s2 = paced()
  await tick()
  expect(s2.style.getPropertyValue("--kf-pace")).toBe("2") // b still holds the engine
  b()
  expect(html.hasAttribute("data-kf")).toBe(false)
  expect(html.hasAttribute("data-kf-dialog")).toBe(false)
  const s3 = paced()
  await tick()
  expect(s3.style.getPropertyValue("--kf-pace")).toBe("")
})

it("applies data-cut-pace that was already in the page before start", () => {
  const s = paced()
  const stop = start()
  expect(s.style.getPropertyValue("--kf-pace")).toBe("2")
  stop()
})
