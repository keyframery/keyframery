"use client"

/**
 * PeekPagination: pagination that shows you where you'll land before you click. Point at a page number, an arrow
 * or a gap and a small card rises above it with that page: its number, its range, and anything you render for it,
 * like its first few rows. Give it `peek` and it fetches that page itself: only once the pointer rests on it, cancelled
 * if the pointer moves on, kept once it arrives. Fetch through your data cache and peeking becomes prefetching: the page
 * you were looking at opens instantly when you click it. Drag across a gap to browse the pages hidden inside it, or
 * type one into Go to. The row keeps the same few slots, so 3 pages or 3,000 take the same room. First, previous, next
 * and last, the range on screen and rows per page are built in. PaginationContent changes your content in the
 * direction you moved.
 */

import * as React from "react"
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useReducedMotion, type MotionValue } from "motion/react"

import { cn } from "@/lib/utils"

const LIGHT = "var(--kf-accent, #3b82f6)" // the light on the current page's edge
const CARD = 224 // the peek card's width, in px
const glide = { type: "spring", duration: 0.4, bounce: 0.1 } as const
const RAISED = "bg-card shadow-[0_2px_3px_-1px_rgb(0_0_0/0.1),0_1px_0_0_rgb(25_28_33/0.02)] ring-1 ring-black/8 dark:shadow-[0_1px_2px_rgb(0_0_0/0.5)] dark:ring-white/10"
const blurIn = { initial: { opacity: 0, filter: "blur(4px)" }, animate: { opacity: 1, filter: "blur(0px)" }, exit: { opacity: 0, filter: "blur(4px)" } }
const REST = 150 // ms the pointer rests on a page before the card fetches it
const KEEP = 60 // how many fetched pages the card keeps

type Slot = { kind: "page"; n: number } | { kind: "gap"; side: "start" | "end"; from: number; to: number }
type Peek = { page: number; el: HTMLElement; x?: number; hint?: string; fast?: boolean }
type Peeking = { show: (peek: Peek, now?: boolean) => void; hide: (delay?: number) => void; hideFor: (el: HTMLElement) => void; hovered: string | null; setHovered: (key: string | null) => void; id: string }
type Loaded<T> = { page: number; state: "loading" | "ready" | "failed"; data?: T }

export type PeekPaginationProps<T = unknown> = {
  /** The current page, when you control it. */
  page?: number
  /** The first page shown, when you don't. */
  defaultPage?: number
  onPageChange?: (page: number) => void
  /** How many pages there are. Or give `total` and `pageSize`. */
  pages?: number
  /** How many items there are. Shows "Showing 21–30 of 240". */
  total?: number
  /** Items per page. */
  pageSize?: number
  /** Offer these page sizes. */
  pageSizes?: number[]
  onPageSizeChange?: (size: number) => void
  /**
   * Fetches what the card shows for a page. It runs once the pointer has rested on that page for a moment (not while
   * it sweeps past), it's cancelled through `signal` if the pointer moves on, and what it returns is kept, so pointing
   * back is instant. Fetch through your data cache and the page is already loaded when it's clicked.
   */
  peek?: (page: number, signal: AbortSignal) => Promise<T>
  /** Draws the card's body for a page, under its number and range. With `peek`, `data` is what it fetched. */
  preview?: (page: number, data: T) => React.ReactNode
  className?: string
  "aria-label"?: string
}

