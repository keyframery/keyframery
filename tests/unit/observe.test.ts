import { expect, it, vi } from "vitest"

import { observe } from "../../registry/lib/keyframery/observe"

const tick = () => new Promise((r) => setTimeout(r, 0))

function part(id: string, slot = "x") {
  const d = document.createElement("div")
  d.id = id
  d.setAttribute("data-slot", slot)
  return d
}

it("hands added, changed and removed elements to the adapter that matches them, then flushes", async () => {
  const log: string[] = []
  const stop = observe(document.body, [
    {
      match: '[data-slot="x"]',
      added: (el) => log.push(`add:${el.id}`),
      changed: (el, a) => log.push(`chg:${el.id}:${a}`),
      removed: (el) => log.push(`rm:${el.id}`),
      flush: () => log.push("flush"),
    },
  ])
  const x = part("a")
  document.body.append(x)
  await tick()
  x.setAttribute("data-state", "open")
  await tick()
  x.remove()
  await tick()
  stop()
  expect(log).toEqual(["add:a", "flush", "chg:a:data-state", "flush", "rm:a", "flush"])
})

it("ignores ghosts and everything inside them", async () => {
  const log: string[] = []
  const stop = observe(document.body, [{ match: '[data-slot="x"]', added: (el) => log.push(el.id) }])
  const ghost = document.createElement("div")
  ghost.setAttribute("data-kf-ghost", "")
  ghost.append(part("inside"))
  document.body.append(ghost)
  await tick()
  stop()
  expect(log).toEqual([])
})

it("keeps going when one adapter throws", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  const log: string[] = []
  const stop = observe(document.body, [
    { match: '[data-slot="x"]', added: () => { throw new Error("boom") } },
    { match: '[data-slot="x"]', added: (el) => log.push(el.id) },
  ])
  document.body.append(part("b"))
  await tick()
  stop()
  expect(log).toEqual(["b"])
  expect(warn).toHaveBeenCalled()
  warn.mockRestore()
})
