import { afterEach, expect, it } from "vitest"

import { applyMenus, setEnabled, setPace, setResponses, start } from "../../registry/lib/keyframery/engine"

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


it("lastPress is null until the engine runs, then reports the last press", async () => {
  const { lastPress } = await import("../../registry/lib/keyframery/engine")
  expect(lastPress()).toBeNull()
  const stop = start()
  const b = document.createElement("button")
  document.body.append(b)
  b.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))
  expect(lastPress()?.el).toBe(b)
  stop()
  expect(lastPress()).toBeNull()
})

it("setResponses turns every response off with one attribute, and back on", () => {
  setResponses("none")
  expect(html.getAttribute("data-kf-responses")).toBe("none")
  setResponses("on")
  expect(html.hasAttribute("data-kf-responses")).toBe(false)
  setResponses("none")
  setResponses(undefined)
  expect(html.hasAttribute("data-kf-responses")).toBe(false)
})

it("marks a checkbox only when its state flips, never for one that loads checked", async () => {
  setEnabled(true)
  const loaded = document.createElement("button")
  loaded.setAttribute("data-slot", "checkbox")
  loaded.setAttribute("data-checked", "")
  const box = document.createElement("button")
  box.setAttribute("data-slot", "checkbox")
  box.setAttribute("data-unchecked", "")
  document.body.append(loaded, box)
  const stop = start()
  await tick()
  expect(loaded.hasAttribute("data-kf-toggled")).toBe(false)

  box.removeAttribute("data-unchecked")
  box.setAttribute("data-checked", "")
  await tick()
  expect(box.getAttribute("data-kf-toggled")).toBe("on")

  // Radix reports the same flip through data-state.
  const radix = document.createElement("button")
  radix.setAttribute("data-slot", "radio-group-item")
  radix.setAttribute("data-state", "unchecked")
  document.body.append(radix)
  await tick()
  radix.setAttribute("data-state", "checked")
  await tick()
  expect(radix.getAttribute("data-kf-toggled")).toBe("on")

  // With responses off, a flip leaves no mark.
  setResponses("none")
  loaded.removeAttribute("data-checked")
  loaded.setAttribute("data-unchecked", "")
  await tick()
  expect(loaded.hasAttribute("data-kf-toggled")).toBe(false)
  setResponses(undefined)
  stop()
  setEnabled(false)
})