export function PeekPagination<T = unknown>({ page: controlled, defaultPage = 1, onPageChange, pages: count, total, pageSize = 10, pageSizes, onPageSizeChange, peek: load, preview, className, "aria-label": ariaLabel = "Pagination" }: PeekPaginationProps<T>) {
  const pages = Math.max(1, count ?? (total === undefined ? 1 : Math.ceil(total / pageSize)))
  const [own, setOwn] = React.useState(defaultPage)
  const page = clamp(controlled ?? own, 1, pages)
  // Which way the page last moved: 1 = forward, -1 = back.
  const [{ last, dir }, setMove] = React.useState({ last: page, dir: 1 })
  if (page !== last) setMove({ last: page, dir: Math.sign(page - last) })
  const id = React.useId()
  const reduce = useReducedMotion() ?? false
  const nav = React.useRef<HTMLElement>(null)
  const [compact, setCompact] = React.useState(false)
  const [peek, setPeekState] = React.useState<Peek | null>(null)
  const peeking = React.useRef<Peek | null>(null)
  const timers = React.useRef({ show: 0, hide: 0 })
  const [hovered, setHovered] = React.useState<string | null>(null)
  const row = React.useRef<HTMLDivElement>(null)
  // Where the mouse was pressed. Until it moves away, the row sliding under a still pointer opens no cards.
  const pressed = React.useRef<{ x: number; y: number } | null>(null)
  // The current page's pill and the hover highlight live behind the numbers, so they never cover one as they move.
  const cur = { x: useMotionValue(0), w: useMotionValue(0) }
  const over = { x: useMotionValue(0), w: useMotionValue(0), o: useMotionValue(0) }
  const placed = React.useRef(false)
  // What the card has fetched: the page it's showing, and every page it has fetched so far.
  const [loaded, setLoaded] = React.useState<Loaded<T> | null>(null)
  const kept = React.useRef(new Map<number, T>())
  const loader = React.useRef(load)
  const fetching = Boolean(load)
  const peekPage = peek?.page ?? null

  React.useEffect(() => {
    loader.current = load
  })

  // Different pages once the page size or the data changes: forget what was fetched.
  React.useEffect(() => kept.current.clear(), [pageSize, total, pages])

  // Fetch the page the card is showing, once the pointer has rested on it. Moving on cancels the fetch.
  React.useEffect(() => {
    const fetchPage = loader.current
    if (peekPage === null || !fetchPage) return
    const have = kept.current.get(peekPage)
    if (kept.current.has(peekPage)) {
      setLoaded({ page: peekPage, state: "ready", data: have })
      return
    }
    setLoaded({ page: peekPage, state: "loading" })
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      fetchPage(peekPage, controller.signal).then(
        (data) => {
          kept.current.set(peekPage, data)
          if (kept.current.size > KEEP) kept.current.delete(kept.current.keys().next().value as number)
          if (!controller.signal.aborted) setLoaded({ page: peekPage, state: "ready", data })
        },
        () => {
          if (!controller.signal.aborted) setLoaded({ page: peekPage, state: "failed" })
        },
      )
    }, REST)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [peekPage, fetching])

  /** The card's body for a page: what was fetched for it, a quiet skeleton while it loads, or a line if it didn't. */
  function content(p: number): React.ReactNode {
    if (!preview) return null
    if (!fetching) return preview(p, undefined as T)
    if (loaded?.page === p && loaded.state === "ready") {
      return (
        <motion.div initial={{ opacity: 0, filter: "blur(2px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.22 }}>
          {preview(p, loaded.data as T)}
        </motion.div>
      )
    }
    if (loaded?.page === p && loaded.state === "failed") return <p className="text-xs text-muted-foreground">This page didn't load. Point at it again to retry.</p>
    return <Skeleton />
  }

  // A narrow row shows one page either side of the current one instead of two, so it always fits.
  React.useLayoutEffect(() => {
    const el = nav.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 420))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    const t = timers.current
    return () => {
      window.clearTimeout(t.show)
      window.clearTimeout(t.hide)
    }
  }, [])

  function setPeek(next: Peek | null) {
    peeking.current = next
    setPeekState(next)
  }

  function go(next: number) {
    const p = clamp(Math.round(next), 1, pages)
    setPeek(null)
    if (p === page) return
    setOwn(p)
    onPageChange?.(p)
  }

  /** Shows the card for a page. The first one waits a beat, so sweeping past the row doesn't flash it. */
  function show(next: Peek, now = false) {
    if (!now && pressed.current) return
    window.clearTimeout(timers.current.hide)
    window.clearTimeout(timers.current.show)
    if (next.page === page) return hide(0)
    if (now || peeking.current) setPeek(next)
    else timers.current.show = window.setTimeout(() => setPeek(next), 90)
  }

  function hide(delay = 140) {
    window.clearTimeout(timers.current.show)
    window.clearTimeout(timers.current.hide)
    timers.current.hide = window.setTimeout(() => setPeek(null), delay)
  }

  /** Closes the card only if it's showing for this element: another button losing focus shouldn't close it. */
  function hideFor(el: HTMLElement) {
    if (peeking.current?.el === el) hide(0)
  }

  const peekers: Peeking = { show, hide, hideFor, hovered, setHovered, id }
  const near = compact ? 1 : 2 // pages shown either side of the current one

  /** Where a slot sits in the row, ignoring any slide it's in the middle of. */
  function slot(key: string) {
    const el = row.current?.querySelector<HTMLElement>(`[data-slot="${key}"]`)
    return el ? { x: el.offsetLeft, w: el.offsetWidth } : null
  }

  // The current page's pill moves to the new page; the numbers slide in under it.
  React.useLayoutEffect(() => {
    const box = slot(`p${page}`)
    if (!box) return
    if (!placed.current || reduce) {
      cur.x.jump(box.x)
      cur.w.jump(box.w)
    } else {
      animate(cur.x, box.x, { type: "spring", duration: 0.45, bounce: 0.12 })
      animate(cur.w, box.w, { type: "spring", duration: 0.45, bounce: 0.12 })
    }
    placed.current = true
  }, [page, pages, near]) // eslint-disable-line react-hooks/exhaustive-deps

  // The hover highlight glides from slot to slot, and fades when the pointer leaves the row.
  React.useLayoutEffect(() => {
    const box = hovered ? slot(hovered) : null
    if (!box) {
      animate(over.o, 0, { duration: 0.15 })
      return
    }
    if (over.o.get() < 0.05 || reduce) {
      over.x.jump(box.x)
      over.w.jump(box.w)
    } else {
      animate(over.x, box.x, { type: "spring", duration: 0.3, bounce: 0.1 })
      animate(over.w, box.w, { type: "spring", duration: 0.3, bounce: 0.1 })
    }
    animate(over.o, 1, { duration: 0.12 })
  }, [hovered]) // eslint-disable-line react-hooks/exhaustive-deps
  const range = (n: number) => (total === undefined ? null : ([Math.min((n - 1) * pageSize + 1, total), Math.min(n * pageSize, total)] as const))

  return (
    <MotionConfig reducedMotion="user">
      <nav
        ref={nav}
        aria-label={ariaLabel}
        data-cut="none"
        onPointerDown={(event) => {
          if (event.pointerType === "mouse") pressed.current = { x: event.clientX, y: event.clientY }
        }}
        onPointerMove={(event) => {
          const at = pressed.current
          if (at && Math.hypot(event.clientX - at.x, event.clientY - at.y) > 4) pressed.current = null
        }}
        onPointerLeave={() => {
          hide()
          setHovered(null)
          pressed.current = null
        }}
        className={cn("@container relative w-full text-sm", className)}
      >
        {/* Two rows that never reflow as you page: the ways to move on top, where you are and rows per page below. */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div ref={row} className="relative flex items-center gap-0.5">
              {/* Drawn first and every slot is positioned, so the numbers always paint above both pills. */}
              <motion.span aria-hidden="true" className="pointer-events-none absolute top-0 left-0 h-8 rounded-[8px] bg-muted" style={{ x: over.x, width: over.w, opacity: over.o }} />
              <motion.span aria-hidden="true" className={cn("pointer-events-none absolute top-0 left-0 h-8 rounded-[8px]", RAISED)} style={{ x: cur.x, width: cur.w }}>
                <span
                  className="absolute inset-0 rounded-[inherit] p-[1.5px] [mask-clip:content-box,border-box] [mask-composite:exclude] [mask-image:linear-gradient(#000_0_0),linear-gradient(#000_0_0)]"
                  style={{ background: `radial-gradient(26px circle at 50% 0%, ${LIGHT}, transparent 75%)` }}
                />
              </motion.span>
              <Step kind="first" to={1} disabled={page === 1} onGo={go} peekers={peekers} />
              <Step kind="prev" to={page - 1} disabled={page === 1} onGo={go} peekers={peekers} />
              <AnimatePresence mode="popLayout" initial={false}>
                {slotsFor(page, pages, near).map((slot) =>
                  slot.kind === "page" ? (
                    <PageNumber key={`p${slot.n}`} n={slot.n} current={slot.n === page} onGo={go} peekers={peekers} />
                  ) : (
                    <Gap key={`gap-${slot.side}`} side={slot.side} from={slot.from} to={slot.to} jump={clamp(slot.side === "end" ? page + 5 : page - 5, slot.from, slot.to)} onGo={go} peekers={peekers} />
                  ),
                )}
              </AnimatePresence>
              <Step kind="next" to={page + 1} disabled={page === pages} onGo={go} peekers={peekers} />
              <Step kind="last" to={pages} disabled={page === pages} onGo={go} peekers={peekers} />
            </div>
            {/* Only when some pages are hidden; with every page in the row there's nowhere else to go. */}
            {pages > 2 * near + 5 && <GoTo pages={pages} onGo={go} peekers={peekers} />}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <Showing page={page} pages={pages} pageSize={pageSize} total={total} dir={dir} />
            {pageSizes && pageSizes.length > 1 && <Sizes sizes={pageSizes} value={pageSize} onChange={(size) => onPageSizeChange?.(size)} />}
          </div>
        </div>
        <PeekCard peek={peek} nav={nav} range={range} content={preview ? content : undefined} />
      </nav>
    </MotionConfig>
  )
}

