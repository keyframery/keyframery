"use client"

/*
 * Director: when nobody has touched the page for a few seconds and the wall is on screen, a ghost cursor
 * plays the screens, clicking real buttons so real cuts play. Any real input stops it. Off under reduced motion.
 */

import { track } from "@vercel/analytics"
import * as React from "react"

type Step = { target?: string; type?: string; key?: string; wait: number }

const SCRIPT: Step[] = [
  { target: '[data-director="edit-profile"]', wait: 1100 },
  { target: '[data-director="save-profile"]', wait: 900 },
  { target: '[data-director="tab-analytics"]', wait: 1100 },
  { target: '[data-director="composer"]', type: "Looks good, shipping it", wait: 400 },
  { target: '[data-director="send"]', wait: 2000 },
  { target: '[data-director="mail-open-2"]', wait: 1400 },
  { target: '[data-director="mail-back"]', wait: 1000 },
  { target: '[data-director="shuffle"]', wait: 1200 },
  { target: '[data-director="charge"]', wait: 2400 },
  { target: '[data-director="notifications"]', wait: 1300 },
  { key: "Escape", wait: 1000 },
  { target: '[data-director="save-settings"]', wait: 1800 },
]

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event("input", { bubbles: true }))
}

export function Director({ active, onActiveChange, idleMs = 4000 }: { active: boolean; onActiveChange: (on: boolean) => void; idleMs?: number }) {
  const cursor = React.useRef<HTMLDivElement>(null)
  const running = React.useRef(active)
  React.useEffect(() => {
    running.current = active
  }, [active])

  // Start by itself after `idleMs` without input, while the wall is in view. Never under reduced motion, and
  // not on phones, where the wall is one long column and the loop would scroll the page far from the reader.
  React.useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(min-width: 768px)").matches) return
    const wall = document.querySelector('[data-testid="wall"]')
    let inView = true
    const io = wall ? new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0.25 }) : null
    if (wall && io) io.observe(wall)
    let timer = 0
    const arm = () => {
      clearTimeout(timer)
      timer = window.setTimeout(() => inView && onActiveChange(true), idleMs)
    }
    const stop = (e: Event) => {
      if (!e.isTrusted) return // our own synthetic clicks don't count
      if (running.current) track("director_stop")
      onActiveChange(false)
      arm()
    }
    const events = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const
    events.forEach((t) => window.addEventListener(t, stop, { passive: true, capture: true }))
    arm()
    return () => {
      clearTimeout(timer)
      io?.disconnect()
      events.forEach((t) => window.removeEventListener(t, stop, { capture: true }))
    }
  }, [idleMs, onActiveChange])

  // Play the script while active.
  React.useEffect(() => {
    if (!active) return
    let cancelled = false
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
    const run = async () => {
      for (let i = 0; !cancelled; i = (i + 1) % SCRIPT.length) {
        const step = SCRIPT[i]
        if (step.key) {
          ;(document.activeElement ?? document.body).dispatchEvent(new KeyboardEvent("keydown", { key: step.key, bubbles: true }))
          await sleep(step.wait)
          continue
        }
        const el = step.target ? (document.querySelector(step.target) as HTMLElement | null) : null
        if (!el || el.closest("[disabled]") || (el as HTMLButtonElement).disabled) {
          await sleep(200)
          continue
        }
        // Keep the target clear of the header and the docked timeline, so the click can be seen.
        const barTop = document.querySelector('[aria-label="Cut timeline"]')?.getBoundingClientRect().top ?? innerHeight
        const box = el.getBoundingClientRect()
        const below = box.bottom - (barTop - 24)
        const above = 72 - box.top
        if (below > 0 || above > 0) {
          window.scrollBy({ top: below > 0 ? below : -above, behavior: "smooth" })
          await sleep(500)
          if (cancelled) return
        }
        const r = el.getBoundingClientRect()
        const c = cursor.current
        if (c) {
          const to = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`
          await c.animate([{ translate: c.style.translate || to }, { translate: to }], { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }).finished.catch(() => {})
          c.style.translate = to
        }
        if (cancelled) return
        el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse", isPrimary: true }))
        if (step.type && el instanceof HTMLInputElement) {
          el.focus()
          setInputValue(el, step.type)
        } else el.click()
        await sleep(step.wait)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [active])

  return (
    <div ref={cursor} aria-hidden="true" data-testid="director-cursor" hidden={!active} className="pointer-events-none fixed top-0 left-0 z-[70]" style={{ translate: "50vw 50vh" }}>
      <svg width="22" height="22" viewBox="0 0 22 22" className="drop-shadow-[0_2px_4px_rgba(22,24,29,0.3)]">
        <path d="M3 2 L3 17 L7.5 13 L10.5 20 L13 19 L10 12 L16 12 Z" fill="var(--foreground)" stroke="var(--background)" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
