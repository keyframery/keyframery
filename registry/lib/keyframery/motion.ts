/** Timing, easing, pace, reduced motion, and the keyframery:cut event. Keep in step with keyframery.css. */

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

const EASING = { enter: "cubic-bezier(0.22, 1, 0.36, 1)", exit: "cubic-bezier(0.5, 0, 0.75, 0)" }

function validEasing(value: string): boolean {
  // CSS accepts global keywords and comma-separated animation lists; WAAPI needs one easing.
  if (!value || /^(inherit|initial|unset|revert|revert-layer)$/i.test(value) || /\b(var|env)\(/i.test(value)) return false
  let depth = 0
  for (const char of value) {
    if (char === "(") depth++
    else if (char === ")") depth--
    else if (char === "," && depth === 0) return false
  }
  return typeof CSS !== "undefined" && CSS.supports("animation-timing-function", value)
}

/** Resolve a scoped theme curve, without letting invalid custom properties throw in animate(). */
export function easingOf(el: Element, phase: CutPhase = "enter", fallback = EASING[phase]): string {
  const value = getComputedStyle(el).getPropertyValue(phase === "exit" ? "--kf-ease-exit" : "--kf-ease").trim()
  return validEasing(value) ? value : validEasing(fallback) ? fallback : EASING[phase]
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