/** The slots in the row: the first page, the last, the current one with its neighbours, and a gap for the rest. */
function slotsFor(page: number, pages: number, near: number): Slot[] {
  const run = (a: number, b: number): Slot[] => Array.from({ length: b - a + 1 }, (_, i) => ({ kind: "page", n: a + i }))
  const width = 2 * near + 5
  if (pages <= width) return run(1, pages)
  if (page <= near + 3) return [...run(1, width - 2), { kind: "gap", side: "end", from: width - 1, to: pages - 1 }, ...run(pages, pages)]
  if (page >= pages - near - 2) return [...run(1, 1), { kind: "gap", side: "start", from: 2, to: pages - width + 2 }, ...run(pages - width + 3, pages)]
  return [...run(1, 1), { kind: "gap", side: "start", from: 2, to: page - near - 1 }, ...run(page - near, page + near), { kind: "gap", side: "end", from: page + near + 1, to: pages - 1 }, ...run(pages, pages)]
}

/** A page number. The current one sits on the raised pill, which glides to it from the last page. */
function PageNumber({ n, current, onGo, peekers }: { n: number; current: boolean; onGo: (page: number) => void; peekers: Peeking }) {
  const key = `p${n}`
  return (
    <motion.button
      layout="position"
      type="button"
      data-slot={key}
      aria-label={`Page ${n}`}
      aria-current={current ? "page" : undefined}
      onClick={() => onGo(n)}
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return
        peekers.setHovered(key)
        peekers.show({ page: n, el: event.currentTarget })
      }}
      onFocus={(event) => event.currentTarget.matches(":focus-visible") && peekers.show({ page: n, el: event.currentTarget }, true)}
      onBlur={(event) => peekers.hideFor(event.currentTarget)}
      {...blurIn}
      transition={{ layout: glide, duration: 0.2 }}
      className={cn("relative h-8 min-w-8 shrink-0 rounded-[8px] px-1.5 text-[13px] font-medium tabular-nums outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50", current ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
    >
      {n}
    </motion.button>
  )
}

