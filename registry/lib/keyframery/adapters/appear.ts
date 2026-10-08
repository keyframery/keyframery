/** Arrivals in place: an alert, a combobox chip, an attachment or an avatar's photo that shows up after
 *  the page has loaded eases in instead of popping. Only when it is itself inserted (`{show && <Alert />}`),
 *  never as part of a whole new page on a route change. An attachment's upload also gets the response it
 *  deserves: a small punch when it's done, the error shake when it fails. */

import { emitCut, reducedMotion, scaled } from "../motion"
import type { Adapter } from "../observe"
import { optedOut } from "../state"
import { SHAKE } from "./error"
import { responsesOff } from "./toggle"

const ENTER: Record<string, Keyframe[]> = {
  alert: [{ opacity: 0, translate: "0 -6px" }, { opacity: 1, translate: "0 0" }],
  attachment: [{ opacity: 0, scale: "0.96" }, { opacity: 1, scale: "1" }],
  "combobox-chip": [{ opacity: 0, scale: "0.85" }, { opacity: 1, scale: "1" }],
  "avatar-image": [{ opacity: 0 }, { opacity: 1 }],
}
const MATCH = Object.keys(ENTER)
  .map((s) => `[data-slot="${s}"]`)
  .join(",")
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

export function appearAdapter(): Adapter {
  let ready = false
  const states = new WeakMap<Element, string | null>()

  return {
    match: MATCH,
    init: () => {
      document.querySelectorAll('[data-slot="attachment"]').forEach((el) => states.set(el, el.getAttribute("data-state")))
      ready = true
    },
    added: (el, root) => {
      const slot = el.getAttribute("data-slot") ?? ""
      if (slot === "attachment") states.set(el, el.getAttribute("data-state"))
      // Part of a bigger insertion (a new page, a remounted list): that arrival isn't this element's change.
      if (!ready || (root && root !== el) || optedOut(el) || responsesOff()) return
      const ms = scaled(slot === "avatar-image" ? 200 : 220, el)
      el.animate(reducedMotion() ? [{ opacity: 0 }, { opacity: 1 }] : ENTER[slot], { duration: ms, easing: EASE })
      emitCut({ cut: "appear", component: slot, phase: "enter", ms: Math.round(ms) })
    },
    changed: (el, attribute) => {
      if (attribute !== "data-state" || !el.matches('[data-slot="attachment"]')) return
      const now = el.getAttribute("data-state")
      const was = states.get(el) ?? null
      states.set(el, now)
      if (now === was || optedOut(el) || responsesOff()) return
      // The content crossfades in every case; the shake and the punch are movement, so reduced motion skips them.
      el.querySelector('[data-slot="attachment-content"]')?.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: scaled(160, el), easing: EASE })
      if (!reducedMotion()) {
        if (now === "error") el.animate(SHAKE, { duration: scaled(240, el), easing: "ease-out" })
        else if (now === "done" && (was === "uploading" || was === "processing")) {
          el.querySelector('[data-slot="attachment-media"]')?.animate([{ scale: "1" }, { scale: "1.08", offset: 0.4 }, { scale: "1" }], { duration: scaled(300, el), easing: "ease-out" })
        }
      }
      emitCut({ cut: now === "error" ? "error" : "appear", component: "attachment", phase: "enter", ms: Math.round(scaled(240, el)) })
    },
  }
}
