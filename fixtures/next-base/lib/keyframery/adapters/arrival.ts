import { emitCut, reducedMotion, scaled } from "../motion"
import { isOutline, punch, redraw } from "../icon"
import type { Adapter } from "../observe"
import { optedOut } from "../state"
import { responsesOff } from "./toggle"

const HOSTS = '[data-sonner-toast],[data-slot="toast"],[data-slot="alert-dialog-media"]'

/** The status icon: sonner keeps it in [data-icon]; elsewhere it's the first icon outside a button. */
function iconIn(host: Element): SVGElement | null {
  const sonner = host.querySelector("[data-icon] svg")
  if (sonner) return sonner as SVGElement
  return ([...host.querySelectorAll("svg")].find((svg) => !svg.closest("button")) as SVGElement | undefined) ?? null
}

export function arrivalAdapter(): Adapter {
  let ready = false
  // Base UI inserts a dialog in two steps, so the same icon can be reported as added twice.
  const played = new WeakSet<Element>()

  const play = (host: HTMLElement) => {
    if (!ready || played.has(host) || optedOut(host) || responsesOff() || reducedMotion()) return
    played.add(host)
    const svg = iconIn(host)
    if (!svg) return
    const type = host.closest("[data-type]")?.getAttribute("data-type") ?? (host.matches('[data-slot="alert-dialog-media"]') ? "media" : "")
    if (type === "loading") return
    const ms = scaled(320, host)
    const delay = scaled(120, host)
    svg.style.transformOrigin = "50% 50%"
    if (type === "warning") {
      svg.style.transformOrigin = "50% 85%"
      svg.animate([{ rotate: "0deg" }, { rotate: "-12deg" }, { rotate: "10deg" }, { rotate: "-6deg" }, { rotate: "0deg" }], { duration: ms * 1.3, delay, easing: "ease-out" })
    } else if (type === "info") {
      svg.animate([{ translate: "0 -4px", opacity: 0 }, { translate: "0 0", opacity: 1 }], { duration: ms, delay, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" })
    } else if (isOutline(svg)) redraw(svg, ms, delay)
    else punch(svg, ms, delay)
    emitCut({ cut: "icon", component: host.matches('[data-slot="alert-dialog-media"]') ? "alert-dialog" : "toast", phase: "enter", ms: Math.round(ms + delay) })
  }

  return {
    match: HOSTS,
    init: () => {
      ready = true
    },
    added: play,
  }
}
