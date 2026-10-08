/** Toggles: marks a control for a moment when its own state flips, so the CSS can draw the tick or grow
 *  the dot. Controls that load or mount already checked are never marked, so nothing redraws on page load
 *  or on a route change. */

import { emitCut, scaled } from "../motion"
import type { Adapter } from "../observe"
import { optedOut } from "../state"

export const TOGGLE_SLOTS = ["checkbox", "radio-group-item", "switch", "questionnaire-choice"] as const

const TOGGLES = TOGGLE_SLOTS.map((s) => `[data-slot="${s}"]`).join(",")
// Base UI sets data-checked / data-unchecked; Radix sets data-state.
const ON = '[data-checked]:not([data-checked="false"]),[data-state="checked"]'
const STATE_ATTRIBUTES = new Set(["data-checked", "data-unchecked", "data-state"])
// How long the mark stays after the response: long enough for a slowed-down pace to finish.
const HOLD_MS = 250

/** True while <Cuts responses="none" /> is set. */
export const responsesOff = () => document.documentElement.getAttribute("data-kf-responses") === "none"

export function toggleAdapter(): Adapter {
  const seen = new WeakMap<Element, boolean>()
  const timers = new WeakMap<Element, ReturnType<typeof setTimeout>>()
  const remember = (el: HTMLElement) => seen.set(el, el.matches(ON))

  return {
    match: TOGGLES,
    init: () => document.querySelectorAll<HTMLElement>(TOGGLES).forEach(remember),
    added: remember,
    changed: (el, attribute) => {
      if (!STATE_ATTRIBUTES.has(attribute)) return
      const on = el.matches(ON)
      if (seen.get(el) === on) return
      seen.set(el, on)
      if (optedOut(el) || responsesOff()) return
      clearTimeout(timers.get(el))
      el.setAttribute("data-kf-toggled", on ? "on" : "off")
      const ms = scaled(150, el)
      timers.set(
        el,
        setTimeout(() => el.removeAttribute("data-kf-toggled"), ms + HOLD_MS),
      )
      emitCut({ cut: "toggle", component: el.getAttribute("data-slot") ?? "toggle", phase: on ? "enter" : "exit", ms: Math.round(ms) })
    },
  }
}