/**
 * A gap, for the pages that don't fit. Click it to jump five pages that way, or drag across it to browse the pages
 * inside; the card follows along and you land where you let go.
 */
function Gap({ side, from, to, jump, onGo, peekers }: { side: "start" | "end"; from: number; to: number; jump: number; onGo: (page: number) => void; peekers: Peeking }) {
  const key = `gap-${side}`
  const [scrubbing, setScrubbing] = React.useState(false)
  const drag = React.useRef<{ x: number; moved: boolean; page: number } | null>(null)
  const hint = `Drag across to browse ${from.toLocaleString("en-US")}–${to.toLocaleString("en-US")}`
  return (
    <motion.button
      layout="position"
      type="button"
      data-slot={key}
      aria-label={`Jump to page ${jump}`}
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return
        peekers.setHovered(key)
        if (!drag.current) peekers.show({ page: jump, el: event.currentTarget, hint })
      }}
      onFocus={(event) => event.currentTarget.matches(":focus-visible") && peekers.show({ page: jump, el: event.currentTarget, hint }, true)}
      onBlur={(event) => peekers.hideFor(event.currentTarget)}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        drag.current = { x: event.clientX, moved: false, page: jump }
      }}
      onPointerMove={(event) => {
        const d = drag.current
        if (!d) return
        const dx = event.clientX - d.x
        if (!d.moved && Math.abs(dx) < 3) return
        if (!d.moved) {
          d.moved = true
          setScrubbing(true)
        }
        d.page = clamp(jump + Math.round(dx / 6), from, to)
        peekers.show({ page: d.page, el: event.currentTarget, x: event.clientX, hint: "Let go to open it", fast: true }, true)
      }}
      onPointerUp={() => {
        const d = drag.current
        drag.current = null
        setScrubbing(false)
        if (d) onGo(d.moved ? d.page : jump)
      }}
      onPointerCancel={() => {
        drag.current = null
        setScrubbing(false)
      }}
      // Pointer clicks are handled on release; this is for Enter and Space.
      onClick={(event) => event.detail === 0 && onGo(jump)}
      {...blurIn}
      transition={{ layout: glide, duration: 0.2 }}
      className="relative flex h-8 min-w-8 shrink-0 cursor-ew-resize touch-none items-center justify-center rounded-[8px] px-1.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex items-center gap-[3px]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-[3px] rounded-full bg-current"
            animate={{ x: scrubbing ? (i - 1) * 2.5 : 0, scale: scrubbing && i === 1 ? 1.7 : 1, backgroundColor: scrubbing && i === 1 ? LIGHT : "currentColor" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
          />
        ))}
      </span>
    </motion.button>
  )
}

