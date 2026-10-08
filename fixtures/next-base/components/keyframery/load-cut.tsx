"use client"

/* LoadCut: a placeholder becomes real without a jump, and fast data never flashes a skeleton. */

import * as React from "react"

import { nextLoadPhase, parseHold, type LoadEvent, type LoadPhase } from "@/lib/keyframery/load"
import { easingOf, emitCut, reducedMotion, scaled } from "@/lib/keyframery/motion"
import { optedOut } from "@/lib/keyframery/state"

export type LoadCutProps = {
  loading: boolean
  skeleton: React.ReactNode
  children?: React.ReactNode
  /** How long to wait before showing the skeleton (ms). Defaults to --kf-hold (300ms). */
  hold?: number
  /** Once shown, the skeleton stays at least this long (ms), so it never flashes. */
  minShow?: number
  pace?: number
  /** "none" swaps skeleton and content without a dissolve. */
  cut?: "dissolve" | "none"
  className?: string
}


export function LoadCut({ loading, skeleton, children, hold, minShow = 400, pace, cut, className }: LoadCutProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [phase, setPhase] = React.useState<LoadPhase>(loading ? "waiting" : "content")
  const go = React.useCallback((e: LoadEvent) => setPhase((p) => nextLoadPhase(p, e)), [])
  const shownAt = React.useRef(0)
  const lastHeight = React.useRef<number | null>(null)
  const lastPhase = React.useRef<LoadPhase>(phase)

  // `loading` drives the phase. Adjusted during render, as React recommends for state that follows a prop,
  // so there is no extra commit with a stale phase.
  const [seenLoading, setSeenLoading] = React.useState(loading)
  if (seenLoading !== loading) {
    setSeenLoading(loading)
    setPhase((p) => nextLoadPhase(p, loading ? "loading" : "loaded"))
  }
  // Once the content has been on screen, a new load keeps it visible during the hold instead of a blank space.
  const [hadContent, setHadContent] = React.useState(!loading)
  if (phase === "content" && !hadContent) setHadContent(true)

  React.useEffect(() => {
    if (phase !== "waiting") return
    const ms = hold ?? parseHold(ref.current ? getComputedStyle(ref.current).getPropertyValue("--kf-hold") : null)
    const t = setTimeout(() => go("held"), ms)
    return () => clearTimeout(t)
  }, [phase, hold, go])

  React.useEffect(() => {
    if (phase !== "skeleton" || loading) return
    const t = setTimeout(() => go("shown"), Math.max(0, minShow - (performance.now() - shownAt.current)))
    return () => clearTimeout(t)
  }, [phase, loading, minShow, go])

  React.useLayoutEffect(() => {
    const el = ref.current
    const was = lastPhase.current
    lastPhase.current = phase
    if (!el) return
    const from = lastHeight.current
    const to = el.getBoundingClientRect().height
    lastHeight.current = to
    if (was === phase) return
    const off = optedOut(el) || reducedMotion()
    if (phase === "skeleton") {
      shownAt.current = performance.now()
      if (!off) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: scaled(120, el), easing: easingOf(el) })
      return
    }
    const resized = (phase === "settling" || (phase === "content" && was === "waiting")) && from !== null && Math.abs(to - from) > 1
    if (resized && !off) {
      el.animate(
        [
          { height: `${from}px`, overflow: "clip" },
          { height: `${to}px`, overflow: "clip" },
        ],
        { duration: scaled(240, el), easing: easingOf(el) },
      )
    }
    if (phase !== "settling") return
    const ms = off ? 0 : scaled(240, el)
    if (!off) {
      el.querySelector('[data-kf-load="skeleton"]')?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, easing: easingOf(el, "exit"), fill: "forwards" })
      el.querySelector('[data-kf-load="content"]')?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: easingOf(el) })
      emitCut({ cut: "dissolve", component: "load", phase: "enter", ms: Math.round(ms) })
    }
    const t = setTimeout(() => go("settled"), ms)
    return () => clearTimeout(t)
  }, [phase, go])

  const style = pace ? ({ "--kf-pace": pace } as React.CSSProperties) : undefined
  const props = {
    ref,
    "data-slot": "load-cut",
    "data-cut": cut === "none" ? "none" : undefined,
    "aria-busy": loading || undefined,
    className,
    style,
  }
  if (phase === "content") return <div {...props}>{children}</div>
  if (phase === "waiting") {
    return (
      <div {...props}>
        {hadContent ? (
          children
        ) : (
          <div aria-hidden="true" style={{ visibility: "hidden" }}>
            {skeleton}
          </div>
        )}
      </div>
    )
  }
  if (phase === "skeleton") return <div {...props}>{skeleton}</div>
  return (
    <div {...props} style={{ ...style, position: "relative" }}>
      <div data-kf-load="skeleton" aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {skeleton}
      </div>
      <div data-kf-load="content">{children}</div>
    </div>
  )
}
