"use client"

/**
 * RelayBento: a bento grid whose gaps carry the work. Call `send` from one tile to another and a fine light leaves
 * the thing that sent it, runs through the gaps between the tiles (never across them), and lands on the tile that
 * acts on it, which catches the light along its edge and glows softly while it works. Chain a few sends into a story
 * and `useRelayLoop` plays it on its own, over and over, while the grid is on screen: a deploy that builds, checks
 * and goes live, a payment that clears and settles, a message that's sent and answered.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

export type RelayTone = "accent" | "success" | "danger"

/** A tile's id, or something inside a tile: the button that was pressed, the row that's about to change. */
export type RelayTarget = string | Element | null | undefined | { current: Element | null }

export type RelaySendOptions = {
  /** The light's colour: the accent, success for good news, danger for a failure. */
  tone?: RelayTone
  /** How fast the light travels: 2 is twice as fast. */
  pace?: number
  /** Stops the light where it is: it fades out and the send resolves at once. */
  signal?: AbortSignal
  /**
   * Carry the light on past the receiving tile's edge, into the element it was sent to, where it settles as a dot and
   * rings once. The light comes in by the edge nearest that element, so keep the element close to an edge.
   */
  dock?: boolean
}

export type RelayBentoHandle = {
  /** Sends light from one tile to another (or to several at once). Resolves when it lands. */
  send: (from: RelayTarget, to: RelayTarget | RelayTarget[], options?: RelaySendOptions) => Promise<void>
}

const SPEED = 1 // px per ms the light travels at, before a long run is hurried along to fit TRAVEL
const TRAVEL = { min: 280, max: 520 } // ms: the quickest hop across a gap, and the longest run around the grid
const TAIL = 84 // px of light trailing the head (64 for a status light: success or danger)
const DRAIN = 140 // ms the tail takes to pour into the tile it reached
const TRAIL = 180 // ms the route it took stays faintly lit once it lands
const CATCH = 700 // ms the light runs along the catching tile's edge
const NUDGE = 3 // px the tile's contents give way to the light as it lands
const DOCK = 380 // ms a docking light takes to settle into a dot and ring out
const PULL = 6 // how much more a docking light weighs the distance from an edge to its target, so it docks close by
const FLASH = 160 // ms the tile glows brighter as the light lands, before settling while it works
const REACH = 0.42 // of a tile's edge each half of the catch runs along, at most
const FLARE = 260 // ms the edge glows where the light leaves
const LIT = 6000 // ms a tile glows from the catch, at most, if it never sends the light on
const TURN = 34 // px a corner costs when choosing a route, so routes take the fewest turns
const SIDE = 0.55 // px of route each px between the pressed thing and an edge costs, so light leaves the nearest edge
const CURVE = 14 // px: the widest corner a route takes
const STEP = 1 // px between the points a route is drawn through
const FALLBACK: Record<RelayTone, string> = { accent: "#3b82f6", success: "#16a34a", danger: "#ef4444" }

type Point = { x: number; y: number }
type Tile = { el: HTMLElement; x: number; y: number; w: number; h: number; r: number }
type Board = { w: number; h: number; colGap: number; rowGap: number; pad: [number, number, number, number]; tiles: Tile[] }
/** A path sampled every STEP px: xs and ys of each point, and the distance along it to each. */
type Track = { x: Float32Array; y: Float32Array; at: Float32Array; length: number }
type Port = { edge: Point; at: Point; axis: 0 | 1; cost: number }
/**
 * A tone, ready to draw with: its colour, whether it's going on a dark grid, a soft glow and a fine dot to stamp, and
 * whether it's a status light (success, danger), drawn compact and solid so it reads at a glance.
 */
type Paint = { rgb: [number, number, number]; dark: boolean; glow: HTMLCanvasElement; dot: HTMLCanvasElement; solid: boolean }
type Effect = { until: number; draw: (ctx: CanvasRenderingContext2D, now: number) => void }

type RelayContextValue = RelayBentoHandle & { playing: boolean; still: boolean }
const RelayContext = React.createContext<RelayContextValue | null>(null)

/** The relay of the bento around this component: `send(from, to)` runs light from one tile to another. */
export function useRelay(): RelayBentoHandle {
  const relay = React.useContext(RelayContext)
  if (!relay) throw new Error("useRelay must be used inside <RelayBento>")
  return relay
}

/**
 * Plays a story on a loop while the bento is on screen: `story` runs, the grid rests for `rest` ms, and it runs again.
 * When the bento scrolls away or the tab is hidden, `signal` aborts and the light stops; it starts over on return.
 * With reduced motion on, the story plays once, without any light travelling, and stays where it ends.
 */
export function useRelayLoop(story: (signal: AbortSignal) => Promise<void> | void, { rest = 1600 }: { rest?: number } = {}) {
  const relay = React.useContext(RelayContext)
  if (!relay) throw new Error("useRelayLoop must be used inside <RelayBento>")
  const latest = React.useRef(story)
  React.useLayoutEffect(() => {
    latest.current = story
  })
  const { playing, still } = relay
  React.useEffect(() => {
    if (!playing) return
    const run = new AbortController()
    void (async () => {
      while (!run.signal.aborted) {
        await latest.current(run.signal)
        if (still) return
        await pause(rest, run.signal)
      }
    })()
    return () => run.abort()
  }, [playing, still, rest])
}

export type RelayBentoProps = React.ComponentProps<"div"> & {
  ref?: React.Ref<RelayBentoHandle>
}