/** First, previous, next or last. The arrows nudge toward where they go, and the card shows the page they lead to. */
function Step({ kind, to, disabled, onGo, peekers }: { kind: "first" | "prev" | "next" | "last"; to: number; disabled: boolean; onGo: (page: number) => void; peekers: Peeking }) {
  const back = kind === "first" || kind === "prev"
  const double = kind === "first" || kind === "last"
  const label = { first: "First page", prev: "Previous page", next: "Next page", last: "Last page" }[kind]
  return (
    <motion.button
      type="button"
      data-slot={kind}
      aria-label={label}
      onClick={() => onGo(to)}
      disabled={disabled}
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return
        peekers.setHovered(kind)
        peekers.show({ page: to, el: event.currentTarget })
      }}
      onFocus={(event) => event.currentTarget.matches(":focus-visible") && peekers.show({ page: to, el: event.currentTarget }, true)}
      onBlur={(event) => peekers.hideFor(event.currentTarget)}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap="tap"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-[8px] text-foreground outline-none transition-opacity focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-35",
        double && "@max-[30rem]:hidden",
      )}
    >
      <svg viewBox="0 0 16 16" className={cn("size-4", back && "rotate-180")} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {double ? (
          <>
            <motion.path d="M3.5 3.5 8 8l-4.5 4.5" variants={{ rest: { x: 0 }, hover: { x: -1 }, tap: { x: -1 } }} />
            <motion.path d="M8.5 3.5 13 8l-4.5 4.5" variants={{ rest: { x: 0 }, hover: { x: 1.5 }, tap: { x: 3 } }} />
          </>
        ) : (
          <motion.path d="M6 3.5 10.5 8 6 12.5" variants={{ rest: { x: 0 }, hover: { x: 2 }, tap: { x: 4 } }} />
        )}
      </svg>
    </motion.button>
  )
}

