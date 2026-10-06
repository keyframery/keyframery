/** Timing, pace, reduced motion, and the keyframery:cut event. Keep in step with keyframery.css. */

export const DURATIONS = {
  "rack-focus": { enter: 340, exit: 220 },
  "punch-in": { enter: 260, exit: 160 },
  fade: { enter: 200, exit: 150 },
  "slide-sink": { enter: 460, exit: 260 },
  slide: { enter: 460, exit: 260 },
  tuned: { enter: 180, exit: 180 },
  "cut-on-action": { enter: 480, exit: 0 },
} as const

export const REDUCED_MS = 120

export type CutPhase = "enter" | "exit"
export type CutEventDetail = { cut: string; component: string; phase: CutPhase; ms: number }

export function parsePace(raw: string | null | undefined): number {
  const n = Number.parseFloat(raw ?? "")
  return Number.isFinite(n) && n > 0 ? n : 1
}

export function paceOf(el: Element): number {
  return parsePace(getComputedStyle(el).getPropertyValue("--kf-pace"))
}

export function reducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** A base duration for this element: × its pace, or capped to a short fade under reduced motion. */
export function scaled(baseMs: number, el: Element): number {
  return reducedMotion() ? Math.min(baseMs, REDUCED_MS) : baseMs * paceOf(el)
}

export function emitCut(detail: CutEventDetail): void {
  document.dispatchEvent(new CustomEvent<CutEventDetail>("keyframery:cut", { detail }))
}