export function RelayBento({ children, className, ref, ...props }: RelayBentoProps) {
  const root = React.useRef<HTMLDivElement>(null)
  const canvas = React.useRef<HTMLCanvasElement>(null)
  // Everything the light needs between frames, made once: what's playing, what's waiting on it, which tiles glow.
  const engine = React.useRef<Engine>({ root: null, canvas: null, effects: [], frame: 0, pending: new Set(), lit: new Map(), reduce: false })
  const [still, setStill] = React.useState(false)
  const [inView, setInView] = React.useState(false)
  const [shown, setShown] = React.useState(true)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => {
      engine.current.reduce = query.matches
      setStill(query.matches)
    }
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  // A story only plays while enough of the grid is on screen, and the tab is in front.
  React.useEffect(() => {
    const el = root.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 })
    observer.observe(el)
    const visibility = () => setShown(document.visibilityState === "visible")
    visibility()
    document.addEventListener("visibilitychange", visibility)
    return () => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [])

  // The canvas the light is drawn on covers the whole grid, at the screen's own resolution.
  React.useLayoutEffect(() => {
    const el = root.current
    const c = canvas.current
    if (!el || !c) return
    engine.current.root = el
    engine.current.canvas = c
    const size = () => {
      // The screen's own resolution, times how much the grid is scaled on it, so the light stays crisp when the
      // bento is shown zoomed in (and costs less when it's shown small).
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * clamp(zoomOf(el), 0.25, 3)
      c.width = Math.round(el.offsetWidth * dpr)
      c.height = Math.round(el.offsetHeight * dpr)
    }
    size()
    const observer = new ResizeObserver(size)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    const state = engine.current
    return () => {
      cancelAnimationFrame(state.frame)
      state.frame = 0
      // Anything still waiting on a light lands now, so no chain is left hanging.
      for (const done of state.pending) done()
      state.pending.clear()
      for (const timer of state.lit.values()) window.clearTimeout(timer)
      state.lit.clear()
    }
  }, [])

  const send = React.useCallback(async (from: RelayTarget, to: RelayTarget | RelayTarget[], options: RelaySendOptions = {}) => {
    await Promise.all((Array.isArray(to) ? to : [to]).map((t) => relay(engine.current, from, t, options)))
  }, [])

  const value = React.useMemo<RelayContextValue>(() => ({ send, playing: inView && shown, still }), [send, inView, shown, still])
  React.useImperativeHandle(ref, () => ({ send }), [send])

  return (
    <RelayContext.Provider value={value}>
      <div
        ref={root}
        data-relay-bento=""
        className={cn(
          // No frame: the tiles sit straight on the page, and the gaps between them (and the margin around them) are
          // wide enough to read as the channels the light runs through.
          "relative isolate grid gap-4.5 p-4.5 text-foreground",
          className,
        )}
        {...props}
      >
        {children}
        <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 size-full" />
      </div>
    </RelayContext.Provider>
  )
}

/** The light's working state for one bento. */
type Engine = {
  root: HTMLElement | null
  canvas: HTMLCanvasElement | null
  effects: Effect[]
  frame: number
  pending: Set<() => void>
  lit: Map<HTMLElement, number>
  reduce: boolean
}

/** Draws every effect that's playing, and keeps drawing until none are left. */
function paint(engine: Engine) {
  const c = engine.canvas
  const ctx = c?.getContext("2d")
  if (!c || !ctx) {
    engine.frame = 0
    return
  }
  const now = performance.now()
  const dpr = c.width / Math.max(1, engine.root?.offsetWidth ?? 1)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, c.width, c.height)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  for (const fx of engine.effects) fx.draw(ctx, now)
  engine.effects = engine.effects.filter((fx) => fx.until > now)
  engine.frame = engine.effects.length ? requestAnimationFrame(() => paint(engine)) : 0
}

function play(engine: Engine, fx: Effect) {
  engine.effects.push(fx)
  if (!engine.frame) engine.frame = requestAnimationFrame(() => paint(engine))
}

/** A tile glows softly from where the light came in, until it sends the light on (or for LIT ms at most). */
function light(engine: Engine, tile: Tile, at: Point | null, look?: Paint) {
  const el = tile.el
  window.clearTimeout(engine.lit.get(el))
  engine.lit.delete(el)
  if (!at) {
    el.removeAttribute("data-relay-lit")
    return
  }
  el.style.setProperty("--relay-x", `${((at.x - tile.x) / tile.w) * 100}%`)
  el.style.setProperty("--relay-y", `${((at.y - tile.y) / tile.h) * 100}%`)
  if (look) el.style.setProperty("--relay-tint", `rgb(${look.rgb.join(" ")})`)
  el.setAttribute("data-relay-lit", "")
  engine.lit.set(
    el,
    window.setTimeout(() => {
      el.removeAttribute("data-relay-lit")
      engine.lit.delete(el)
    }, LIT),
  )
}

