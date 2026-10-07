"use client"

/*
 * The hero: the same Team app twice. The left copy sits under data-cut="none", so it moves exactly like
 * stock shadcn; the right one has Keyframery. While it is on screen and nobody has touched it, a cursor
 * clicks through both copies at once. A click, key or keyboard focus inside it hands control to the visitor
 * (not a touch that turns into a scroll), and the Pause/Play button below it stops and restarts it.
 * ?demo=off keeps the cursor from starting by itself (the tests use it).
 */

import { track } from "@vercel/analytics"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { TeamApp } from "./team-app"
import { nextStep, useTeamDemo, type Side } from "./team-demo"

const SIDES: Side[] = ["stock", "kf"]
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const press = (el: Element | null | undefined) =>
  el?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, pointerType: "mouse", isPrimary: true }))

const subscribeMotion = (notify: () => void) => {
  const q = matchMedia("(prefers-reduced-motion: reduce)")
  q.addEventListener("change", notify)
  return () => q.removeEventListener("change", notify)
}
const noSubscribe = () => () => {}

/**
 * May the demo start by itself? Not under reduced motion, and not with ?demo=off. The server assumes yes, so
 * the Pause button is in the server HTML for most visitors instead of appearing after hydration.
 */
function useAutoplayAllowed() {
  const reduced = React.useSyncExternalStore(subscribeMotion, () => matchMedia("(prefers-reduced-motion: reduce)").matches, () => false)
  const off = React.useSyncExternalStore(noSubscribe, () => new URLSearchParams(location.search).get("demo") === "off", () => false)
  return !reduced && !off
}

/** Moves a cursor to the centre of `target`, in its window's coordinates. */
async function glide(cursor: HTMLElement | null, target: HTMLElement | null) {
  const win = cursor?.parentElement
  if (!cursor || !win || !target) return
  const w = win.getBoundingClientRect()
  if (!w.width) return // the copy hidden on phones
  const r = target.getBoundingClientRect()
  const to = `${Math.round(r.left - w.left + r.width / 2)}px ${Math.round(r.top - w.top + r.height / 2)}px`
  const from = cursor.style.translate || to
  cursor.style.translate = to
  await cursor.animate([{ translate: from }, { translate: to }], { duration: 620, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }).finished.catch(() => {})
}

function restAt(cursor: HTMLElement | null) {
  const win = cursor?.parentElement
  if (!cursor || !win || cursor.style.translate) return
  cursor.style.translate = `${Math.round(win.clientWidth * 0.7)}px ${Math.round(win.clientHeight * 0.84)}px`
}

const ripple = (cursor: HTMLElement | null) =>
  cursor?.querySelector("[data-ring]")?.animate([{ scale: 0.4, opacity: 0.8 }, { scale: 1.7, opacity: 0 }], { duration: 480, easing: "cubic-bezier(0.22, 1, 0.36, 1)" })

