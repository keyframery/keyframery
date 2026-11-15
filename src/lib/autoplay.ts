"use client"

import * as React from "react"

/* One step of a demo's self-running loop. Selectors are CSS selectors, looked up inside the
   demo first and then in the whole page (popups render outside the demo). */
export type PlayStep = {
  click?: string
  hover?: string
  unhover?: string
  key?: string
  type?: string
  into?: string
  wait?: number
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function find(root: HTMLElement, selector: string) {
  return root.querySelector<HTMLElement>(selector) ?? document.querySelector<HTMLElement>(selector)
}

function pointer(el: HTMLElement, types: string[]) {
  const r = el.getBoundingClientRect()
  const init = { bubbles: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, pointerType: "mouse" }
  for (const t of types) el.dispatchEvent(t.startsWith("pointer") ? new PointerEvent(t, init) : new MouseEvent(t, init))
}

async function runStep(root: HTMLElement, step: PlayStep) {
  if (step.click) find(root, step.click)?.click()
  if (step.hover) {
    const el = find(root, step.hover)
    if (el) pointer(el, ["pointerover", "pointerenter", "mouseover", "mouseenter", "pointermove", "mousemove"])
  }
  if (step.unhover) {
    const el = find(root, step.unhover)
    if (el) pointer(el, ["pointerout", "pointerleave", "mouseout", "mouseleave"])
  }
  if (step.key) {
    const target = (document.activeElement as HTMLElement | null) ?? root
    for (const t of ["keydown", "keyup"]) target.dispatchEvent(new KeyboardEvent(t, { key: step.key, bubbles: true }))
  }
  if (step.type !== undefined && step.into) {
    const el = find(root, step.into) as HTMLInputElement | null
    if (el) {
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, step.type)
      el.dispatchEvent(new Event("input", { bubbles: true }))
    }
  }
  await sleep(step.wait ?? 900)
}

/* Set by the first real key press on the page. From then on focus rings are never hidden,
   because a keyboard user needs to see where focus is even inside a playing demo. */
let keyboardUser = false
if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    if (!e.isTrusted) return
    keyboardUser = true
    document.querySelectorAll("[data-autoplaying]").forEach((el) => el.removeAttribute("data-autoplaying"))
  }, { capture: true })
}

/* Plays a demo's steps on a loop while it is on screen. It stops while the pointer is over
   the demo, so a visitor can take over, and it is off for people who prefer reduced motion. */
export function useAutoplay(ref: React.RefObject<HTMLDivElement | null>, steps: PlayStep[] | undefined) {
  React.useEffect(() => {
    const root = ref.current
    if (!root || !steps?.length) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (new URLSearchParams(window.location.search).get("play") === "off") return
    let visible = false
    let hands = false
    let alive = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.6 })
    io.observe(root)
    /* Only a real pointer pauses the loop: the scripted hover steps dispatch pointer
       events too, and those must not count as a visitor taking over. */
    /* While the script drives the demo, its clicks and the focus that returns to a trigger
       when a popup closes look like keyboard focus to the browser, so every clicked button
       would wear a focus ring. `data-autoplaying` hides those rings (see index.css); it comes
       off the moment a real pointer or a real key press reaches the demo. */
    const driving = (on: boolean) => root.toggleAttribute("data-autoplaying", on && !keyboardUser)
    const enter = (e: Event) => {
      if (!e.isTrusted) return
      hands = true
      driving(false)
    }
    const leave = (e: Event) => {
      if (e.isTrusted) hands = false
    }
    const keyed = (e: Event) => {
      if (!e.isTrusted) return
      keyboardUser = true
      hands = true
      driving(false)
    }
    root.addEventListener("pointerenter", enter)
    root.addEventListener("pointerleave", leave)
    root.addEventListener("keydown", keyed)
    ;(async () => {
      await sleep(900)
      while (alive) {
        for (const step of steps) {
          while (alive && (!visible || hands)) await sleep(300)
          if (!alive) return
          driving(true)
          await runStep(root, step)
        }
      }
    })()
    return () => {
      alive = false
      driving(false)
      io.disconnect()
      root.removeEventListener("pointerenter", enter)
      root.removeEventListener("pointerleave", leave)
      root.removeEventListener("keydown", keyed)
    }
  }, [ref, steps])
}
