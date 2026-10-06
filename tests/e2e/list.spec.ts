import type { Page } from "@playwright/test"

import { expect, leftovers, meta, takeEvents, takeGhosts, test } from "./kit"

const listCuts = async (page: Page) => (await takeEvents(page)).filter((e) => e.component === "list").map((e) => e.cut)
const texts = (page: Page) => page.evaluate(() => [...document.querySelectorAll('[data-testid="list"] > [data-slot="list-cut-item"]')].map((li) => li.querySelector("span")!.textContent))

test("a sent message flies from the Send button into the list", async ({ page, errors }, info) => {
  const reduced = meta(info).motion === "reduced"
  await page.goto("/helpers")
  await page.getByTestId("composer").fill("Hello")
  // press Send and read the new item's first keyframe in the same page turn
  const flight = await page.evaluate(async () => {
    const send = document.querySelector('[data-testid="send"]') as HTMLElement
    send.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse", isPrimary: true }))
    send.click()
    await new Promise((r) => setTimeout(r, 0))
    const item = document.querySelector('[data-testid="msg-4"]') as HTMLElement
    const anim = item.getAnimations()[0]
    if (!anim) return null
    const first = (anim.effect as KeyframeEffect).getKeyframes()[0] as Record<string, string>
    anim.finish()
    const r = item.getBoundingClientRect()
    const s = send.getBoundingClientRect()
    return { translate: first.translate ?? null, expected: [s.left + s.width / 2 - (r.left + r.width / 2), s.top + s.height / 2 - (r.top + r.height / 2)] }
  })
  expect(flight).not.toBeNull()
  if (reduced) expect(flight!.translate).toBeNull()
  else {
    const [dx, dy] = flight!.translate!.split(" ").map(parseFloat)
    expect(Math.abs(dx - flight!.expected[0])).toBeLessThanOrEqual(2)
    expect(Math.abs(dy - flight!.expected[1])).toBeLessThanOrEqual(2)
  }
  expect(await listCuts(page)).toEqual([reduced ? "fade" : "cut-on-action"])
  expect(errors).toEqual([])
})

test("a deleted item leaves on its own ghost and the rest glide up", async ({ page }, info) => {
  const reduced = meta(info).motion === "reduced"
  await page.goto("/helpers")
  await takeGhosts(page)
  await page.getByTestId("del-2").click()
  const ghosts = await takeGhosts(page)
  expect(ghosts).toEqual(reduced ? [] : [{ slot: "list-cut-item", aria: "true", inert: true, host: "list-cut" }])
  await expect.poll(() => leftovers(page)).toBe(0)
  expect(await texts(page)).toEqual(["Hey!", "Yes, see you there."])
  expect(await listCuts(page)).toEqual(reduced ? [] : ["l-cut", "glide"])
  expect(await page.evaluate(() => (document.querySelector('[data-testid="list"]') as HTMLElement).style.position)).toBe("")
})

test("reversing twice glides from where each item visibly is", async ({ page, errors }, info) => {
  test.skip(meta(info).motion === "reduced")
  await page.goto("/helpers")
  const jumps = await page.evaluate(async () => {
    const list = document.querySelector('[data-testid="list"]')!
    const btn = document.querySelector('[data-testid="shuffle"]') as HTMLElement
    btn.click()
    await new Promise((r) => setTimeout(r, 120)) // mid-glide…
    const mid = [...list.children].map((c) => c.getBoundingClientRect().top)
    btn.click() // …reverse again
    await new Promise((r) => setTimeout(r, 0))
    const after = [...list.children].map((c) => c.getBoundingClientRect().top)
    // every item must start its new glide where it visibly was, not snap to its new slot first
    return mid.map((y, i) => Math.round(Math.abs(y - after[mid.length - 1 - i])))
  })
  for (const j of jumps) expect(j).toBeLessThanOrEqual(2)
  await expect.poll(() => leftovers(page)).toBe(0)
  expect(await texts(page)).toEqual(["Hey!", "Are we still on for 3pm?", "Yes, see you there."])
  expect(errors).toEqual([])
})

test("an item added by code (no press) rises in", async ({ page }, info) => {
  await page.goto("/helpers")
  await page.getByTestId("add-later").click()
  await expect(page.getByTestId("msg-4")).toBeVisible({ timeout: 4000 })
  const seen: string[] = []
  await expect.poll(async () => (seen.push(...(await listCuts(page))), seen)).toEqual([meta(info).motion === "reduced" ? "fade" : "rise"])
})

test("a deleted table row keeps its column widths while it leaves", async ({ page }, info) => {
  test.skip(meta(info).motion === "reduced")
  await page.goto("/helpers")
  const widths = await page.evaluate(async () => {
    const row = document.querySelector('[data-testid="row-2"]')!
    const before = [...row.children].map((c) => Math.round(c.getBoundingClientRect().width))
    ;(document.querySelector('[data-testid="row-del-2"]') as HTMLElement).click()
    await new Promise((r) => setTimeout(r, 0))
    const ghost = document.querySelector("table[data-kf-ghost] tr")
    return { before, ghost: ghost ? [...ghost.children].map((c) => Math.round(c.getBoundingClientRect().width)) : null }
  })
  expect(widths.ghost).not.toBeNull()
  widths.before.forEach((w, i) => expect(Math.abs(w - widths.ghost![i])).toBeLessThanOrEqual(2))
  await expect.poll(() => leftovers(page)).toBe(0)
})

test("re-sorting 500 rows stays under 50 ms of ListCut work", async ({ page }, info) => {
  test.skip(meta(info).motion === "reduced" || meta(info).browser !== "chromium")
  await page.addInitScript(() => ((globalThis as { __kfListPerf?: number[] }).__kfListPerf = []))
  await page.goto("/list-perf")
  await page.getByTestId("perf-reverse").click()
  await expect.poll(() => page.evaluate(() => (globalThis as { __kfListPerf?: number[] }).__kfListPerf!.length)).toBeGreaterThan(0)
  const ms = await page.evaluate(() => Math.max(...(globalThis as { __kfListPerf?: number[] }).__kfListPerf!))
  console.log(`ListCut: ${ms.toFixed(1)} ms for a 500-row reverse`)
  expect(ms).toBeLessThan(50)
})