export function BeforeAfter() {
  const demo = useTeamDemo()
  const stage = React.useRef<HTMLDivElement>(null)
  const stockRoot = React.useRef<HTMLElement>(null)
  const kfRoot = React.useRef<HTMLElement>(null)
  const stockCursor = React.useRef<HTMLDivElement>(null)
  const kfCursor = React.useRef<HTMLDivElement>(null)

  const autoplay = useAutoplayAllowed()
  // null: the default (autoplay when allowed); false: the visitor took over; true: they pressed Play.
  const [choice, setChoice] = React.useState<boolean | null>(null)
  const allowed = choice ?? autoplay
  const [inView, setInView] = React.useState(false)
  const [placed, setPlaced] = React.useState(false)
  const running = allowed && inView
  // On phones one copy shows at a time. The demo flips between them after each loop until someone picks.
  const [shown, setShown] = React.useState<Side>("kf")
  const picked = React.useRef(false)

  const latest = React.useRef(demo.state)
  React.useEffect(() => {
    latest.current = demo.state
  })
  const own = React.useRef(false) // true while the demo itself is pressing
  const tookOver = React.useRef(false)
  const sawActivity = React.useRef(false)

  React.useEffect(() => {
    const el = stage.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // A press on the stock copy is also pressed on the Keyframery copy's twin, so its cut starts from its own
  // button. This listens in the capture phase on the stage, which runs after <Cuts /> has recorded the real
  // press on document, and before the click that follows. A press alone doesn't take over: on a phone it may
  // turn into a scroll. A click, a key or keyboard focus inside the stage does.
  React.useEffect(() => {
    const el = stage.current
    if (!el) return
    const mirror = (e: Event) => {
      if (own.current) return
      if (e instanceof KeyboardEvent && e.key !== "Enter" && e.key !== " ") return
      const hero = e.target instanceof Element ? e.target.closest("[data-hero]") : null
      if (!hero || !stockRoot.current?.contains(hero)) return
      own.current = true
      press(kfRoot.current?.querySelector(`[data-hero="${hero.getAttribute("data-hero")}"]`))
      own.current = false
    }
    const takeOver = () => {
      if (own.current) return
      if (!tookOver.current) track("hero_take_over")
      tookOver.current = true
      setChoice(false)
    }
    el.addEventListener("pointerdown", mirror, true)
    el.addEventListener("keydown", mirror, true)
    el.addEventListener("click", takeOver, true)
    el.addEventListener("keydown", takeOver, true)
    el.addEventListener("focusin", takeOver, true)
    el.setAttribute("data-ready", "") // hydrated and listening (the tests wait for it)
    return () => {
      el.removeEventListener("pointerdown", mirror, true)
      el.removeEventListener("keydown", mirror, true)
      el.removeEventListener("click", takeOver, true)
      el.removeEventListener("keydown", takeOver, true)
      el.removeEventListener("focusin", takeOver, true)
      el.removeAttribute("data-ready")
    }
  }, [])

  const actions = demo.actions
  React.useEffect(() => {
    if (!running) return
    let cancelled = false
    const run = async () => {
      await sleep(300)
      if (cancelled) return
      restAt(stockCursor.current)
      restAt(kfCursor.current)
      setPlaced(true)
      await sleep(600)
      while (!cancelled) {
        const step = nextStep(latest.current, sawActivity.current)
        const find = (root: HTMLElement | null) => root?.querySelector<HTMLElement>(`[data-hero="${step.target}"]`) ?? null
        const targets = [find(stockRoot.current), find(kfRoot.current)]
        if (!targets[1] || (targets[1] as HTMLButtonElement).disabled) {
          await sleep(400)
          continue
        }
        await Promise.all([glide(stockCursor.current, targets[0]), glide(kfCursor.current, targets[1])])
        if (cancelled) return
        // Stock first, Keyframery last: the last press is where a cut starts.
        own.current = true
        targets.forEach(press)
        own.current = false
        ripple(stockCursor.current)
        ripple(kfCursor.current)
        if (step.target === "tab-activity") sawActivity.current = true
        if (step.target.startsWith("remove-")) sawActivity.current = false
        step.act(actions)
        await sleep(step.wait)
        if (cancelled) return
        if (step.target.startsWith("remove-") && !picked.current && matchMedia("(max-width: 767px)").matches) setShown((s) => (s === "kf" ? "stock" : "kf"))
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [running, actions])

  const cursorShown = running && placed

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pt-10 md:pt-14">
      <div role="group" aria-label="Compare" className="mb-3 flex justify-center md:hidden">
        <div className="inline-flex rounded-lg border bg-card p-0.5">
          {SIDES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={shown === s}
              onClick={() => {
                picked.current = true
                setShown(s)
              }}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:bg-foreground aria-pressed:text-background"
            >
              {s === "stock" ? "shadcn/ui" : "With Keyframery"}
            </button>
          ))}
        </div>
      </div>
      <div data-testid="hero-stage" ref={stage} className="stage-grid grid gap-x-6 gap-y-5 rounded-2xl border p-3 sm:p-5 md:grid-cols-2 md:p-8">
        {SIDES.map((s) => (
          <section
            key={s}
            ref={s === "stock" ? stockRoot : kfRoot}
            data-side={s}
            data-cut={s === "stock" ? "none" : undefined}
            aria-label={s === "stock" ? "shadcn/ui as it ships" : "shadcn/ui with Keyframery"}
            className={cn("min-w-0", shown !== s && "max-md:hidden")}
          >
            <p className="mb-3 flex items-center gap-2 px-0.5 text-sm max-md:hidden">
              <span aria-hidden="true" className={cn("size-2 rounded-full", s === "kf" ? "bg-cut" : "bg-muted-foreground/35")} />
              <span className="font-medium">shadcn/ui</span>
              {s === "kf" ? <span className="text-cut">with Keyframery</span> : <span className="text-muted-foreground">as it ships</span>}
            </p>
            <TeamApp side={s} demo={demo} cursorRef={s === "stock" ? stockCursor : kfCursor} cursorShown={cursorShown} />
          </section>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-sm text-muted-foreground">
        <p>
          Same app, same clicks. Only one of them has <code className="font-mono text-[13px] text-foreground">{"<Cuts />"}</code> in its layout.
        </p>
        {/* One button for both states, so focus stays on it; the same label renders on the server for most visitors. */}
        <Button variant="outline" size="sm" onClick={() => setChoice(!allowed)}>
          {allowed ? "Pause demo" : "Play demo"}
        </Button>
      </div>
    </div>
  )
}
