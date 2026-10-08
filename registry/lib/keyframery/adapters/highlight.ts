/** Highlight: when the selection moves to a sibling, its background travels there instead of jumping.
 *  Toggle groups, pagination, the sidebar and the calendar. A change made from the keyboard stays instant:
 *  people press arrow keys many times in a row, and motion would only slow them down. */

import { easingOf, emitCut, reducedMotion, scaled } from "../motion"
import type { Adapter } from "../observe"
import type { PressTracker } from "../press"
import { optedOut } from "../state"
import { responsesOff } from "./toggle"

type Row = {
  /** Where the travelling pill is drawn: an ancestor holding every item, never a table part. */
  host: string
  item: string
  active: string
}

export const HIGHLIGHTS: Row[] = [
  {
    host: '[data-slot="toggle-group"]',
    item: '[data-slot="toggle-group-item"]',
    active: '[data-pressed]:not([data-pressed="false"]),[data-state="on"]',
  },
  { host: '[data-slot="pagination-content"]', item: '[data-slot="pagination-link"]', active: '[aria-current="page"]' },
  {
    host: '[data-slot="sidebar-content"]',
    item: '[data-slot="sidebar-menu-button"],[data-slot="sidebar-menu-sub-button"]',
    active: '[data-active]:not([data-active="false"])',
  },
  { host: '[data-slot="calendar"]', item: "[data-day]", active: '[data-selected-single="true"]' },
]

const ITEMS = HIGHLIGHTS.map((r) => r.item).join(",")
const ATTRIBUTES = new Set(["data-pressed", "aria-pressed", "data-state", "aria-current", "data-active", "data-selected-single"])

type Flight = { pill: HTMLElement; anims: Animation[]; restore: () => void }

function rowOf(item: Element): Row | undefined {
  return HIGHLIGHTS.find((r) => item.matches(r.item))
}

function activeIn(host: Element, row: Row): Element[] {
  return [...host.querySelectorAll(row.item)].filter((el) => el.matches(row.active) && host.contains(el))
}