/** One light, from one tile to another: it flares where it leaves, runs the gaps, and is caught where it lands. */
async function relay(engine: Engine, from: RelayTarget, to: RelayTarget, options: RelaySendOptions) {
  const el = engine.root
  if (!el || options.signal?.aborted) return
  const start = resolve(el, from)
  const end = resolve(el, to)
  if (!start || !end) return
  const board = measure(el)
  const a = board.tiles.find((t) => t.el === start.tile)
  const b = board.tiles.find((t) => t.el === end.tile)
  if (!a || !b) return
  const look = paintOf(el, options.tone ?? "accent")
  const now = performance.now()
  const target = anchor(end, el, b)
  const into = nearestOnEdge(b, target)
  const dock = !!options.dock && end.el !== end.tile
  light(engine, a, null)

  // Reduced motion: nothing travels. The tile that acts on it simply glows along its edge for a moment.
  if (engine.reduce) {
    const edge = rim(b)
    play(engine, { until: now + 420, draw: (ctx, t) => glowEdge(ctx, edge, look, 1 - (t - now) / 420) })
    light(engine, b, dock ? target : into, look)
    return
  }

  const route = a === b ? null : plan(board, a, anchor(start, el, a), b, target, dock ? PULL : 1)
  const land = rim(b)
  if (!route) {
    if (dock) dockAt(engine, target, look, now)
    else catchAt(engine, land, b, into, look, now)
    light(engine, b, dock ? target : into, look)
    return
  }
  const free = gaps(board)
  if (dock) {
    // Past the edge, the light runs on into the tile to its target, through a narrow lane cut out for it.
    const edge = route[route.length - 1]
    const lane = 9
    const x0 = Math.max(b.x + 0.5, Math.min(edge.x, target.x) - lane)
    const x1 = Math.min(b.x + b.w - 0.5, Math.max(edge.x, target.x) + lane)
    const y0 = Math.max(b.y + 0.5, Math.min(edge.y, target.y) - lane)
    const y1 = Math.min(b.y + b.h - 0.5, Math.max(edge.y, target.y) + lane)
    free.rect(x0, y0, x1 - x0, y1 - y0)
    route.push(target)
  }
  const path = track(simplify(route), Math.min(CURVE, Math.max(board.colGap, board.rowGap)))
  const duration = clamp(path.length / (SPEED * (options.pace ?? 1)), TRAVEL.min, TRAVEL.max)
  const arrive = route[route.length - 1]

  // The edge it leaves from glows, and the light sets off a beat later.
  const leave = rim(a)
  const leaveAt = nearest(leave, route[0])
  play(engine, { until: now + FLARE, draw: (ctx, t) => flare(ctx, leave, leaveAt, look, (t - now) / FLARE) })
  const t0 = now + 70
  await new Promise<void>((done) => {
    let stopped = -1 // when an abort stopped the light, so it can fade out where it is
    const finish = () => {
      engine.pending.delete(finish)
      options.signal?.removeEventListener("abort", stop)
      done()
    }
    const stop = () => {
      stopped = performance.now()
      finish()
    }
    engine.pending.add(finish)
    options.signal?.addEventListener("abort", stop, { once: true })
    let landed = false
    const fx: Effect = {
      until: t0 + duration + Math.max(DRAIN, TRAIL),
      draw: (ctx, t) => {
        if (stopped >= 0) {
          const k = 1 - (t - stopped) / 180
          if (k <= 0) return void (fx.until = 0)
          comet(ctx, path, free, look, travel(clamp((stopped - t0) / duration, 0, 1)), 0, k, 0)
          return
        }
        const u = clamp((t - t0) / duration, 0, 1)
        if (u >= 1 && !landed) {
          landed = true
          if (dock) dockAt(engine, arrive, look, t)
          else catchAt(engine, land, b, arrive, look, t)
          light(engine, b, arrive, look)
          finish()
        }
        comet(ctx, path, free, look, travel(u), clamp((t - t0 - duration) / DRAIN, 0, 1), 1, clamp((t - t0 - duration) / TRAIL, 0, 1))
      },
    }
    play(engine, fx)
  })
}

export type RelayTileProps = Omit<React.ComponentProps<"div">, "id" | "title"> & {
  /** What `send` calls this tile. */
  id: string
  /** A short name for what the tile shows, set under it. */
  title?: React.ReactNode
  /** A line or two about it. */
  description?: React.ReactNode
  /** Put the title and description beside the picture, on the left, whenever the tile is wide (36rem or more). */
  side?: boolean
}

