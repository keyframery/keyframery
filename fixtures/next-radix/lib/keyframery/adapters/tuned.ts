import { carrySettings } from "../aim"
import { DURATIONS, emitCut, scaled } from "../motion"
import type { Adapter } from "../observe"
import type { PressTracker } from "../press"
import { optedOut, phaseOf, type Phase } from "../state"

export const TUNED_SLOTS = [
  "popover-content",
  "dropdown-menu-content",
  "dropdown-menu-sub-content",
  "context-menu-content",
  "context-menu-sub-content",
  "menubar-content",
  "menubar-sub-content",
  "select-content",
  "combobox-content",
  "hover-card-content",
  "tooltip-content",
  "navigation-menu-content",
  "navigation-menu-viewport",
  "accordion-content",
  "collapsible-content",
] as const

const TUNED = TUNED_SLOTS.map((s) => `[data-slot="${s}"]`).join(",")
const COLLAPSIBLE = '[data-slot="collapsible-content"]'
const componentOf = (el: Element) => (el.getAttribute("data-slot") ?? "").replace(/-(sub-content|content|viewport)$/, "")

export function tunedAdapter(press: PressTracker): Adapter {
  const seen = new WeakMap<Element, Phase>()

  const handle = (el: HTMLElement, mounted: boolean, initial: boolean) => {
    const phase = phaseOf(el)
    if (!phase || seen.get(el) === phase) return
    seen.set(el, phase)
    if (el.matches(COLLAPSIBLE)) {
      if (phase === "open" && initial) el.setAttribute("data-kf-static", "") // open before anyone pressed anything: no grow
      if (phase === "closed") el.removeAttribute("data-kf-static")
    }
    if (initial) return
    if (phase === "open") {
      const p = press.last()
      carrySettings(el, p && !el.contains(p.el) ? p.el : null)
    } else if (mounted) return
    if (optedOut(el)) return
    emitCut({ cut: "tuned", component: componentOf(el), phase: phase === "open" ? "enter" : "exit", ms: Math.round(scaled(DURATIONS.tuned.enter, el)) })
  }

  return {
    match: TUNED,
    init: () => document.querySelectorAll<HTMLElement>(TUNED).forEach((el) => handle(el, true, true)),
    added: (el) => handle(el, true, false),
    changed: (el, attribute) => {
      if (attribute === "data-state" || attribute === "data-open" || attribute === "data-closed") handle(el, false, false)
    },
  }
}
