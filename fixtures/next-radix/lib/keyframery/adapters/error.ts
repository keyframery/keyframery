import { emitCut, reducedMotion, scaled } from "../motion"
import type { Adapter } from "../observe"
import type { PressTracker } from "../press"
import { optedOut } from "../state"
import { responsesOff } from "./toggle"

const INVALID = '[aria-invalid="true"],[data-invalid="true"]'
const MESSAGE = '[data-slot="field-error"]'
// Shake the box people see: an input inside a group shakes the whole group.
const BOX = '[data-slot="input-group"],[data-slot="input-otp"],[data-slot="native-select-wrapper"]'
const SHAKE: Keyframe[] = [
  { translate: "0 0" },
  { translate: "-3px 0", offset: 0.2 },
  { translate: "3px 0", offset: 0.45 },
  { translate: "-2px 0", offset: 0.7 },
  { translate: "0 0" },
]

export function errorAdapter(press: PressTracker): Adapter {
  const seen = new WeakMap<Element, boolean>()
  const shaking = new WeakMap<Element, Animation>()
  // Fields that are invalid right now. A field that drops the attribute altogether no longer matches this
  // adapter, so each batch re-checks them here; otherwise its next error would look like no change.
  const invalid = new Set<Element>()
  let ready = false

  const remember = (el: Element) => {
    const now = el.matches(INVALID)
    seen.set(el, now)
    if (now) invalid.add(el)
  }

  /** A submit (pointer or Enter) just happened, or focus has already left the field: blur validation. */
  const intended = (el: Element) => {
    const p = press.last(600)
    if (p && (p.kind === "pointer" || p.key === "Enter")) return true
    const focused = document.activeElement
    return !(focused && (focused === el || el.contains(focused)))
  }

  const shake = (el: HTMLElement) => {
    const box = (el.closest(BOX) as HTMLElement | null) ?? el
    if (shaking.get(box)?.playState === "running") return
    const ms = scaled(240, box)
    shaking.set(box, box.animate(SHAKE, { duration: ms, easing: "ease-out" }))
    emitCut({ cut: "error", component: box.getAttribute("data-slot") ?? box.tagName.toLowerCase(), phase: "enter", ms: Math.round(ms) })
  }

  return {
    match: `${INVALID},[aria-invalid],[data-invalid],${MESSAGE}`,
    init: () => {
      document.querySelectorAll(`[aria-invalid],[data-invalid]`).forEach(remember)
      ready = true
    },
    added: (el) => {
      if (el.matches(MESSAGE)) {
        if (!ready || optedOut(el) || responsesOff()) return
        el.animate(
          reducedMotion() ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, translate: "0 -4px" }, { opacity: 1, translate: "0 0" }],
          { duration: scaled(160, el), easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        )
        return
      }
      remember(el)
    },
    changed: (el, attribute) => {
      if (attribute !== "aria-invalid" && attribute !== "data-invalid") return
      const now = el.matches(INVALID)
      const was = seen.get(el) ?? false
      seen.set(el, now)
      if (now) invalid.add(el)
      else invalid.delete(el)
      if (!now || was) return
      // A field-level flag repeats what its control already says; shake the control only.
      if (el.matches('[data-slot="field"]') && el.querySelector('[aria-invalid="true"]')) return
      if (optedOut(el) || responsesOff() || reducedMotion() || !intended(el)) return
      shake(el)
    },
    flush: () => {
      for (const el of invalid) {
        if (el.isConnected && el.matches(INVALID)) continue
        invalid.delete(el)
        seen.set(el, false)
      }
    },
  }
}