/** One tile. Whatever you put in it is the picture; the title and description sit underneath (or beside it). */
export function RelayTile({ id, title, description, side, children, className, ...props }: RelayTileProps) {
  const label = React.useId()
  return (
    <div
      role="group"
      aria-labelledby={title ? label : undefined}
      data-relay-tile={id}
      className={cn(
        "group/relay @container/relay relative isolate flex min-w-0 flex-col overflow-hidden rounded-[20px] border text-foreground",
        // The tile's fill follows your theme; set --relay-tile on the bento (or a parent) to choose your own.
        "border-[color-mix(in_oklab,var(--border)_88%,var(--background))] bg-[var(--relay-tile,color-mix(in_oklab,var(--muted)_62%,var(--background)))]",
        "dark:border-white/[0.06] dark:bg-[var(--relay-tile,color-mix(in_oklab,var(--muted)_92%,var(--background)))]",
        className,
      )}
      {...props}
    >
      {/* Where the light came in, the tile flashes as it lands, then glows faintly while it works. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-700 ease-out group-data-[relay-lit]/relay:opacity-100"
        style={{ background: "radial-gradient(120% 95% at var(--relay-x, 50%) var(--relay-y, 50%), color-mix(in oklab, var(--relay-tint, var(--kf-accent, #3b82f6)) 5%, transparent), transparent 62%)" }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 ease-out group-data-[relay-flash]/relay:opacity-100 group-data-[relay-flash]/relay:duration-100"
        style={{ background: "radial-gradient(90% 75% at var(--relay-x, 50%) var(--relay-y, 50%), color-mix(in oklab, var(--relay-tint, var(--kf-accent, #3b82f6)) 14%, transparent), transparent 60%)" }}
      />
      <div data-relay-body="" className={cn("relative flex min-h-0 flex-1 flex-col", side && "@min-[36rem]/relay:flex-row-reverse")}>
        <div className="relative min-h-0 min-w-0 flex-1">{children}</div>
        {(title || description) && (
          <div className={cn("relative px-5 pt-1 pb-5", side && "@min-[36rem]/relay:flex @min-[36rem]/relay:w-[38%] @min-[36rem]/relay:max-w-[280px] @min-[36rem]/relay:shrink-0 @min-[36rem]/relay:flex-col @min-[36rem]/relay:justify-end")}>
            {title && (
              <h3 id={label} className="text-[16px] leading-[22px] font-medium tracking-[-0.012em] text-foreground">
                {title}
              </h3>
            )}
            {description && (
              <p data-relay-description="" className="mt-1 max-w-[44ch] text-[14px] leading-5 text-pretty text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------------------------
   Where things are: the tiles, the gaps between them, and the route light takes through those gaps.
   ------------------------------------------------------------------------------------------------------------------ */

function resolve(root: HTMLElement, target: RelayTarget): { tile: HTMLElement; el: Element } | null {
  const el = typeof target === "string" ? root.querySelector(`[data-relay-tile="${CSS.escape(target)}"]`) : target && "current" in target ? target.current : target
  if (!el) return null
  const tile = el.closest<HTMLElement>("[data-relay-tile]")
  if (!tile || tile.closest("[data-relay-bento]") !== root) return null
  return { tile, el }
}

function measure(root: HTMLElement): Board {
  const box = root.getBoundingClientRect()
  const k = zoomOf(root, box)
  const style = getComputedStyle(root)
  const px = (v: string) => parseFloat(v) || 0
  const tiles = Array.from(root.querySelectorAll<HTMLElement>("[data-relay-tile]"))
    .filter((el) => el.closest("[data-relay-bento]") === root && el.offsetParent !== null)
    .map((el) => {
      const r = el.getBoundingClientRect()
      return { el, x: (r.left - box.left) / k, y: (r.top - box.top) / k, w: r.width / k, h: r.height / k, r: px(getComputedStyle(el).borderTopLeftRadius) }
    })
  return {
    w: box.width / k,
    h: box.height / k,
    colGap: px(style.columnGap),
    rowGap: px(style.rowGap),
    pad: [px(style.paddingTop), px(style.paddingRight), px(style.paddingBottom), px(style.paddingLeft)],
    tiles,
  }
}

/** How much the grid is scaled on screen (by a transform on it or around it), so the light is drawn in its own px. */
function zoomOf(root: HTMLElement, box = root.getBoundingClientRect()) {
  return root.offsetWidth > 0 ? box.width / root.offsetWidth || 1 : 1
}

/** Where on its tile a target sits: the middle of the element, or of the tile itself. */
function anchor(target: { tile: HTMLElement; el: Element }, root: HTMLElement, tile: Tile): Point {
  if (target.el === target.tile) return { x: tile.x + tile.w / 2, y: tile.y + tile.h / 2 }
  const box = root.getBoundingClientRect()
  const k = zoomOf(root, box)
  const r = target.el.getBoundingClientRect()
  return { x: (r.left - box.left + r.width / 2) / k, y: (r.top - box.top + r.height / 2) / k }
}

/** The centre lines of every gap: between neighbouring tiles, and the margin around them all. */
function channels(board: Board) {
  const [top, right, bottom, left] = board.pad
  const xs = [left / 2, board.w - right / 2]
  const ys = [top / 2, board.h - bottom / 2]
  for (const a of board.tiles)
    for (const b of board.tiles) {
      if (a === b) continue
      const dx = b.x - (a.x + a.w)
      if (dx > 0.5 && dx < board.colGap * 1.6 + 1 && overlap(a.y, a.y + a.h, b.y, b.y + b.h) > 1) xs.push(a.x + a.w + dx / 2)
      const dy = b.y - (a.y + a.h)
      if (dy > 0.5 && dy < board.rowGap * 1.6 + 1 && overlap(a.x, a.x + a.w, b.x, b.x + b.w) > 1) ys.push(a.y + a.h + dy / 2)
    }
  return { xs: dedupe(xs), ys: dedupe(ys) }
}

/** The places light can leave or enter a tile: one on each edge that has a gap beside it, level with the anchor. */
function portsOf(board: Board, xs: number[], ys: number[], tile: Tile, at: Point, pull = 1): Port[] {
  const ports: Port[] = []
  const keep = tile.r + 6
  const y = tile.h > keep * 2 ? clamp(at.y, tile.y + keep, tile.y + tile.h - keep) : tile.y + tile.h / 2
  const x = tile.w > keep * 2 ? clamp(at.x, tile.x + keep, tile.x + tile.w - keep) : tile.x + tile.w / 2
  const reachX = Math.max(board.colGap, board.pad[1], board.pad[3]) * 0.75 + 1
  const reachY = Math.max(board.rowGap, board.pad[0], board.pad[2]) * 0.75 + 1
  const right = xs.find((v) => v > tile.x + tile.w && v - (tile.x + tile.w) < reachX)
  const left = [...xs].reverse().find((v) => v < tile.x && tile.x - v < reachX)
  const below = ys.find((v) => v > tile.y + tile.h && v - (tile.y + tile.h) < reachY)
  const above = [...ys].reverse().find((v) => v < tile.y && tile.y - v < reachY)
  const k = SIDE * pull
  if (right !== undefined) ports.push({ edge: { x: tile.x + tile.w, y }, at: { x: right, y }, axis: 0, cost: (tile.x + tile.w - at.x) * k })
  if (left !== undefined) ports.push({ edge: { x: tile.x, y }, at: { x: left, y }, axis: 0, cost: (at.x - tile.x) * k })
  if (below !== undefined) ports.push({ edge: { x, y: tile.y + tile.h }, at: { x, y: below }, axis: 1, cost: (tile.y + tile.h - at.y) * k })
  if (above !== undefined) ports.push({ edge: { x, y: tile.y }, at: { x, y: above }, axis: 1, cost: (at.y - tile.y) * k })
  return ports
}

/**
 * The route light takes from one tile to another: out of the edge nearest the thing that sent it, along the gaps with
 * as few turns as it can, and into the edge nearest the thing that receives it. Corner points, edge to edge.
 */
function plan(board: Board, from: Tile, fromAt: Point, to: Tile, toAt: Point, pull = 1): Point[] | null {
  const { xs, ys } = channels(board)
  const starts = portsOf(board, xs, ys, from, fromAt)
  const ends = portsOf(board, xs, ys, to, toAt, pull)
  if (!starts.length || !ends.length) return null

  // Every crossing of two gaps is a stop, and so is every port.
  const nodes: Point[] = []
  const index = new Map<string, number>()
  const add = (p: Point) => {
    const key = `${p.x.toFixed(1)}:${p.y.toFixed(1)}`
    let i = index.get(key)
    if (i === undefined) {
      i = nodes.push(p) - 1
      index.set(key, i)
    }
    return i
  }
  for (const x of xs) for (const y of ys) if (open(board, x, y)) add({ x, y })
  const startAt = starts.map((p) => add(p.at))
  const endAt = ends.map((p) => add(p.at))

  // Neighbouring stops along a gap are joined, as long as no tile is in the way.
  const links: number[][] = nodes.map(() => [])
  const join = (along: "x" | "y", lines: number[]) => {
    const across = along === "x" ? "y" : "x"
    for (const line of lines) {
      const on = nodes.map((p, i) => ({ p, i })).filter(({ p }) => Math.abs(p[along] - line) < 0.6)
      on.sort((m, n) => m.p[across] - n.p[across])
      for (let k = 1; k < on.length; k++) {
        const m = on[k - 1]
        const n = on[k]
        if (clear(board, along, line, m.p[across], n.p[across])) {
          links[m.i].push(n.i)
          links[n.i].push(m.i)
        }
      }
    }
  }
  join("x", xs)
  join("y", ys)

  // Shortest route, counting each corner as a little extra distance. A state is a stop and the way light arrived.
  const states = nodes.length * 2
  const cost = new Float64Array(states).fill(Infinity)
  const prev = new Int32Array(states).fill(-1)
  const done = new Uint8Array(states)
  starts.forEach((p, k) => {
    const s = startAt[k] * 2 + p.axis
    const c = p.cost + dist(p.edge, p.at)
    if (c < cost[s]) cost[s] = c
  })
  for (;;) {
    let s = -1
    for (let k = 0; k < states; k++) if (!done[k] && cost[k] < Infinity && (s < 0 || cost[k] < cost[s])) s = k
    if (s < 0) break
    done[s] = 1
    const i = s >> 1
    const axis = s & 1
    for (const j of links[i]) {
      const move = Math.abs(nodes[i].y - nodes[j].y) < 0.6 ? 0 : 1
      const next = j * 2 + move
      const c = cost[s] + dist(nodes[i], nodes[j]) + (move === axis ? 0 : TURN)
      if (c < cost[next]) {
        cost[next] = c
        prev[next] = s
      }
    }
  }

  let best = Infinity
  let last = -1
  let into: Port | null = null
  ends.forEach((p, k) => {
    for (const axis of [0, 1]) {
      const s = endAt[k] * 2 + axis
      const c = cost[s] + (axis === p.axis ? 0 : TURN) + p.cost + dist(p.at, p.edge)
      if (c < best) {
        best = c
        last = s
        into = p
      }
    }
  })
  if (last < 0 || !into) return null

  const stops: Point[] = []
  for (let s = last; s >= 0; s = prev[s]) stops.unshift(nodes[s >> 1])
  const out = starts.find((p) => Math.abs(p.at.x - stops[0].x) < 0.6 && Math.abs(p.at.y - stops[0].y) < 0.6)
  if (!out) return null
  return simplify([out.edge, ...stops, (into as Port).edge])
}

function open(board: Board, x: number, y: number) {
  return !board.tiles.some((t) => x > t.x + 0.5 && x < t.x + t.w - 0.5 && y > t.y + 0.5 && y < t.y + t.h - 0.5)
}

/** Whether a stretch of gap is free of tiles. */
function clear(board: Board, along: "x" | "y", line: number, from: number, to: number) {
  return !board.tiles.some((t) =>
    along === "x"
      ? line > t.x + 0.5 && line < t.x + t.w - 0.5 && overlap(from, to, t.y + 0.5, t.y + t.h - 0.5) > 0
      : line > t.y + 0.5 && line < t.y + t.h - 0.5 && overlap(from, to, t.x + 0.5, t.x + t.w - 0.5) > 0,
  )
}

/** The gaps as a shape to draw inside: the whole grid, less every tile. */
function gaps(board: Board) {
  const shape = new Path2D()
  shape.rect(0, 0, board.w, board.h)
  for (const t of board.tiles) shape.roundRect(t.x, t.y, t.w, t.h, t.r)
  return shape
}

/** A route drawn through its corners, each rounded as widely as the gap allows, sampled every STEP px. */
function track(points: Point[], curve: number): Track {
  const xs: number[] = []
  const ys: number[] = []
  const push = (x: number, y: number) => {
    xs.push(x)
    ys.push(y)
  }
  const line = (a: Point, b: Point) => {
    const n = Math.max(1, Math.ceil(dist(a, b) / STEP))
    for (let k = 1; k <= n; k++) push(a.x + ((b.x - a.x) * k) / n, a.y + ((b.y - a.y) * k) / n)
  }
  const last = points.length - 1
  const seg = points.slice(1).map((p, i) => dist(points[i], p))
  push(points[0].x, points[0].y)
  let at = points[0]
  for (let i = 1; i <= last; i++) {
    const p = points[i]
    if (i === last) {
      line(at, p)
      break
    }
    // A corner may use the whole of a route's first or last stretch (the short step out of a tile), half of any other.
    const r = Math.min(curve, i === 1 ? seg[0] : seg[i - 1] / 2, i + 1 === last ? seg[i] : seg[i] / 2)
    const d1 = unit(points[i - 1], p)
    const d2 = unit(p, points[i + 1])
    const a = { x: p.x - d1.x * r, y: p.y - d1.y * r }
    line(at, a)
    const n = Math.max(2, Math.ceil((Math.PI / 2) * r / STEP))
    for (let k = 1; k <= n; k++) {
      const th = (k / n) * (Math.PI / 2)
      // Around the corner's centre, from the end of one stretch to the start of the next.
      push(a.x + d2.x * r - d2.x * r * Math.cos(th) + d1.x * r * Math.sin(th), a.y + d2.y * r - d2.y * r * Math.cos(th) + d1.y * r * Math.sin(th))
    }
    at = { x: p.x + d2.x * r, y: p.y + d2.y * r }
  }
  return sampled(xs, ys)
}

/** A tile's edge as a track, clockwise from the top left, along the middle of its 1 px border. */
function rim(t: Tile): Track {
  const o = -0.5
  const r = Math.min(t.r, t.w / 2, t.h / 2) + o
  const [x0, y0, x1, y1] = [t.x - o, t.y - o, t.x + t.w + o, t.y + t.h + o]
  const xs: number[] = []
  const ys: number[] = []
  const arc = (cx: number, cy: number, from: number) => {
    const n = Math.max(2, Math.ceil((Math.PI / 2) * r / STEP))
    for (let k = 0; k <= n; k++) {
      const th = from + (k / n) * (Math.PI / 2)
      xs.push(cx + Math.cos(th) * r)
      ys.push(cy + Math.sin(th) * r)
    }
  }
  const edge = (ax: number, ay: number, bx: number, by: number) => {
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / STEP))
    for (let k = 1; k < n; k++) {
      xs.push(ax + ((bx - ax) * k) / n)
      ys.push(ay + ((by - ay) * k) / n)
    }
  }
  edge(x0 + r, y0, x1 - r, y0)
  arc(x1 - r, y0 + r, -Math.PI / 2)
  edge(x1, y0 + r, x1, y1 - r)
  arc(x1 - r, y1 - r, 0)
  edge(x1 - r, y1, x0 + r, y1)
  arc(x0 + r, y1 - r, Math.PI / 2)
  edge(x0, y1 - r, x0, y0 + r)
  arc(x0 + r, y0 + r, Math.PI)
  return sampled(xs, ys)
}

function sampled(xs: number[], ys: number[]): Track {
  const at = new Float32Array(xs.length)
  for (let k = 1; k < xs.length; k++) at[k] = at[k - 1] + Math.hypot(xs[k] - xs[k - 1], ys[k] - ys[k - 1])
  return { x: Float32Array.from(xs), y: Float32Array.from(ys), at, length: at[at.length - 1] ?? 0 }
}

/** The index of the point on a track nearest to p. */
function nearest(t: Track, p: Point) {
  let best = 0
  let min = Infinity
  for (let k = 0; k < t.x.length; k++) {
    const d = (t.x[k] - p.x) ** 2 + (t.y[k] - p.y) ** 2
    if (d < min) {
      min = d
      best = k
    }
  }
  return best
}

/** The point on a tile's edge nearest to p, for a light that has nowhere to travel. */
function nearestOnEdge(t: Tile, p: Point): Point {
  const d = [p.y - t.y, t.x + t.w - p.x, t.y + t.h - p.y, p.x - t.x]
  const side = d.indexOf(Math.min(...d))
  return [
    { x: p.x, y: t.y },
    { x: t.x + t.w, y: p.y },
    { x: p.x, y: t.y + t.h },
    { x: t.x, y: p.y },
  ][side]
}

/* ------------------------------------------------------------------------------------------------------------------
   The light itself: a comet through the gaps that leaves the route it took faintly lit, a flare where it leaves, and
   a catch that runs both ways along the edge of the tile it lands on. Everything is stamped from two small sprites (a
   soft glow and a fine dot) every half pixel, so the light stays one smooth stroke however it bends.
   ------------------------------------------------------------------------------------------------------------------ */

/** The light leaves its mark briskly and eases into the tile it reaches: cubic-bezier(0.4, 0, 0.2, 1). */
function travel(u: number) {
  if (u <= 0 || u >= 1) return clamp(u, 0, 1)
  // Solve the curve's x for u, then read off its y.
  const bx = (t: number) => 3 * 0.4 * t * (1 - t) ** 2 + 3 * 0.2 * t * t * (1 - t) + t ** 3
  const by = (t: number) => 3 * t * t * (1 - t) + t ** 3
  let lo = 0
  let hi = 1
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (bx(mid) < u) lo = mid
    else hi = mid
  }
  return by((lo + hi) / 2)
}

