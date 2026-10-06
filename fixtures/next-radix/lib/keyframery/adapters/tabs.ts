import { playGhost, snapshot, type Snapshot } from "../ghost"
import { emitCut, reducedMotion, scaled } from "../motion"
import type { Adapter } from "../observe"
import type { PressTracker } from "../press"
import { isActive, optedOut } from "../state"

const ROOT = '[data-slot="tabs"]'
const PANEL = '[data-slot="tabs-content"]'
const TAB = '[data-slot="tabs-trigger"]'
const TABS_CUTS = ["j-cut", "whip", "fade"] as const
type TabsCut = (typeof TABS_CUTS)[number]

type Snap = { panel: Element | null; ghost: Snapshot | null; height: number; fromIndex: number; fromTab: Element | null; fromRect: DOMRect | null; t: number }

const own = (root: Element, selector: string) => Array.from(root.querySelectorAll(selector)).filter((n) => n.closest(ROOT) === root)
const visible = (el: Element) => !(el as HTMLElement).hidden && el.getClientRects().length > 0
const SETTLE = "cubic-bezier(0.22, 1, 0.36, 1)"

export function tabsCutOf(root: Element): TabsCut | "none" {
  if (optedOut(root)) return "none"
  const value = root.getAttribute("data-cut") ?? document.documentElement.getAttribute("data-kf-tabs") ?? "j-cut"
  return (TABS_CUTS as readonly string[]).includes(value) ? (value as TabsCut) : "none"
}

/** A pill travels from the old tab to the new one; the real tab hides its own pill until it lands. */
function whip(to: Element, fromRect: DOMRect, vertical: boolean, ms: number) {
  const list = to.parentElement
  if (!list) return
  const toRect = to.getBoundingClientRect()
  const listRect = list.getBoundingClientRect()
  const cs = getComputedStyle(to)
  const pill = document.createElement("span")
  pill.setAttribute("aria-hidden", "true")
  pill.setAttribute("data-kf-pill", "")
  Object.assign(pill.style, {
    position: "absolute",
    left: `${toRect.left - listRect.left - list.clientLeft}px`,
    top: `${toRect.top - listRect.top - list.clientTop}px`,
    width: `${toRect.width}px`,
    height: `${toRect.height}px`,
    borderRadius: cs.borderRadius,
    background: cs.backgroundColor,
    boxShadow: cs.boxShadow,
    pointerEvents: "none",
  })
  if (getComputedStyle(list).position === "static") {
    list.style.position = "relative"
    list.setAttribute("data-kf-relative", "")
  }
  list.prepend(pill)
  const dx = fromRect.left + fromRect.width / 2 - (toRect.left + toRect.width / 2)
  const dy = fromRect.top + fromRect.height / 2 - (toRect.top + toRect.height / 2)
  const sx = fromRect.width / toRect.width
  const sy = fromRect.height / toRect.height
  const at = (f: number) => (vertical ? `0 ${dy * f}px` : `${dx * f}px 0`)
  const bare = { backgroundColor: "transparent", boxShadow: "none", borderColor: "transparent" }
  ;(to as HTMLElement).animate([bare, bare], { duration: ms })
  const done = () => {
    pill.remove()
    if (list.hasAttribute("data-kf-relative") && !list.querySelector(":scope > [data-kf-pill]")) {
      list.style.removeProperty("position")
      list.removeAttribute("data-kf-relative")
    }
  }
  pill
    .animate(
      [
        { translate: at(1), scale: vertical ? `1 ${sy}` : `${sx} 1` },
        { translate: at(0.12), scale: vertical ? "1 1.08" : "1.08 1", offset: 0.7 },
        { translate: "0 0", scale: "1 1" },
      ],
      { duration: ms, easing: "cubic-bezier(0.65, 0, 0.35, 1)" },
    )
    .finished.then(done, done)
}