/** Go to: type a page and the card shows it before you press Enter. */
function GoTo({ pages, onGo, peekers }: { pages: number; onGo: (page: number) => void; peekers: Peeking }) {
  const [text, setText] = React.useState("")
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      Go to
      <input
        value={text}
        onChange={(event) => {
          const next = event.target.value.replace(/\D/g, "").slice(0, String(pages).length)
          setText(next)
          if (next) peekers.show({ page: clamp(Number(next), 1, pages), el: event.currentTarget }, true)
          else peekers.hide(0)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && text) {
            event.preventDefault()
            onGo(clamp(Number(text), 1, pages))
            setText("")
          } else if (event.key === "Escape") {
            setText("")
            peekers.hide(0)
          }
        }}
        onBlur={(event) => peekers.hideFor(event.currentTarget)}
        inputMode="numeric"
        aria-label={`Go to page, 1 to ${pages}`}
        placeholder="Page"
        className={cn(
          "h-8 w-16 rounded-[8px] px-2 text-center text-[13px] font-medium text-foreground tabular-nums outline-none transition-shadow placeholder:font-normal placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-[color-mix(in_oklab,var(--kf-accent,#3b82f6)_55%,transparent)]",
          RAISED,
        )}
      />
    </label>
  )
}

/** The card: it rises above what you point at, glides along as you move, and swaps pages in the direction you went. */
function PeekCard({ peek, nav, range, content }: { peek: Peek | null; nav: React.RefObject<HTMLElement | null>; range: (page: number) => readonly [number, number] | null; content?: (page: number) => React.ReactNode }) {
  const reduce = useReducedMotion() ?? false
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const caret = useMotionValue(CARD / 2)
  const open = React.useRef(false)
  const [{ seen, dir }, setSeen] = React.useState({ seen: peek?.page ?? 0, dir: 1 })
  if (peek && peek.page !== seen) setSeen({ seen: peek.page, dir: Math.sign(peek.page - seen) || 1 })

  React.useLayoutEffect(() => {
    if (!peek || !nav.current) {
      open.current = false
      return
    }
    const box = nav.current.getBoundingClientRect()
    const r = peek.el.getBoundingClientRect()
    const center = (peek.x ?? r.left + r.width / 2) - box.left
    const left = clamp(center - CARD / 2, 0, Math.max(0, box.width - CARD))
    const targets: [MotionValue<number>, number][] = [
      [x, left],
      [y, r.top - box.top],
      [caret, clamp(center - left, 14, CARD - 14)],
    ]
    // A fresh card appears in place; once it's open it glides to each new page.
    for (const [value, to] of targets) {
      if (!open.current || reduce) value.jump(to)
      else animate(value, to, glide)
    }
    open.current = true
  }, [peek, nav, x, y, caret, reduce])

  const r = peek ? range(peek.page) : null
  const body = peek && (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-foreground">Page {peek.page.toLocaleString("en-US")}</span>
        {r && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {r[0].toLocaleString("en-US")}–{r[1].toLocaleString("en-US")}
          </span>
        )}
      </div>
      {content && <div className="mt-2.5 border-t border-border/70 pt-2.5">{content(peek.page)}</div>}
      {peek.hint && <p className="mt-2 text-[11.5px] leading-snug text-muted-foreground">{peek.hint}</p>}
    </>
  )
  return (
    <AnimatePresence>
      {peek && (
        <motion.div
          key="peek"
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-30"
          style={{ x, y, width: CARD }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          transition={{ duration: 0.16 }}
        >
          <div className="-translate-y-full pb-2.5">
            <motion.div
              className="relative rounded-[10px] bg-card p-3 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.22),0_2px_6px_rgb(0_0_0/0.05)] ring-1 ring-black/8 dark:shadow-[0_12px_32px_-12px_rgb(0_0_0/0.8)] dark:ring-white/10"
              initial={reduce ? false : { y: 6, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              style={{ transformOrigin: "50% 100%" }}
            >
              {/* Pages swap with a short slide, except while you drag across a gap: then they swap at once. */}
              {peek.fast ? (
                <div key={peek.page}>{body}</div>
              ) : (
                <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                  <motion.div
                    key={peek.page}
                    custom={dir}
                    variants={{
                      enter: (k: number) => ({ opacity: 0, x: 10 * k, filter: "blur(3px)" }),
                      center: { opacity: 1, x: 0, filter: "blur(0px)" },
                      exit: (k: number) => ({ opacity: 0, x: -10 * k, filter: "blur(3px)" }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", duration: 0.28, bounce: 0 }}
                  >
                    {body}
                  </motion.div>
                </AnimatePresence>
              )}
              <motion.span className="absolute -bottom-[5px] -ml-[5px] size-2.5 rotate-45 border-r border-b border-black/8 bg-card dark:border-white/10" style={{ left: caret }} />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Three quiet rows standing in for a page that's still on its way. */
function Skeleton() {
  return (
    <div aria-hidden="true" className="space-y-1.5">
      {[0.62, 0.48, 0.55].map((w, i) => (
        <div key={i} className="flex h-[18px] items-center gap-2">
          <span className="size-1.5 shrink-0 rounded-full bg-muted" />
          <motion.span
            className="h-2 rounded-full bg-muted"
            style={{ width: `${w * 100}%` }}
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
          />
          <span className="ml-auto h-2 w-10 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}

/** "Showing 21–30 of 240", or "Page 8 of 300" without a total; the numbers roll the way the page moved. */
function Showing({ page, pages, pageSize, total, dir }: { page: number; pages: number; pageSize: number; total?: number; dir: number }) {
  if (total === undefined)
    return (
      <p aria-live="polite" className="text-muted-foreground tabular-nums">
        Page{" "}
        <span className="font-medium text-foreground">
          <Roll value={page} dir={dir} />
        </span>{" "}
        of <span className="font-medium text-foreground">{pages.toLocaleString("en-US")}</span>
      </p>
    )
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return (
    <p aria-live="polite" className="text-muted-foreground tabular-nums">
      Showing{" "}
      <span className="font-medium text-foreground">
        <Roll value={from} dir={dir} />–<Roll value={to} dir={dir} />
      </span>{" "}
      of <span className="font-medium text-foreground">{total.toLocaleString("en-US")}</span>
    </p>
  )
}

/** A number whose changed digits roll in from below (or above, going back). */
function Roll({ value, dir }: { value: number; dir: number }) {
  const digits = String(value).split("")
  return (
    <span className="inline-flex overflow-hidden align-bottom">
      {digits.map((d, i) => (
        <span key={digits.length - i} className="relative inline-block">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.span
              key={d}
              custom={dir}
              className="inline-block"
              variants={{ enter: (k: number) => ({ y: `${80 * k}%`, opacity: 0 }), center: { y: "0%", opacity: 1 }, exit: (k: number) => ({ y: `${-80 * k}%`, opacity: 0 }) }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", duration: 0.38, bounce: 0.12 }}
            >
              {d}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}

/** Rows per page, as a small switch with a sliding pill. */
function Sizes({ sizes, value, onChange }: { sizes: number[]; value: number; onChange: (size: number) => void }) {
  const id = React.useId()
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div role="radiogroup" aria-label="Rows per page" className="relative flex items-center rounded-lg bg-muted p-0.5">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            role="radio"
            aria-checked={size === value}
            onClick={() => onChange(size)}
            className="relative h-7 min-w-8 rounded-md px-2 text-xs font-medium tabular-nums outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-checked:text-foreground"
          >
            {size === value && <motion.span layoutId={`${id}-size`} transition={{ type: "spring", duration: 0.4, bounce: 0.15 }} className="absolute inset-0 rounded-md bg-background shadow-xs" />}
            <span className="relative">{size}</span>
          </button>
        ))}
      </div>
      <span className="text-xs">per page</span>
    </div>
  )
}

/** Wrap the content that belongs to the current page: it slides in from the side you moved toward. */
export function PaginationContent({ page, children, className }: { page: number; children: React.ReactNode; className?: string }) {
  const [{ last, dir }, setMove] = React.useState({ last: page, dir: 1 })
  if (page !== last) setMove({ last: page, dir: Math.sign(page - last) })
  return (
    <MotionConfig reducedMotion="user">
      <div data-cut="none" className={cn("relative", className)}>
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={page}
            custom={dir}
            variants={{
              enter: (k: number) => ({ opacity: 0, x: 22 * k, filter: "blur(5px)" }),
              center: { opacity: 1, x: 0, filter: "blur(0px)" },
              exit: (k: number) => ({ opacity: 0, x: -22 * k, filter: "blur(5px)" }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", duration: 0.42, bounce: 0.1 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
