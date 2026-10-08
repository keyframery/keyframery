"use client"

/* MatchCut: a thing opens into its bigger self (card → detail), on the same page or across a route change. */

import * as React from "react"

import { playGhost, snapshot, type Snapshot } from "@/lib/keyframery/ghost"
import { easingOf, emitCut, reducedMotion, scaled, type CutPhase } from "@/lib/keyframery/motion"
import { optedOut } from "@/lib/keyframery/state"

/** A MatchCut's box when it was seen, plus where the page was scrolled then. */
type Shot = { snap: Snapshot; radius: string; t: number; scrollX: number; scrollY: number }

/** MatchCuts that just left the screen, by id. A new one with the same id grows out of it within a second. */
const departed = new Map<string, Shot>()
/** MatchCuts on screen, by id. */
const onScreen = new Map<string, Set<HTMLElement>>()

const shotOf = (el: HTMLElement): Shot => ({ snap: snapshot(el), radius: getComputedStyle(el).borderRadius, t: performance.now(), scrollX: window.scrollX, scrollY: window.scrollY })

/**
 * The last box each on-screen MatchCut was seen in, refreshed on every press (that is when a close
 * usually starts, with everything at rest). Some portals detach their whole container before the
 * MatchCuts inside them unmount, so a leaving MatchCut can't always measure itself.
 */
const lastSeen = new WeakMap<HTMLElement, Omit<Shot, "snap" | "t"> & { rect: DOMRect }>()
const remember = (el: HTMLElement) =>
  lastSeen.set(el, { rect: el.getBoundingClientRect(), radius: getComputedStyle(el).borderRadius, scrollX: window.scrollX, scrollY: window.scrollY })
let listening = false
function rememberOnPress() {
  if (listening) return
  listening = true
  const refresh = () => onScreen.forEach((els) => els.forEach((el) => el.isConnected && remember(el)))
  document.addEventListener("pointerdown", refresh, true)
  document.addEventListener("keydown", refresh, true)
}

/** A leaving MatchCut's shot: measured now if it is still on the page, otherwise from its last-seen box. */
function leavingShot(el: HTMLElement): Shot | null {
  if (el.isConnected) return shotOf(el)
  const seen = lastSeen.get(el)
  if (!seen) return null
  return { snap: { clone: snapshot(el).clone, rect: seen.rect }, radius: seen.radius, t: performance.now(), scrollX: seen.scrollX, scrollY: seen.scrollY }
}

function morph(from: Shot, to: HTMLElement, phase: CutPhase = "enter") {
  if (optedOut(to)) return
  const a = from.snap.rect
  const b = to.getBoundingClientRect()
  if (b.width < 1 || b.height < 1) return
  // Back on the very spot it left (same place in the document, e.g. remounted in place, or a sibling of
  // the card that opened): there is nothing to cut between. The morph itself uses screen positions, so
  // across a route change it still grows from where the card was last seen.
  const sx0 = from.scrollX - window.scrollX
  const sy0 = from.scrollY - window.scrollY
  const same = Math.abs(a.left + sx0 - b.left) < 1 && Math.abs(a.top + sy0 - b.top) < 1 && Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1
  if (same) return
  if (reducedMotion()) {
    to.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, easing: easingOf(to, phase) })
    emitCut({ cut: "match-cut", component: "match", phase: "enter", ms: 120 })
    return
  }
  const ms = scaled(420, to)
  // The incoming surface and its snapshot share the theme curve for a coherent morph.
  const easing = easingOf(to, phase)
  const dx = a.left - b.left
  const dy = a.top - b.top
  const sx = a.width / b.width
  const sy = a.height / b.height
  // the big version grows out of the small one's box…
  to.animate(
    [
      { transformOrigin: "0 0", transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, borderRadius: from.radius, opacity: 0.5 },
      { transformOrigin: "0 0", transform: "none", borderRadius: getComputedStyle(to).borderRadius, opacity: 1 },
    ],
    { duration: ms, easing },
  )
  // …while a copy of the small one grows into the big one's box above it. It is gone by 40% of the
  // way, before its scaled-up content would read as a blurry duplicate.
  playGhost(
    from.snap,
    [
      { transformOrigin: "0 0", transform: "none", opacity: 1 },
      { opacity: 0, offset: 0.4 },
      { transformOrigin: "0 0", transform: `translate(${-dx}px, ${-dy}px) scale(${1 / sx}, ${1 / sy})`, opacity: 0 },
    ],
    { duration: ms * 0.7, easing },
    { z: 60 },
  )
  emitCut({ cut: "match-cut", component: "match", phase: "enter", ms: Math.round(ms) })
}

export type MatchCutProps = {
  /** The same id on the small and the big version. */
  id: string
  as?: React.ElementType
  children?: React.ReactNode
  pace?: number
  cut?: "match-cut" | "none"
  className?: string
  style?: React.CSSProperties
  [prop: string]: unknown
}

export function MatchCut({ id, as: Tag = "div", children, pace, cut, style, ...rest }: MatchCutProps) {
  const ref = React.useRef<HTMLElement>(null)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const peers = onScreen.get(id) ?? new Set<HTMLElement>()
    onScreen.set(id, peers)
    const gone = departed.get(id)
    departed.delete(id)
    const peer = [...peers].find((p) => p !== el && p.isConnected)
    const from = gone && performance.now() - gone.t < 1000 ? gone : peer ? shotOf(peer) : null
    peers.add(el)
    rememberOnPress()
    remember(el)
    if (from) morph(from, el)
    return () => {
      peers.delete(el)
      if (peers.size === 0) onScreen.delete(id)
      const shot = leavingShot(el)
      if (!shot) return
      const back = [...peers].find((p) => p.isConnected)
      if (back) {
        morph(shot, back, "exit") // the big one closed while the small one is still there: cut back to it
        return
      }
      departed.set(id, shot)
      setTimeout(() => departed.get(id) === shot && departed.delete(id), 1000)
    }
  }, [id])
  return (
    <Tag
      ref={ref}
      data-slot="match-cut"
      data-match-id={id}
      data-cut={cut === "none" ? "none" : undefined}
      style={pace ? ({ ...style, "--kf-pace": pace } as React.CSSProperties) : style}
      {...rest}
    >
      {children}
    </Tag>
  )
}
