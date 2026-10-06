"use client"

/* ListCut: lists that change without jumping. Arrivals, departures and reorders, keyed by id. */

import * as React from "react"

import { centerOf } from "@/lib/keyframery/aim"
import { lastPress } from "@/lib/keyframery/engine"
import { diffIds, type ListKey } from "@/lib/keyframery/list"
import { emitCut, reducedMotion, scaled } from "@/lib/keyframery/motion"
import { optedOut } from "@/lib/keyframery/state"

type Seen = { el: HTMLElement; rect: DOMRect; cells?: number[] }
type Before = { origin: DOMRect | null; items: Map<ListKey, Seen> }
type Registry = Map<ListKey, HTMLElement>

const RegistryContext = React.createContext<Registry | null>(null)
const SETTLE = "cubic-bezier(0.22, 1, 0.36, 1)"
const gliding = new WeakMap<Element, Animation>()

/**
 * Measures the list and every item right before React changes the DOM, then hands those boxes to
 * `onCommit`. Item boxes are compared relative to the list's own box, so a list that is merely pushed
 * down the page (something above it grew) doesn't make its items glide.
 */
class BeforeAfter extends React.Component<{ items: Registry; list: React.RefObject<HTMLElement | null>; onCommit: (before: Before) => void; children?: React.ReactNode }, object, Before> {
  getSnapshotBeforeUpdate(): Before {
    const before = new Map<ListKey, Seen>()
    for (const [id, el] of this.props.items) {
      before.set(id, {
        el,
        rect: el.getBoundingClientRect(),
        cells: el.tagName === "TR" ? Array.from(el.children, (c) => c.getBoundingClientRect().width) : undefined,
      })
    }
    return { origin: this.props.list.current?.getBoundingClientRect() ?? null, items: before }
  }
  componentDidUpdate(_props: unknown, _state: unknown, before?: Before) {
    if (before) this.props.onCommit(before)
  }
  render() {
    return this.props.children
  }
}

const near = (r: DOMRect) => r.bottom > -window.innerHeight * 0.5 && r.top < window.innerHeight * 1.5

