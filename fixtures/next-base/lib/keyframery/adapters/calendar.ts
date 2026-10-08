import { easingOf, emitCut, reducedMotion, scaled } from "../motion"
import type { Adapter } from "../observe"
import type { PressTracker } from "../press"
import { optedOut } from "../state"
import { responsesOff } from "./toggle"

const NAV = '[data-slot="calendar"] :is(.rdp-button_previous, .rdp-button_next)'
const WEEKS = '[data-slot="calendar"] .rdp-week'

export function calendarAdapter(press: PressTracker): Adapter {
  let pending: { dir: 1 | -1; t: number; told: boolean } | null = null
  const unsubscribe = press.onPress((p) => {
    const nav = p.el.closest(NAV)
    if (!nav || (p.kind === "key" && p.key !== "Enter" && p.key !== " ")) return
    pending = { dir: nav.matches(".rdp-button_next") ? 1 : -1, t: performance.now(), told: false }
  })

  return {
    match: WEEKS,
    added: (el) => {
      if (!pending || performance.now() - pending.t > 800) return
      if (optedOut(el) || responsesOff()) return
      const ms = scaled(260, el)
      el.animate(reducedMotion() ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, translate: `${pending.dir * 16}px 0` }, { opacity: 1, translate: "0 0" }], {
        duration: ms,
        easing: easingOf(el),
      })
      if (pending.told) return
      pending.told = true
      emitCut({ cut: "j-cut", component: "calendar", phase: "enter", ms: Math.round(ms) })
    },
    dispose: unsubscribe,
  }
}