export function tabsAdapter(press: PressTracker): Adapter {
  const snaps = new Map<Element, Snap>()
  const dirty = new Set<Element>()
  const morphs = new WeakMap<Element, Animation>()

  const unsubscribe = press.onPress((_p, target) => {
    const root = target.closest(TAB)?.closest(ROOT)
    if (!root || tabsCutOf(root) === "none") return
    const panel = own(root, PANEL).find(visible) ?? null
    const tabs = own(root, TAB)
    const from = tabs.find(isActive) ?? null
    snaps.set(root, {
      panel,
      ghost: panel ? snapshot(panel) : null,
      height: root.getBoundingClientRect().height,
      fromIndex: from ? tabs.indexOf(from) : -1,
      fromTab: from,
      fromRect: from?.getBoundingClientRect() ?? null,
      t: performance.now(),
    })
  })

  function play(root: Element, snap: Snap, to: Element) {
    const cut = tabsCutOf(root)
    if (cut === "none") return
    const vertical = root.getAttribute("data-orientation") === "vertical"
    const dir = own(root, TAB).indexOf(to) >= snap.fromIndex ? 1 : -1
    const controlled = to.getAttribute("aria-controls")
    const panel =
      (controlled ? document.getElementById(controlled) : null) ??
      own(root, PANEL).find((p) => p !== snap.panel && visible(p) && !p.hasAttribute("data-ending-style")) ??
      null

    // Base UI keeps the old panel mounted for a frame (longer if it animates). The ghost plays that exit,
    // so take the real one out of layout now and hand it back once the library is done with it.
    if (snap.panel && snap.panel !== panel && visible(snap.panel)) {
      const old = snap.panel as HTMLElement
      old.style.display = "none"
      requestAnimationFrame(() => requestAnimationFrame(() => old.style.removeProperty("display")))
    }

    if (reducedMotion()) {
      const ms = scaled(120, root)
      panel?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms })
      emitCut({ cut, component: "tabs", phase: "enter", ms: Math.round(ms) })
      return
    }

    const travel = cut === "fade" ? 0 : 28
    const shift = (n: number) => (vertical ? `0 ${n}px` : `${n}px 0`)
    const blur = cut === "fade" ? "blur(0)" : "blur(4px)"
    const ghostMs = scaled(cut === "whip" ? 160 : 180, root)
    const enterMs = scaled(cut === "j-cut" ? 300 : cut === "whip" ? 160 : 180, root)
    const lead = cut === "j-cut" ? scaled(70, root) : 0

    if (snap.ghost) {
      playGhost(
        snap.ghost,
        [
          { opacity: 1, translate: "0 0", filter: "blur(0)" },
          { opacity: 0, translate: shift(-dir * travel), filter: blur },
        ],
        { duration: ghostMs, easing: "cubic-bezier(0.4, 0, 1, 1)" },
        root as HTMLElement,
      )
    }

    if (cut !== "fade" && snap.fromRect) whip(to, snap.fromRect, vertical, scaled(cut === "whip" ? 160 : 200, root))

    morphs.get(root)?.cancel()
    const height = root.getBoundingClientRect().height
    if (Math.abs(height - snap.height) > 1) {
      morphs.set(
        root,
        (root as HTMLElement).animate(
          [
            { height: `${snap.height}px`, overflow: "clip" },
            { height: `${height}px`, overflow: "clip" },
          ],
          { duration: scaled(320, root), easing: SETTLE },
        ),
      )
    }

    panel?.animate(
      [
        { opacity: 0, translate: shift(dir * travel), filter: cut === "whip" ? "blur(4px)" : "blur(0)" },
        { opacity: 1, translate: "0 0", filter: "blur(0)" },
      ],
      { duration: enterMs, delay: lead, easing: SETTLE, fill: "backwards" },
    )
    emitCut({ cut, component: "tabs", phase: "enter", ms: Math.round(enterMs + lead) })
  }

  const mark = (el: Element) => {
    const root = el.closest(ROOT)
    if (root) dirty.add(root)
  }

  return {
    match: `${ROOT},${PANEL},${TAB}`,
    added: mark,
    changed: mark,
    flush() {
      for (const root of dirty) {
        const snap = snaps.get(root)
        if (!snap || performance.now() - snap.t > 1500) continue
        const to = own(root, TAB).find(isActive)
        if (!to || to === snap.fromTab) continue
        snaps.delete(root)
        play(root, snap, to)
      }
      dirty.clear()
    },
    dispose: unsubscribe,
  }
}