/** Position of `r` inside `host`'s padding box, following its scroll. */
function inside(host: HTMLElement, r: DOMRect) {
  const h = host.getBoundingClientRect()
  return {
    left: `${r.left - h.left - host.clientLeft + host.scrollLeft}px`,
    top: `${r.top - h.top - host.clientTop + host.scrollTop}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
  }
}

export function highlightAdapter(press: PressTracker): Adapter {
  const last = new WeakMap<Element, Element | null>()
  const flights = new WeakMap<Element, Flight>()
  const dirty = new Set<HTMLElement>()
  // Where the selection was when the user pressed inside a host. Some components rebuild on select (the
  // calendar re-renders its whole grid, root included), so by the time the change shows, the old item and
  // even the old host are gone; this remembers the spot by row, not by element.
  let pressed: { row: Row; rect: DOMRect; t: number } | null = null
  const unsubscribe = press.onPress((p) => {
    pressed = null
    for (const row of HIGHLIGHTS) {
      const host = p.el.closest(row.host)
      const current = host && activeIn(host, row)
      if (current && current.length === 1) pressed = { row, rect: current[0].getBoundingClientRect(), t: performance.now() }
    }
  })

  const record = (host: Element, row: Row) => {
    const now = activeIn(host, row)
    last.set(host, now.length === 1 ? now[0] : null)
  }
  const recordAll = () => {
    for (const row of HIGHLIGHTS) document.querySelectorAll(row.host).forEach((host) => record(host, row))
  }

  const land = (host: Element) => {
    const f = flights.get(host)
    if (!f) return
    flights.delete(host)
    f.anims.forEach((a) => a.cancel())
    f.pill.remove()
    f.restore()
  }

  const glide = (host: HTMLElement, from: DOMRect, to: HTMLElement, inactiveColor: string) => {
    const cs = getComputedStyle(to)
    const toRect = to.getBoundingClientRect()
    const distance = Math.hypot(toRect.left - from.left, toRect.top - from.top)
    const ms = scaled(Math.min(320, Math.max(200, 200 + distance * 0.25)), to)
    const pill = document.createElement("span")
    pill.setAttribute("aria-hidden", "true")
    pill.setAttribute("data-kf-pill", "")
    Object.assign(pill.style, {
      position: "absolute",
      zIndex: "-1",
      boxSizing: "border-box",
      pointerEvents: "none",
      borderRadius: cs.borderRadius,
      background: cs.backgroundColor,
      boxShadow: cs.boxShadow,
      border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
      ...inside(host, toRect),
    })
    // The pill paints under the labels: the host becomes its own layer for the length of the flight.
    const undo: (() => void)[] = []
    const set = (prop: "position" | "isolation", value: string) => {
      if (getComputedStyle(host)[prop] !== (prop === "position" ? "static" : "auto")) return
      host.style[prop] = value
      undo.push(() => host.style.removeProperty(prop))
    }
    set("position", "relative")
    set("isolation", "isolate")
    host.prepend(pill)

    // The item keeps its label, in the colour it has at rest, until the pill arrives under it.
    const bare = { backgroundColor: "transparent", boxShadow: "none", borderColor: "transparent", color: inactiveColor }
    const anims = [
      to.animate([bare, bare], { duration: ms }),
      pill.animate([inside(host, from), inside(host, toRect)], { duration: ms, easing: easingOf(to) }),
    ]
    flights.set(host, { pill, anims, restore: () => undo.forEach((u) => u()) })
    anims[1].finished.then(
      () => land(host),
      () => {},
    )
    emitCut({ cut: "highlight", component: (host.getAttribute("data-slot") ?? "highlight").replace(/-content$/, ""), phase: "enter", ms: Math.round(ms) })
  }

  const settle = (host: HTMLElement, row: Row) => {
    const before = last.get(host) ?? null
    const now = activeIn(host, row)
    const after = now.length === 1 ? (now[0] as HTMLElement) : null
    last.set(host, after)
    if (!after || before === after) return
    const recent = pressed && pressed.row === row && performance.now() - pressed.t < 800 ? pressed : null
    // A brand-new host with nothing pressed before it is a first render, not a change.
    if (!before && !recent) return
    const flying = flights.get(host)
    const from = flying ? flying.pill.getBoundingClientRect() : before?.isConnected ? before.getBoundingClientRect() : recent?.rect
    pressed = null
    land(host)
    if (!from || optedOut(after) || responsesOff()) return
    const p = press.last(800)
    // Keyboard and programmatic changes stay instant; only a pointer press inside this host glides.
    // (The pressed item may have been rebuilt too; the record taken at the press says it was in here.)
    if (!p || p.kind !== "pointer" || !(recent || host.contains(p.el))) return
    const to = after.getBoundingClientRect()
    if (Math.abs(to.left - from.left) < 1 && Math.abs(to.top - from.top) < 1) return
    if (reducedMotion()) {
      after.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: scaled(120, after) })
      return
    }
    const sibling = [...host.querySelectorAll(row.item)].find((el) => el !== after && !el.matches(row.active))
    glide(host, from, after, sibling ? getComputedStyle(sibling).color : getComputedStyle(after).color)
  }

  return {
    match: ITEMS,
    init: recordAll,
    added: (el) => {
      const row = rowOf(el)
      const host = row && (el.closest(row.host) as HTMLElement | null)
      if (!row || !host) return
      // Known host: its items were rebuilt. New host: maybe the whole component was rebuilt on select.
      dirty.add(host)
    },
    changed: (el, attribute) => {
      if (!ATTRIBUTES.has(attribute)) return
      const row = rowOf(el)
      const host = row && (el.closest(row.host) as HTMLElement | null)
      if (host) dirty.add(host)
    },
    flush: () => {
      for (const host of dirty) {
        const row = HIGHLIGHTS.find((r) => host.matches(r.host))
        if (row) settle(host, row)
      }
      dirty.clear()
    },
    dispose: unsubscribe,
  }
}