/**
 * The light `u` of the way along its route: the trail it leaves, its tail and its head. `drained` pours the tail into
 * the tile it reached, `strength` fades all of it (when it's stopped), and `faded` takes the trail away once it lands.
 */
function comet(ctx: CanvasRenderingContext2D, path: Track, free: Path2D, look: Paint, u: number, drained: number, strength: number, faded: number) {
  const head = path.length * u
  const tail = Math.min(look.solid ? 64 : TAIL, head) * (1 - drained)
  ctx.save()
  ctx.clip(free, "evenodd")
  const trail = (1 - faded) ** 1.6 * strength
  if (trail > 0.01) line(ctx, path, 0, head - tail * 0.5, look, (look.dark ? 0.09 : 0.07) * trail)
  if (tail > 0.5) streak(ctx, path, head - tail, head, look, strength, 1)
  if (drained < 1) bead(ctx, path, head, look, strength * (1 - drained))
  ctx.restore()
}

/** A faint, even line along a track: the route the light has taken. */
function line(ctx: CanvasRenderingContext2D, t: Track, from: number, to: number, look: Paint, alpha: number) {
  if (to - from < 1 || alpha <= 0.002) return
  ctx.globalCompositeOperation = look.dark ? "lighter" : "source-over"
  ctx.globalAlpha = alpha
  for (let s = Math.max(0, from); s <= to; s += 0.75) {
    const p = point(t, s)
    ctx.drawImage(look.dot, p.x - 1.1, p.y - 1.1, 2.2, 2.2)
  }
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = "source-over"
}

