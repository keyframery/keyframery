import { emitCut, scaled } from "../motion"
import type { Adapter } from "../observe"
import { optedOut } from "../state"

export const TOGGLE_SLOTS = [
  "checkbox",
  "radio-group-item",
  "switch",
  "questionnaire-choice",
  "dropdown-menu-checkbox-item",
  "dropdown-menu-radio-item",
  "context-menu-checkbox-item",
  "context-menu-radio-item",
  "menubar-checkbox-item",
  "menubar-radio-item",
  "command-item",
  "combobox-item",
] as const

const TOGGLES = TOGGLE_SLOTS.map((s) => `[data-slot="${s}"]`).join(",")
// Base UI sets data-checked / data-unchecked; Radix sets data-state. A combobox item is "on" when selected.
// (The command palette uses data-selected for its keyboard highlight, so only data-checked counts there.)
const ON = '[data-checked]:not([data-checked="false"]),[data-state="checked"]'
const ON_SELECTED = '[data-slot="combobox-item"]:is([data-selected]:not([data-selected="false"]))'
const isOn = (el: Element) => el.matches(ON) || el.matches(ON_SELECTED)
const STATE_ATTRIBUTES = new Set(["data-checked", "data-unchecked", "data-state", "data-selected"])
// How long the mark stays after the response: long enough for a slowed-down pace to finish.
const HOLD_MS = 250

/** True while <Cuts responses="none" /> is set. */
export const responsesOff = () => document.documentElement.getAttribute("data-kf-responses") === "none"

export function toggleAdapter(): Adapter {
  const seen = new WeakMap<Element, boolean>()
  const timers = new WeakMap<Element, ReturnType<typeof setTimeout>>()
  const remember = (el: HTMLElement) => seen.set(el, isOn(el))

  return {
    match: TOGGLES,
    init: () => document.querySelectorAll<HTMLElement>(TOGGLES).forEach(remember),
    added: remember,
    changed: (el, attribute) => {
      if (!STATE_ATTRIBUTES.has(attribute)) return
      const on = isOn(el)
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
