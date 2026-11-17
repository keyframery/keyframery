import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"
import ts from "typescript"

const { outputText } = ts.transpileModule(fs.readFileSync(new URL("../../src/lib/autoplay.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})

function fixture({ reduced = false, search = "" } = {}) {
  let now = 0
  let nextTimer = 0
  const timers = new Map()
  const refs = []
  const effects = []
  const observers = []
  let hook = 0
  class Target {
    listeners = new Map()
    attributes = new Map()
    clientWidth = 700
    targets = new Map()
    clicks = 0
    addEventListener(type, callback) {
      const listeners = this.listeners.get(type) ?? new Set()
      listeners.add(callback)
      this.listeners.set(type, listeners)
    }
    removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback) }
    emit(type, event = {}) { for (const callback of [...(this.listeners.get(type) ?? [])]) callback({ type, target: this, isTrusted: true, ...event }) }
    setAttribute(name, value) { this.attributes.set(name, value) }
    removeAttribute(name) { this.attributes.delete(name) }
    toggleAttribute(name, force) { if (force) this.setAttribute(name, ""); else this.removeAttribute(name) }
    getAttribute(name) { return this.attributes.get(name) ?? null }
    hasAttribute(name) { return this.attributes.has(name) }
    querySelector(selector) { return this.targets.get(selector) ?? null }
    querySelectorAll() { return this.hasAttribute("data-autoplaying") ? [this] : [] }
    contains(target) { return target === this || [...this.targets.values()].includes(target) }
    getBoundingClientRect() { return { left: 0, top: 0, width: this.clientWidth, height: 400 } }
    click() { this.clicks++; this.emit("click", { isTrusted: false }) }
    dispatchEvent(event) { this.emit(event.type, event); return true }
  }
  class FakeEvent { constructor(type, options) { this.type = type; this.isTrusted = false; Object.assign(this, options) } }
  class FakeInput extends Target {}
  const root = new Target()
  const first = new Target()
  const second = new Target()
  root.targets.set(".first", first)
  root.targets.set(".second", second)
  const document = new Target()
  document.activeElement = root
  document.querySelector = (selector) => root.querySelector(selector)
  document.querySelectorAll = () => root.querySelectorAll()
  const window = new Target()
  window.matchMedia = () => ({ matches: reduced })
  window.location = { search }
  const React = {
    useRef(value) { const index = hook++; return refs[index] ??= { current: value } },
    useEffect(effect, deps) {
      const index = hook++
      const previous = effects[index]
      if (previous && deps.every((value, i) => Object.is(value, previous.deps[i]))) return
      previous?.cleanup?.()
      effects[index] = { deps, cleanup: effect() }
    },
  }
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; this.connected = true; observers.push(this) }
    observe() {}
    disconnect() { this.connected = false }
  }
  const setTimeout = (callback, delay) => { const id = ++nextTimer; timers.set(id, { at: now + delay, callback }); return id }
  const clearTimeout = (id) => timers.delete(id)
  const module = { exports: {} }
  new Function("exports", "require", "window", "document", "IntersectionObserver", "setTimeout", "clearTimeout", "PointerEvent", "MouseEvent", "KeyboardEvent", "Event", "HTMLInputElement", "HTMLTextAreaElement", outputText)(
    module.exports, () => React, window, document, IntersectionObserver, setTimeout, clearTimeout, FakeEvent, FakeEvent, FakeEvent, FakeEvent, FakeInput, FakeInput,
  )
  const ref = { current: root }
  const steps = [{ click: ".first", wait: 100 }, { click: ".second", wait: 100 }]
  const render = (token = 0, nextSteps = steps) => { hook = 0; module.exports.useAutoplay(ref, nextSteps, token) }
  const advance = async (duration) => {
    const until = now + duration
    for (let count = 0; count < 1000; count++) {
      await Promise.resolve()
      const next = [...timers].filter(([, timer]) => timer.at <= until).sort((a, b) => a[1].at - b[1].at)[0]
      if (!next) { now = until; await Promise.resolve(); return }
      timers.delete(next[0]); now = next[1].at; next[1].callback()
    }
    throw new Error("Playback scheduled an unbounded timer loop")
  }
  const visible = (ratio = 1) => { for (const observer of observers) if (observer.connected) observer.callback([{ isIntersecting: ratio > 0, intersectionRatio: ratio }]) }
  const unmount = () => { for (const effect of effects) effect?.cleanup?.() }
  return { root, first, second, window, document, render, visible, advance, timers, observers, steps, unmount }
}