/**
 * A stretch of light along a track, from `from` to `to` px: brightest at the front (`to`, or `from` when `dir` is -1)
 * and fading to nothing at the back, a soft glow under a fine bright line. On a closed track (a tile's edge) the
 * distances wrap around, so a stretch can run past where the edge starts.
 */
function streak(ctx: CanvasRenderingContext2D, t: Track, from: number, to: number, look: Paint, strength: number, dir: 1 | -1, closed = false) {
  const len = to - from
  if (len <= 0.5 || strength <= 0.002) return
  const at = (s: number) => point(t, closed ? ((s % t.length) + t.length) % t.length : s)
  const fade = (s: number) => (dir === 1 ? (s - from) / len : (to - s) / len)
  ctx.globalCompositeOperation = look.dark ? "lighter" : "source-over"
  // A 24 px glow that builds to about 0.28 at the front (a tighter 12 px one for a status light), under a 3 px core
  // that's nearly solid there.
  const glow = look.solid ? 0.034 : look.dark ? 0.04 : 0.03
  const g = look.solid ? 6 : 12
  for (let s = from; s <= to; s += 2) {
    const p = at(s)
    ctx.globalAlpha = glow * strength * fade(s) ** 1.5
    ctx.drawImage(look.glow, p.x - g, p.y - g, g * 2, g * 2)
  }
  for (let s = from; s <= to; s += 0.5) {
    const p = at(s)
    ctx.globalAlpha = 0.32 * strength * fade(s) ** 1.2
    ctx.drawImage(look.dot, p.x - 1.7, p.y - 1.7, 3.4, 3.4)
  }
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = "source-over"
}

