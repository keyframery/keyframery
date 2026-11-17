"use client"

import * as React from "react"

/* One step of a demo's self-running sequence. Selectors are CSS selectors, looked up inside the
   demo first and then in the whole page (popups render outside the demo). */
export type PlayStep = {
  click?: string
  hover?: string
  unhover?: string
  key?: string
  type?: string
  into?: string
  wait?: number
  /** Run this step only at one size: a demo's narrow (phone) layout can need its own steps. */
  only?: "wide" | "narrow"
}

/* Below this the demo is showing its phone layout. */
const NARROW = 520

function find(root: HTMLElement, selector: string) {
  return root.querySelector<HTMLElement>(selector) ?? document.querySelector<HTMLElement>(selector)
}

function pointer(el: HTMLElement, types: string[]) {
  const r = el.getBoundingClientRect()
  const init = { bubbles: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, pointerType: "mouse" }
  for (const t of types) el.dispatchEvent(t.startsWith("pointer") ? new PointerEvent(t, init) : new MouseEvent(t, init))
}

function runStep(root: HTMLElement, step: PlayStep) {
  if (step.only && (root.clientWidth < NARROW ? "narrow" : "wide") !== step.only) return false
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
  return true
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

/* Plays once on first view. Changing replayToken explicitly starts a fresh pass, including for
   reduced motion or ?play=off; normal renders, resizes and new step-array identities do not.
   Real interaction ends automatic control permanently until the visitor asks for a replay. */
export function useAutoplay(ref: React.RefObject<HTMLDivElement | null>, steps: PlayStep[] | undefined, replayToken = 0) {
  const latestSteps = React.useRef(steps)
  latestSteps.current = steps
  const hasSteps = Boolean(steps?.length)

  React.useEffect(() => {
    const root = ref.current
    const script = latestSteps.current
    if (!root) return
    root.setAttribute("data-playback", "idle")
    root.removeAttribute("data-autoplaying")
    if (!script?.length) return
    const manual = replayToken > 0
    if (!manual && (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      new URLSearchParams(window.location.search).get("play") === "off")) return

    let visible = manual
    let started = false
    let finished = false
    let disposed = false
    let waitingForView = false
    let index = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    /* While the script drives the demo, its clicks and the focus that returns to a trigger
       when a popup closes look like keyboard focus to the browser, so every clicked button
       would wear a focus ring. `data-autoplaying` hides those rings (see index.css); it comes
       off the moment a real pointer or a real key press reaches the demo. */
    const driving = (on: boolean) => root.toggleAttribute("data-autoplaying", on && !keyboardUser)
    const clear = () => {
      if (timer !== undefined) clearTimeout(timer)
      timer = undefined
      driving(false)
      io.disconnect()
      root.removeEventListener("pointerenter", used)
      document.removeEventListener("pointerdown", used, true)
      document.removeEventListener("keydown", used, true)
    }
    const finish = (state: "complete" | "stopped") => {
      finished = true
      root.setAttribute("data-playback", state)
      clear()
    }
    const used = (event: Event) => {
      if (!event.isTrusted || (!started && !root.contains(event.target as Node))) return
      if (event.type === "keydown") keyboardUser = true
      // Listen on the document as well: a demo's popup can live outside its frame.
      finish("stopped")
    }
    const advance = () => {
      timer = undefined
      if (disposed || finished) return
      if (index === script.length) {
        finish("complete")
        return
      }
      if (!visible) {
        waitingForView = true
        driving(false)
        return
      }
      waitingForView = false
      root.setAttribute("data-playback", "playing")
      driving(true)
      while (index < script.length) {
        const step = script[index++]
        if (runStep(root, step)) {
          timer = setTimeout(advance, step.wait ?? 900)
          return
        }
      }
      finish("complete")
    }
    const start = () => {
      if (started || finished || disposed) return
      started = true
      timer = setTimeout(advance, manual ? 0 : 900)
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && (manual || entry.intersectionRatio >= 0.6)
      if (!visible) driving(false)
      else if (waitingForView) advance()
      else start()
    }, { threshold: [0, 0.6] })

    root.addEventListener("pointerenter", used)
    document.addEventListener("pointerdown", used, true)
    document.addEventListener("keydown", used, true)
    io.observe(root)
    if (manual) start()
    return () => {
      disposed = true
      clear()
    }
  }, [ref, hasSteps, replayToken])
}
