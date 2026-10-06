/** Toasts (sonner and Base UI): cut on action, so the toast leaves the element you pressed. */

import { centerOf } from "../aim"
import { DURATIONS, emitCut, reducedMotion, scaled } from "../motion"
import type { Adapter } from "../observe"
import type { PressTracker } from "../press"
import { optedOut } from "../state"

const TOAST = '[data-sonner-toast],[data-slot="toast"]'

export function toastAdapter(press: PressTracker): Adapter {
  const flown = new WeakSet<Element>()
  return {
    match: TOAST,
    added(el) {
      if (flown.has(el)) return
      flown.add(el)
      if (document.documentElement.getAttribute("data-kf-toast") === "none" || reducedMotion() || optedOut(el)) return
      const p = press.last(1000)
      if (!p || el.contains(p.el) || optedOut(p.el)) return
      const from = centerOf(p.el.isConnected ? p.el.getBoundingClientRect() : p.rect)
      const to = centerOf(el.getBoundingClientRect())
      const ms = scaled(DURATIONS["cut-on-action"].enter, el)
      // The individual translate/scale properties compose with the library's own transform transition instead of fighting it.
      el.animate(
        [
          { translate: `${from.x - to.x}px ${from.y - to.y}px`, scale: "0.4", filter: "blur(6px)" },
          { translate: "0 0", scale: "1", filter: "blur(0)" },
        ],
        { duration: ms, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      )
      emitCut({ cut: "cut-on-action", component: el.hasAttribute("data-sonner-toast") ? "sonner" : "toast", phase: "enter", ms: Math.round(ms) })
    },
  }
}
