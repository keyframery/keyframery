/** Dialog, alert dialog and command: aim the cut at the opener, carry section settings, report the cut. */

import { aimAt, carrySettings, mirrorCut } from "../aim"
import { DURATIONS, emitCut, scaled } from "../motion"
import type { Adapter } from "../observe"
import type { Press, PressTracker } from "../press"
import { optedOut, phaseOf, type Phase } from "../state"

const CONTENT = '[data-slot="dialog-content"],[data-slot="alert-dialog-content"]'
const OVERLAY = '[data-slot="dialog-overlay"],[data-slot="alert-dialog-overlay"]'
const CUTS = ["rack-focus", "punch-in", "fade"] as const
type DialogCssCut = (typeof CUTS)[number]

export function dialogCutOf(el: Element): string {
  return el.getAttribute("data-cut") ?? document.documentElement.getAttribute("data-kf-dialog") ?? "rack-focus"
}

function componentOf(el: Element): string {
  if (el.querySelector('[data-slot="command"]')) return "command"
  return el.getAttribute("data-slot") === "alert-dialog-content" ? "alert-dialog" : "dialog"
}

export function overlayAdapter(press: PressTracker): Adapter {
  const seen = new WeakMap<Element, Phase>()
  const openers = new WeakMap<Element, Press | null>()

  const handle = (el: HTMLElement, mounted: boolean) => {
    const phase = phaseOf(el)
    if (!phase || seen.get(el) === phase) return
    seen.set(el, phase)
    if (phase === "open") {
      const p = press.last()
      const opener = p && !el.contains(p.el) ? p : null
      openers.set(el, opener)
      carrySettings(el, opener?.el ?? null)
      mirrorCut(el, OVERLAY)
      if (optedOut(el)) return
      aimAt(el, opener, true)
    } else {
      if (mounted || optedOut(el)) return
      aimAt(el, openers.get(el) ?? null, false)
    }
    const cut = dialogCutOf(el)
    if (!(CUTS as readonly string[]).includes(cut)) return
    const d = DURATIONS[cut as DialogCssCut]
    emitCut({ cut, component: componentOf(el), phase: phase === "open" ? "enter" : "exit", ms: Math.round(scaled(phase === "open" ? d.enter : d.exit, el)) })
  }

  return {
    match: CONTENT,
    added: (el) => handle(el, true),
    changed: (el, attribute) => {
      if (attribute === "data-state" || attribute === "data-open" || attribute === "data-closed") handle(el, false)
    },
  }
}