/** The removed item's own node plays its exit as a ghost (React is done with it), then goes for good. */
function leave(list: HTMLElement, seen: Seen, shift: { x: number; y: number }, ms: number) {
  const host = /^(TBODY|THEAD|TFOOT|TABLE)$/.test(list.tagName) ? ((list.closest("table")?.parentElement as HTMLElement | null) ?? list) : list
  const box = host.getBoundingClientRect()
  if (getComputedStyle(host).position === "static") {
    host.style.position = "relative"
    host.setAttribute("data-kf-relative", "")
  }
  let ghost: HTMLElement = seen.el
  if (seen.el.tagName === "TR") {
    // a table row needs a table around it to keep its column widths
    const table = document.createElement("table")
    const body = document.createElement("tbody")
    table.style.borderCollapse = "collapse"
    table.style.tableLayout = "fixed"
    seen.cells?.forEach((w, i) => {
      const cell = seen.el.children[i] as HTMLElement | undefined
      if (cell) cell.style.width = `${w}px`
    })
    body.append(seen.el)
    table.append(body)
    ghost = table
  }
  Object.assign(ghost.style, {
    position: "absolute",
    left: `${seen.rect.left + shift.x - box.left - host.clientLeft + host.scrollLeft}px`,
    top: `${seen.rect.top + shift.y - box.top - host.clientTop + host.scrollTop}px`,
    width: `${seen.rect.width}px`,
    height: `${seen.rect.height}px`,
    margin: "0",
    boxSizing: "border-box",
    pointerEvents: "none",
    zIndex: "0",
  })
  ghost.setAttribute("aria-hidden", "true")
  ghost.setAttribute("data-kf-ghost", "")
  ghost.inert = true
  host.append(ghost)
  const done = () => {
    ghost.remove()
    if (host.hasAttribute("data-kf-relative") && !host.querySelector(":scope > [data-kf-ghost]")) {
      host.style.removeProperty("position")
      host.removeAttribute("data-kf-relative")
    }
  }
  ghost
    .animate(
      [
        { opacity: 1, scale: "1" },
        { opacity: 0, scale: "0.97" },
      ],
      { duration: ms, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" },
    )
    .finished.then(done, done)
}

function play(list: HTMLElement | null, { origin, items: before }: Before, items: Registry) {
  if (!list || optedOut(list)) return
  const t0 = performance.now()
  // A running glide would skew the new boxes; the "before" boxes were already the visible ones.
  for (const el of items.values()) gliding.get(el)?.cancel()
  const after = new Map(Array.from(items, ([id, el]) => [id, el.getBoundingClientRect()] as const))
  const now = list.getBoundingClientRect()
  const shift = { x: origin ? now.left - origin.left : 0, y: origin ? now.top - origin.top : 0 } // how far the whole list moved
  const { entered, exited, kept } = diffIds([...before.keys()], [...after.keys()])
  const reduced = reducedMotion()
  const ms = (n: number) => scaled(n, list)
  const lead = exited.length && !reduced ? ms(60) : 0

  let glided = 0
  if (!reduced) {
    for (const id of kept) {
      const a = before.get(id)!.rect
      const b = after.get(id)!
      const dx = a.left + shift.x - b.left
      const dy = a.top + shift.y - b.top
      if ((Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) || (!near(a) && !near(b))) continue
      const el = items.get(id)!
      gliding.set(
        el,
        el.animate(
          [
            { translate: `${dx}px ${dy}px` },
            { translate: "0 0" },
          ],
          { duration: ms(320), delay: lead, easing: SETTLE, fill: "backwards" },
        ),
      )
      glided++
    }
  }

  const press = lastPress(800)
  const from = press && !list.contains(press.el) ? press : null
  for (const id of entered) {
    const el = items.get(id)!
    const r = after.get(id)!
    if (!near(r)) continue
    if (reduced) {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120 })
    } else if (from) {
      const f = centerOf(from.el.isConnected ? from.el.getBoundingClientRect() : from.rect)
      const c = centerOf(r)
      el.animate(
        [
          { translate: `${f.x - c.x}px ${f.y - c.y}px`, scale: "0.9", opacity: 0 },
          { translate: "0 0", scale: "1", opacity: 1 },
        ],
        { duration: ms(380), easing: SETTLE },
      )
    } else {
      el.animate(
        [
          { translate: "0 8px", opacity: 0 },
          { translate: "0 0", opacity: 1 },
        ],
        { duration: ms(260), easing: SETTLE },
      )
    }
  }

  if (!reduced) for (const id of exited) if (near(before.get(id)!.rect)) leave(list, before.get(id)!, shift, ms(220))

  if (entered.length) emitCut({ cut: reduced ? "fade" : from ? "cut-on-action" : "rise", component: "list", phase: "enter", ms: Math.round(reduced ? 120 : ms(from ? 380 : 260)) })
  if (exited.length && !reduced) emitCut({ cut: "l-cut", component: "list", phase: "exit", ms: Math.round(ms(220)) })
  if (glided) emitCut({ cut: "glide", component: "list", phase: "enter", ms: Math.round(ms(320) + lead) })
  ;(globalThis as { __kfListPerf?: number[] }).__kfListPerf?.push(performance.now() - t0)
}

type Polymorphic = { as?: React.ElementType; children?: React.ReactNode; className?: string; style?: React.CSSProperties; [prop: string]: unknown }

export type ListCutProps = Polymorphic & { pace?: number; cut?: "none" }

export function ListCut({ as: Tag = "div", children, pace, cut, style, ...rest }: ListCutProps) {
  const [items] = React.useState<Registry>(() => new Map())
  const list = React.useRef<HTMLElement>(null)
  const onCommit = React.useCallback((before: Before) => play(list.current, before, items), [items])
  return (
    <RegistryContext.Provider value={items}>
      <Tag
        ref={list}
        data-slot="list-cut"
        data-cut={cut === "none" ? "none" : undefined}
        style={pace ? ({ ...style, "--kf-pace": pace } as React.CSSProperties) : style}
        {...rest}
      >
        <BeforeAfter items={items} list={list} onCommit={onCommit}>
          {children}
        </BeforeAfter>
      </Tag>
    </RegistryContext.Provider>
  )
}

export type ListCutItemProps = Polymorphic & { id: ListKey }

function ListCutItem({ id, as: Tag = "div", children, ...rest }: ListCutItemProps) {
  const items = React.useContext(RegistryContext)
  const ref = React.useCallback(
    (el: HTMLElement | null) => {
      if (!el || !items) return
      items.set(id, el)
      return () => {
        if (items.get(id) === el) items.delete(id)
      }
    },
    [items, id],
  )
  return (
    <Tag ref={ref} data-slot="list-cut-item" {...rest}>
      {children}
    </Tag>
  )
}

ListCut.Item = ListCutItem