/** The bright head of the light. */
function bead(ctx: CanvasRenderingContext2D, t: Track, at: number, look: Paint, strength: number) {
  if (strength <= 0.002) return
  const p = point(t, at)
  ctx.globalCompositeOperation = look.dark ? "lighter" : "source-over"
  // The working light carries a wide soft glow; a status light a solid 4 px head in a tight 12 px halo.
  const halo = look.solid ? 6 : 16
  const d = look.solid ? 2.2 : 2.75
  ctx.globalAlpha = (look.solid ? 0.24 : look.dark ? 0.8 : 0.5) * strength
  ctx.drawImage(look.glow, p.x - halo, p.y - halo, halo * 2, halo * 2)
  ctx.globalAlpha = strength
  ctx.drawImage(look.dot, p.x - d, p.y - d, d * 2, d * 2)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = "source-over"
}

/** Where the light leaves, the edge brightens for a moment around the spot. */
function flare(ctx: CanvasRenderingContext2D, edge: Track, at: number, look: Paint, u: number) {
  if (u >= 1 || u < 0) return
  const k = u < 0.25 ? u / 0.25 : 1 - (u - 0.25) / 0.75
  const s = edge.at[at]
  streak(ctx, edge, s - 28, s, look, k * 0.85, 1, true)
  streak(ctx, edge, s, s + 28, look, k * 0.85, -1, true)
}

