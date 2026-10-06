/** Sheet and drawer: the page behind steps back while the panel is up. */

import { carrySettings, mirrorCut } from "../aim"
import { DURATIONS, emitCut, reducedMotion, scaled } from "../motion"
import type { Adapter } from "../observe"
import type { PressTracker } from "../press"
import { optedOut, phaseOf, type Phase } from "../state"

const PANELS = '[data-slot="sheet-content"],[data-slot="drawer-popup"],[data-slot="drawer-content"][data-vaul-drawer]'
const SHEET_OVERLAY = '[data-slot="sheet-overlay"]'
/** Top-level children of <body> that are portals or plumbing, never the app. */
const NOT_APP = [
  "script", "style", "template", "link", "next-route-announcer", "[hidden]",
  "[data-base-ui-portal]", "[data-radix-popper-content-wrapper]", "[data-radix-focus-guard]",
  '[data-slot$="-content"]', '[data-slot$="-overlay"]', '[data-slot$="-popup"]', '[data-slot$="-portal"]', '[data-slot$="-viewport"]',
  "[data-kf-ghost]", "[data-sonner-toaster]", 'section[aria-label^="Notifications"]',
].join(",")
const SHEET_CUTS = ["slide-sink", "slide", "fade"] as const
type SheetCssCut = (typeof SHEET_CUTS)[number]

const groupOf = (el: Element): "sheet" | "drawer" => (el.getAttribute("data-slot") === "sheet-content" ? "sheet" : "drawer")

export function panelCutOf(el: Element): string {
  if (optedOut(el)) return "none"
  return el.getAttribute("data-cut") ?? document.documentElement.getAttribute(`data-kf-${groupOf(el)}`) ?? "slide-sink"
}

/** The top-level child of <body> that holds the opener. If the opener lives in a portal (a nested panel), nothing sinks again. */
export function appRootFor(opener: Element | null): HTMLElement | null {
  let top: Element | null = opener
  while (top && top.parentElement && top.parentElement !== document.body) top = top.parentElement
  if (top && top.parentElement === document.body) return top.matches(NOT_APP) ? null : (top as HTMLElement)
  return (Array.from(document.body.children).find((c) => !c.matches(NOT_APP)) as HTMLElement | undefined) ?? null
}

export function panelAdapter(press: PressTracker): Adapter {
  const seen = new WeakMap<Element, Phase>()
  const sunk = new Map<Element, HTMLElement>()

  const sinkOn = (panel: HTMLElement, opener: Element | null) => {
    if (sunk.has(panel) || reducedMotion() || panelCutOf(panel) !== "slide-sink") return
    const root = appRootFor(opener)
    if (!root || root.contains(panel)) return
    root.setAttribute("data-kf-sink", "on")
    document.documentElement.setAttribute("data-kf-sinking", "")
    sunk.set(panel, root)
  }

  const sinkOff = (panel: Element) => {
    const root = sunk.get(panel)
    if (!root) return
    sunk.delete(panel)
    if (![...sunk.values()].includes(root)) root.setAttribute("data-kf-sink", "off")
    if (sunk.size === 0) document.documentElement.removeAttribute("data-kf-sinking")
  }

  const handle = (el: HTMLElement, mounted: boolean) => {
    const phase = phaseOf(el)
    if (!phase || seen.get(el) === phase) return
    seen.set(el, phase)
    if (phase === "closed") {
      sinkOff(el)
      if (mounted) return
    } else {
      const p = press.last()
      const opener = p && !el.contains(p.el) ? p.el : null
      carrySettings(el, opener)
      mirrorCut(el, SHEET_OVERLAY)
      sinkOn(el, opener)
    }
    const group = groupOf(el)
    const cut = panelCutOf(el)
    if (group === "sheet" ? !(SHEET_CUTS as readonly string[]).includes(cut) : cut !== "slide-sink") return
    const d = DURATIONS[cut as SheetCssCut]
    emitCut({ cut, component: group, phase: phase === "open" ? "enter" : "exit", ms: Math.round(scaled(phase === "open" ? d.enter : d.exit, el)) })
  }

  return {
    match: PANELS,
    added: (el) => handle(el, true),
    changed: (el, attribute) => {
      if (attribute === "data-state" || attribute === "data-open" || attribute === "data-closed") handle(el, false)
    },
    removed: sinkOff,
    dispose: () => [...sunk.keys()].forEach(sinkOff),
  }
}
