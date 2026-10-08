/** Questionnaire: the next question slides in from the right and the previous one from the left, the way
 *  tabs switch to a neighbour. The question you leave hides at once, so focus never waits for motion. */

import { easingOf, emitCut, reducedMotion, scaled } from "../motion"
import type { Adapter } from "../observe"
import { optedOut } from "../state"
import { responsesOff } from "./toggle"

const ROOT = '[data-slot="questionnaire"]'
const ITEM = '[data-slot="questionnaire-item"]'

export function stepsAdapter(): Adapter {
  const current = new WeakMap<Element, Element>()

  return {
    match: ITEM,
    init: () =>
      document.querySelectorAll(ROOT).forEach((root) => {
        const active = root.querySelector(`${ITEM}[data-active]`)
        if (active) current.set(root, active)
      }),
    changed: (el, attribute) => {
      if (attribute !== "data-active" || !el.hasAttribute("data-active")) return
      const root = el.closest(ROOT)
      if (!root) return
      const before = current.get(root)
      current.set(root, el)
      if (!before || before === el || optedOut(el) || responsesOff()) return
      const items = [...root.querySelectorAll(ITEM)]
      const dir = items.indexOf(el) > items.indexOf(before) ? 1 : -1
      const ms = scaled(260, el)
      el.animate(reducedMotion() ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, translate: `${dir * 16}px 0` }, { opacity: 1, translate: "0 0" }], {
        duration: ms,
        easing: easingOf(el),
      })
      emitCut({ cut: "j-cut", component: "questionnaire", phase: "enter", ms: Math.round(ms) })
    },
  }
}