/** The catch: the light splits where it lands and runs both ways along the tile's edge, fading as it goes. */
function catchAt(engine: Engine, edge: Track, tile: Tile, into: Point, look: Paint, now: number) {
  const at = edge.at[nearest(edge, into)]
  const reach = Math.min(edge.length * REACH, 320)
  tile.el.setAttribute("data-relay-catch", "")
  tile.el.setAttribute("data-relay-flash", "")
  window.setTimeout(() => tile.el.removeAttribute("data-relay-catch"), CATCH)
  window.setTimeout(() => tile.el.removeAttribute("data-relay-flash"), FLASH)
  // The tile's contents give way a touch, away from the edge the light came in by, and spring back.
  const body = tile.el.querySelector<HTMLElement>("[data-relay-body]")
  if (body && typeof body.animate === "function") {
    const side = [into.y - tile.y, tile.x + tile.w - into.x, tile.y + tile.h - into.y, into.x - tile.x]
    const [dx, dy] = [
      [0, 1],
      [-1, 0],
      [0, -1],
      [1, 0],
    ][side.indexOf(Math.min(...side))]
    body.animate([{ transform: "translate(0, 0)" }, { transform: `translate(${dx * NUDGE}px, ${dy * NUDGE}px)`, offset: 0.3 }, { transform: "translate(0, 0)" }], { duration: 360, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" })
  }
  play(engine, {
    until: now + CATCH,
    draw: (ctx, t) => {
      const u = clamp((t - now) / CATCH, 0, 1)
      const front = reach * (1 - (1 - u) ** 3)
      const strength = (1 - u) ** 1.2
      const tail = Math.min(front, 96)
      streak(ctx, edge, at + front - tail, at + front, look, strength, 1, true)
      streak(ctx, edge, at - front, at - front + tail, look, strength, -1, true)
    },
  })
}

/** A docking light settles into a 6 px dot over 120 ms and rings out to 24 px over 240 ms, then fades. */
function dockAt(engine: Engine, at: Point, look: Paint, now: number) {
  play(engine, {
    until: now + DOCK,
    draw: (ctx, t) => {
      const ms = t - now
      const settle = clamp(ms / 120, 0, 1)
      const ring = clamp(ms / 240, 0, 1)
      const fade = 1 - clamp((ms - 160) / (DOCK - 160), 0, 1)
      ctx.globalCompositeOperation = look.dark ? "lighter" : "source-over"
      // The glow it brought with it, gathering in.
      ctx.globalAlpha = (look.dark ? 0.7 : 0.45) * (1 - settle) + 0.18 * fade
      const g = 16 - 6 * settle
      ctx.drawImage(look.glow, at.x - g, at.y - g, g * 2, g * 2)
      // The bead, settling into a dot.
      ctx.globalAlpha = fade
      const d = 2.75 + 0.25 * settle
      ctx.drawImage(look.dot, at.x - d, at.y - d, d * 2, d * 2)
      ctx.globalCompositeOperation = "source-over"
      ctx.globalAlpha = 1
      // And one ring going out from it.
      const [r, g2, b] = look.rgb
      ctx.strokeStyle = `rgb(${r} ${g2} ${b} / ${(0.75 * (1 - ring) ** 1.2).toFixed(3)})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(at.x, at.y, 3 + 9 * (1 - (1 - ring) ** 3), 0, Math.PI * 2)
      ctx.stroke()
    },
  })
}

/** Reduced motion: the whole edge glows softly and fades, without anything moving along it. */
function glowEdge(ctx: CanvasRenderingContext2D, edge: Track, look: Paint, k: number) {
  if (k <= 0) return
  const [r, g, b] = look.rgb
  ctx.strokeStyle = `rgb(${r} ${g} ${b} / ${(0.7 * k).toFixed(3)})`
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let i = 0; i < edge.x.length; i++) (i ? ctx.lineTo : ctx.moveTo).call(ctx, edge.x[i], edge.y[i])
  ctx.closePath()
  ctx.stroke()
}

/** The point `s` px along a track. */
function point(t: Track, s: number): Point {
  const n = t.x.length
  if (n < 2 || s <= 0) return { x: t.x[0] ?? 0, y: t.y[0] ?? 0 }
  if (s >= t.length) return { x: t.x[n - 1], y: t.y[n - 1] }
  let lo = 0
  let hi = n - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (t.at[mid] <= s) lo = mid
    else hi = mid
  }
  const span = t.at[hi] - t.at[lo] || 1
  const k = (s - t.at[lo]) / span
  return { x: t.x[lo] + (t.x[hi] - t.x[lo]) * k, y: t.y[lo] + (t.y[hi] - t.y[lo]) * k }
}

/** The light's colour from the page's theme (--kf-accent, --kf-success, --kf-danger), with its glow and dot to stamp. */
function paintOf(root: HTMLElement, tone: RelayTone): Paint {
  const probe = document.createElement("span")
  probe.style.color = `var(--kf-${tone}, ${FALLBACK[tone]})`
  probe.style.display = "none"
  root.appendChild(probe)
  const color = getComputedStyle(probe).color
  probe.style.color = "var(--background, #ffffff)"
  const ground = getComputedStyle(probe).color
  probe.remove()
  const rgb = toRgb(color)
  const [gr, gg, gb] = toRgb(ground)
  const dark = 0.2126 * gr + 0.7152 * gg + 0.0722 * gb < 110
  // The core burns a little whiter than the glow, the way light does: a touch on a light grid, half on a dark one.
  const hot = dark ? 0.5 : 0.14
  const core: [number, number, number] = [mix(rgb[0], 255, hot), mix(rgb[1], 255, hot), mix(rgb[2], 255, hot)]
  return {
    rgb,
    dark,
    solid: tone !== "accent",
    glow: sprite(64, rgb, [
      [0, 1],
      [0.35, 0.45],
      [1, 0],
    ]),
    dot: sprite(16, core, [
      [0, 1],
      [0.5, 1],
      [1, 0],
    ]),
  }
}

/** A round, soft-edged dot of one colour, drawn once and stamped wherever the light goes. */
function sprite(size: number, [r, g, b]: [number, number, number], stops: [number, number][]) {
  const c = document.createElement("canvas")
  c.width = c.height = size
  const ctx = c.getContext("2d")
  if (ctx) {
    const fill = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    for (const [at, alpha] of stops) fill.addColorStop(at, `rgb(${r} ${g} ${b} / ${alpha})`)
    ctx.fillStyle = fill
    ctx.fillRect(0, 0, size, size)
  }
  return c
}

/** Any CSS colour as red, green and blue, by painting one pixel with it. */
function toRgb(color: string): [number, number, number] {
  const c = document.createElement("canvas")
  c.width = c.height = 1
  const ctx = c.getContext("2d", { willReadFrequently: true })
  if (!ctx) return [59, 130, 246]
  ctx.fillStyle = "#3b82f6"
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

function simplify(points: Point[]) {
  const out: Point[] = []
  for (const p of points) {
    const n = out.length
    if (n && Math.abs(out[n - 1].x - p.x) < 0.01 && Math.abs(out[n - 1].y - p.y) < 0.01) continue
    if (n >= 2) {
      const a = out[n - 2]
      const b = out[n - 1]
      if ((Math.abs(a.x - b.x) < 0.01 && Math.abs(b.x - p.x) < 0.01) || (Math.abs(a.y - b.y) < 0.01 && Math.abs(b.y - p.y) < 0.01)) {
        out[n - 1] = p
        continue
      }
    }
    out.push(p)
  }
  return out
}

function dedupe(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const out: number[] = []
  for (const v of sorted) if (!out.length || v - out[out.length - 1] > 1.5) out.push(v)
  return out
}

const overlap = (a0: number, a1: number, b0: number, b1: number) => Math.min(a1, b1) - Math.max(a0, b0)
const dist = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y)
const unit = (a: Point, b: Point) => {
  const d = dist(a, b) || 1
  return { x: (b.x - a.x) / d, y: (b.y - a.y) / d }
}
const mix = (a: number, b: number, k: number) => Math.round(a + (b - a) * k)
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

/** Waits `ms`, or less if `signal` aborts first. */
function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((done) => {
    if (signal.aborted) return done()
    const timer = window.setTimeout(finish, ms)
    signal.addEventListener("abort", finish, { once: true })
    function finish() {
      window.clearTimeout(timer)
      signal.removeEventListener("abort", finish)
      done()
    }
  })
}
