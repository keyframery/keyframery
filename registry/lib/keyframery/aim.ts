/** Points a cut at the element that started it, and carries that element's settings onto portaled content. */

import type { Press } from "./press"

export type RectLike = { left: number; top: number; width: number; height: number }

export const KF_VARS = ["--kf-pace", "--kf-ease", "--kf-ease-exit", "--kf-travel", "--kf-blur", "--kf-depth", "--kf-hold"] as const

export function centerOf(r: RectLike) {
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

/** Vector from the centre of `to` to the centre of `from`, in px. */
export function offsetBetween(from: RectLike, to: RectLike) {
  const a = centerOf(from)
  const b = centerOf(to)
  const round = (n: number) => Math.round(n * 100) / 100
  return { dx: round(a.x - b.x), dy: round(a.y - b.y) }
}

/**
 * The element's resting box: an enter animation's first frame is transformed, so measure with every
 * animation seeked to its end, then put each one back exactly. Nothing is cancelled or restarted, so the
 * libraries that watch these animations (Radix Presence, Base UI's finished promises) never notice.
 */
export function restingRect(el: HTMLElement): DOMRect {
  const saved = el.getAnimations().map((a) => ({ a, t: a.currentTime, state: a.playState }))
  for (const { a } of saved) {
    a.pause()
    a.currentTime = Number(a.effect?.getComputedTiming().endTime ?? 0)
  }
  const rect = el.getBoundingClientRect()
  for (const { a, t, state } of saved) {
    a.currentTime = t ?? 0
    if (state === "finished") a.finish()
    else if (state !== "paused") a.play()
  }
  return rect
}

/** Writes --kf-dx/--kf-dy so the CSS cut starts toward the opener. No opener (or data-cut-origin) = from the centre. */
export function aimAt(el: HTMLElement, opener: Press | null, atRest: boolean): void {
  if (!opener || el.hasAttribute("data-cut-origin")) {
    el.style.setProperty("--kf-dx", "0px")
    el.style.setProperty("--kf-dy", "0px")
    return
  }
  const from = opener.el.isConnected ? opener.el.getBoundingClientRect() : opener.rect
  const to = atRest ? restingRect(el) : el.getBoundingClientRect()
  const { dx, dy } = offsetBetween(from, to)
  el.style.setProperty("--kf-dx", `${dx}px`)
  el.style.setProperty("--kf-dy", `${dy}px`)
}

/**
 * Portaled content renders at the end of <body>, outside the section it was opened from.
 * Copy the opener's opt-out and its --kf-* values onto it, only where they differ.
 * Named cuts are never carried: a tabs cut means nothing to a dialog.
 */
export function carrySettings(content: HTMLElement, opener: Element | null): void {
  if (!opener || content.contains(opener)) return
  if (!content.hasAttribute("data-cut") && opener.closest('[data-cut="none"]')) content.setAttribute("data-cut", "none")
  const from = getComputedStyle(opener)
  const here = getComputedStyle(content)
  for (const name of KF_VARS) {
    const value = from.getPropertyValue(name).trim()
    if (value && value !== here.getPropertyValue(name).trim()) content.style.setProperty(name, value)
  }
}

/** A per-dialog choice also applies to its backdrop, which renders as an earlier sibling. */
export function mirrorCut(content: HTMLElement, overlaySelector: string): void {
  const value = content.getAttribute("data-cut")
  if (!value) return
  let node = content.previousElementSibling
  while (node && !node.matches(overlaySelector)) node = node.previousElementSibling
  const overlay = node ?? content.parentElement?.querySelector(overlaySelector) ?? null
  if (overlay && !overlay.hasAttribute("data-cut")) overlay.setAttribute("data-cut", value)
}