test("one visible pass completes and never restarts on later visibility", async () => {
  const f = fixture(); f.render(); f.visible(0.4); await f.advance(2000)
  assert.equal(f.first.clicks, 0)
  f.visible(0.6); await f.advance(1100)
  assert.equal(f.first.clicks, 1); assert.equal(f.second.clicks, 1)
  assert.equal(f.root.getAttribute("data-playback"), "complete")
  assert.equal(f.root.hasAttribute("data-autoplaying"), false)
  f.visible(0); f.visible(1); await f.advance(5000)
  assert.equal(f.first.clicks, 1); assert.equal(f.timers.size, 0)
})

test("a real pointer takeover cancels the rest of the pass permanently", async () => {
  const f = fixture(); f.render(); f.visible(); await f.advance(900)
  assert.equal(f.first.clicks, 1)
  f.root.emit("pointerenter"); f.root.emit("pointerleave"); await f.advance(3000)
  assert.equal(f.second.clicks, 0)
  assert.equal(f.root.getAttribute("data-playback"), "stopped")
  assert.equal(f.root.hasAttribute("data-autoplaying"), false)
  assert.equal(f.timers.size, 0)
})

test("scripted pointer events do not cancel playback; real popup keyboard input does", async () => {
  const f = fixture(); f.render(); f.visible(); await f.advance(900)
  f.root.emit("pointerenter", { isTrusted: false })
  f.document.emit("pointerdown", { isTrusted: false })
  assert.equal(f.root.getAttribute("data-playback"), "playing")
  f.document.emit("keydown", { target: {} }); await f.advance(1000)
  assert.equal(f.second.clicks, 0)
  assert.equal(f.root.getAttribute("data-playback"), "stopped")
})

test("explicit replay cancels the previous pass and re-arms exactly once", async () => {
  const f = fixture(); f.render(); f.visible(); await f.advance(900)
  f.render(1); f.visible(); await f.advance(1200)
  assert.equal(f.first.clicks, 2); assert.equal(f.second.clicks, 1)
  assert.equal(f.root.getAttribute("data-playback"), "complete")
  f.render(1, [...f.steps]); f.visible(); await f.advance(3000)
  assert.equal(f.first.clicks, 2)
  f.render(2); f.visible(); await f.advance(1200)
  assert.equal(f.first.clicks, 3); assert.equal(f.second.clicks, 2)
})

test("customization rerenders do not interrupt or restart the active pass", async () => {
  const f = fixture(); f.render(); f.visible(); await f.advance(900)
  f.render(0, [...f.steps]); await f.advance(200)
  assert.equal(f.first.clicks, 1); assert.equal(f.second.clicks, 1)
  assert.equal(f.root.getAttribute("data-playback"), "complete")
})

for (const option of [{ reduced: true }, { search: "?play=off" }]) test(`automatic opt-out ${JSON.stringify(option)} still permits explicit replay`, async () => {
  const f = fixture(option); f.render(); f.visible(); await f.advance(2000)
  assert.equal(f.first.clicks, 0); assert.equal(f.timers.size, 0)
  f.render(1); f.visible(); await f.advance(1200)
  assert.equal(f.first.clicks, 1); assert.equal(f.second.clicks, 1)
  assert.equal(f.root.getAttribute("data-playback"), "complete")
})

test("leaving the viewport pauses the same pass instead of replaying its first step", async () => {
  const f = fixture(); f.render(); f.visible(); await f.advance(900)
  f.visible(0); await f.advance(1000)
  assert.equal(f.second.clicks, 0)
  f.visible(); await f.advance(100)
  assert.equal(f.first.clicks, 1); assert.equal(f.second.clicks, 1)
  assert.equal(f.root.getAttribute("data-playback"), "complete")
})

test("unmount clears delayed work, observers, and instance event listeners", async () => {
  const f = fixture(); f.render(); f.visible(); f.unmount(); await f.advance(3000)
  assert.equal(f.first.clicks, 0); assert.equal(f.timers.size, 0)
  assert.ok(f.observers.every((observer) => !observer.connected))
  assert.equal([...f.root.listeners.values()].reduce((sum, set) => sum + set.size, 0), 0)
  assert.equal([...f.document.listeners.values()].reduce((sum, set) => sum + set.size, 0), 0)
})
