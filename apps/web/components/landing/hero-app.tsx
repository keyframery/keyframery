"use client"

/*
 * The hero's product shot: a store dashboard that runs itself. Every move in it is Keyframery's real code:
 * ListCut on the orders, ValueCut on the numbers and the status, LoadCut on the chart, and <Cuts /> on the
 * tabs and the refund dialog (staged inside the window with shadcn's own data-slot and classes). The switch
 * puts the whole window under data-cut="none", which is exactly stock shadcn/ui.
 */

import * as React from "react"

import { initialSettle, isHidden, nextSettle } from "@/components/home/settle"
import { ListCut } from "@/components/keyframery/list-cut"
import { LoadCut } from "@/components/keyframery/load-cut"
import { ValueCut } from "@/components/keyframery/value-cut"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type Status = "Paid" | "Refunded" | "Pending"
type Order = { id: string; who: string; item: string; amount: number; status: Status }
type Range = "today" | "week"

const QUEUE: Omit<Order, "status">[] = [
  { id: "o-2051", who: "Maya Chen", item: "Linen shirt", amount: 84 },
  { id: "o-2052", who: "Leo Park", item: "Field jacket", amount: 228 },
  { id: "o-2053", who: "Ines Duarte", item: "Wool scarf", amount: 46 },
  { id: "o-2054", who: "Sam Okafor", item: "Canvas tote", amount: 38 },
  { id: "o-2055", who: "Noah Weber", item: "Desert boots", amount: 172 },
]
const START: Order[] = [
  { id: "o-2050", who: "Ana Ruiz", item: "Denim jacket", amount: 196, status: "Paid" },
  { id: "o-2049", who: "Ben Adler", item: "Oxford shirt", amount: 72, status: "Paid" },
  { id: "o-2048", who: "Chloé Martin", item: "Knit beanie", amount: 29, status: "Pending" },
]
const BASE = { today: { revenue: 4820, orders: 38, conv: 3.4 }, week: { revenue: 31940, orders: 251, conv: 3.9 } }

export const STEPS = [
  { key: "list", label: "Order slides in", how: "ListCut" },
  { key: "value", label: "Totals roll", how: "ValueCut" },
  { key: "tabs", label: "Tabs slide", how: "auto" },
  { key: "load", label: "Chart dissolves", how: "LoadCut" },
  { key: "dialog", label: "Dialog grows from its button", how: "auto" },
] as const
type StepKey = (typeof STEPS)[number]["key"]

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const press = (el: Element | null | undefined) =>
  el?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, pointerType: "mouse", isPrimary: true }))
const money = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const

const subscribeMotion = (notify: () => void) => {
  const q = matchMedia("(prefers-reduced-motion: reduce)")
  q.addEventListener("change", notify)
  return () => q.removeEventListener("change", notify)
}

function useSettledClosed(open: boolean, ref: React.RefObject<HTMLElement | null>) {
  const [state, setState] = React.useState(() => initialSettle(open))
  if (state.open !== open) setState(nextSettle(state, open ? "open" : "close"))
  React.useEffect(() => {
    if (open) return
    const el = ref.current
    const ended = (e?: AnimationEvent) => {
      if (!e || e.target === el) setState((s) => nextSettle(s, "ended"))
    }
    const t = setTimeout(ended, 600)
    el?.addEventListener("animationend", ended)
    return () => {
      clearTimeout(t)
      el?.removeEventListener("animationend", ended)
    }
  }, [open, ref])
  return isHidden(state)
}

const CHART: Record<Range, number[]> = {
  today: [12, 18, 15, 22, 30, 26, 34, 41, 38, 47, 52, 58],
  week: [30, 42, 38, 51, 46, 60, 72, 66, 78, 74, 88, 96],
}
function Chart({ range }: { range: Range }) {
  const pts = CHART[range]
  const max = 100
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * 300, 110 - (v / max) * 100] as const)
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")
  return (
    <svg viewBox="0 0 300 120" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="lp-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--cut)" stopOpacity="0.22" />
          <stop offset="1" stopColor="var(--cut)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[30, 60, 90].map((y) => (
        <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="var(--lp-line)" strokeDasharray="3 4" />
      ))}
      <path d={`${line} L300 120 L0 120 Z`} fill="url(#lp-area)" />
      <path d={line} fill="none" stroke="var(--cut)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <circle cx={xy.at(-1)![0]} cy={xy.at(-1)![1]} r="3.5" fill="var(--cut)" />
    </svg>
  )
}

function Sidebar({ revenue }: { revenue: number }) {
  const nav = ["Overview", "Orders", "Products", "Customers", "Analytics"]
  return (
    <aside className="hidden w-48 shrink-0 flex-col border-r border-[var(--lp-line)] p-4 md:flex">
      <div className="flex items-center gap-2 text-[13px] font-semibold">
        <span aria-hidden="true" className="grid size-6 place-items-center rounded-md bg-[var(--lp-ink)] text-[11px] text-[var(--lp-bg)]">N</span>
        Northwind
      </div>
      <p className="mt-6 text-[10px] font-medium tracking-[0.12em] uppercase lp-muted">Store</p>
      <ul className="mt-2 grid gap-0.5 text-[13px]">
        {nav.map((n, i) => (
          <li key={n} className={cn("rounded-md px-2 py-1.5", i === 0 ? "bg-[color-mix(in_oklab,var(--lp-ink)_6%,transparent)] font-medium" : "lp-muted")}>
            {n}
          </li>
        ))}
      </ul>
      <div className="mt-auto rounded-lg border border-[var(--lp-line)] p-3">
        <p className="text-[10px] font-medium tracking-[0.12em] uppercase lp-muted">This month</p>
        <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums">
          <ValueCut value={revenue + 96210} format={money} locale="en-US" />
        </p>
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400">↗ 12.2% vs last month</p>
      </div>
    </aside>
  )
}

function Kpi({ label, children, foot }: { label: string; children: React.ReactNode; foot: string }) {
  return (
    <div className="rounded-xl border border-[var(--lp-line)] bg-[var(--lp-card)] p-3.5">
      <p className="text-[11px] font-medium lp-muted">{label}</p>
      <p className="mt-1.5 text-[22px] leading-none font-semibold tracking-tight tabular-nums">{children}</p>
      <p className="mt-2 text-[11px] lp-muted">{foot}</p>
    </div>
  )
}

function Cursor({ ref, shown }: { ref: React.Ref<HTMLDivElement>; shown: boolean }) {
  return (
    <div ref={ref} aria-hidden="true" hidden={!shown} className="pointer-events-none absolute top-0 left-0 z-40" style={{ translate: "70% 80%" }}>
      <span data-ring="" className="absolute -top-3 -left-3 size-6 rounded-full border-2 border-[var(--cut)] opacity-0" />
      <svg width="22" height="22" viewBox="0 0 22 22" className="-mt-0.5 -ml-[3px] drop-shadow-[0_2px_4px_rgb(22_24_29/0.35)]">
        <path d="M3 2 L3 17 L7.5 13 L10.5 20 L13 19 L10 12 L16 12 Z" fill="#111" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function HeroApp() {
  const [orders, setOrders] = React.useState<Order[]>(START)
  const [range, setRange] = React.useState<Range>("today")
  const [loading, setLoading] = React.useState(false)
  const [dialog, setDialog] = React.useState<Order | null>(null)
  const [held, setHeld] = React.useState<Order | null>(null)
  if (dialog && dialog !== held) setHeld(dialog)
  const [extra, setExtra] = React.useState({ revenue: 0, orders: 0 })
  const [active, setActive] = React.useState<StepKey[]>([])
  const [motion, setMotion] = React.useState(true)
  const [playing, setPlaying] = React.useState(true)
  const [inView, setInView] = React.useState(false)
  const [cursorShown, setCursorShown] = React.useState(false)

  const reduced = React.useSyncExternalStore(subscribeMotion, () => matchMedia("(prefers-reduced-motion: reduce)").matches, () => false)
  const running = playing && inView && !reduced

  const win = React.useRef<HTMLDivElement>(null)
  const cursor = React.useRef<HTMLDivElement>(null)
  const content = React.useRef<HTMLDivElement>(null)
  const settled = useSettledClosed(!!dialog, content)
  const queue = React.useRef(0)
  const latest = React.useRef(orders)
  React.useEffect(() => {
    latest.current = orders
  })

  React.useEffect(() => {
    const el = win.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const k = BASE[range]

  React.useEffect(() => {
    if (!running) return
    let cancelled = false
    const flash = (...keys: StepKey[]) => setActive(keys)
    const find = (sel: string) => win.current?.querySelector<HTMLElement>(`[data-demo="${sel}"]`) ?? null

    const glide = async (target: HTMLElement | null) => {
      const c = cursor.current
      const w = win.current
      if (!c || !w || !target || !w.offsetWidth) return
      const a = w.getBoundingClientRect()
      const r = target.getBoundingClientRect()
      if (!r.width) return
      const to = `${Math.round(r.left - a.left + r.width / 2)}px ${Math.round(r.top - a.top + r.height / 2)}px`
      const from = c.style.translate || to
      c.style.translate = to
      await c.animate([{ translate: from }, { translate: to }], { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }).finished.catch(() => {})
    }
    const click = async (sel: string) => {
      const el = find(sel)
      await glide(el)
      if (cancelled || !el) return false
      press(el)
      cursor.current?.querySelector("[data-ring]")?.animate([{ scale: 0.4, opacity: 0.9 }, { scale: 1.8, opacity: 0 }], { duration: 480, easing: "cubic-bezier(0.22, 1, 0.36, 1)" })
      return true
    }
    const switchRange = async (to: Range) => {
      if (!(await click(`tab-${to}`))) return
      flash("tabs", "load")
      setRange(to)
      setLoading(true)
      await sleep(1100)
      setLoading(false)
    }

    const run = async () => {
      await sleep(500)
      setCursorShown(true)
      while (!cancelled) {
        // 1. An order arrives at the top; the oldest leaves at the bottom; the totals roll.
        const next = QUEUE[queue.current++ % QUEUE.length]
        flash("list", "value")
        setOrders((list) => [{ ...next, id: `${next.id}-${queue.current}`, status: "Paid" as Status }, ...list].slice(0, 4))
        setExtra((x) => ({ revenue: x.revenue + next.amount, orders: x.orders + 1 }))
        await sleep(2200)
        if (cancelled) return

        // 2. Refund it: the dialog grows from the row's button, the status rolls to Refunded.
        const top = latest.current[0]
        if (await click(`refund-${top.id}`)) {
          flash("dialog")
          setDialog(top)
          await sleep(1500)
          if (cancelled) return
          if (await click("confirm")) {
            setDialog(null)
            flash("value")
            setOrders((list) => list.map((o) => (o.id === top.id ? { ...o, status: "Refunded" } : o)))
            setExtra((x) => ({ revenue: x.revenue - top.amount, orders: x.orders }))
            await sleep(1700)
          }
        }
        if (cancelled) return

        // 3. This week, then back to Today: tabs slide, the chart reloads under LoadCut.
        await switchRange("week")
        await sleep(1500)
        if (cancelled) return
        await switchRange("today")
        await sleep(1300)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [running])

  const shown = dialog ?? held
  const phase = dialog ? { "data-open": "" } : { "data-closed": "" }

  return (
    <div className="mx-auto w-full max-w-[1180px]">
      <div className="relative">
        <div aria-hidden="true" className="absolute -inset-x-6 -top-6 -bottom-10 rounded-[28px] bg-[color-mix(in_oklab,var(--lp-card)_45%,transparent)] ring-1 ring-[var(--lp-line)] backdrop-blur-sm" />
        <div
          ref={win}
          data-cut={motion ? undefined : "none"}
          aria-label={motion ? "Store dashboard with Keyframery" : "Store dashboard as shadcn/ui ships it"}
          role="group"
          className="relative flex h-[440px] overflow-hidden rounded-2xl bg-[var(--lp-card)] text-left shadow-[var(--lp-shadow)] ring-1 ring-[var(--lp-line)] sm:h-[480px]"
        >
          <Sidebar revenue={extra.revenue} />
          <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold tracking-tight">Overview</p>
                <p className="text-[12px] lp-muted">Northwind Goods · live</p>
              </div>
              <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
                <TabsList>
                  <TabsTrigger value="today" data-demo="tab-today">Today</TabsTrigger>
                  <TabsTrigger value="week" data-demo="tab-week">This week</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
              <Kpi label="Revenue" foot={range === "today" ? "Since midnight" : "Last 7 days"}>
                <ValueCut value={k.revenue + extra.revenue} format={money} locale="en-US" />
              </Kpi>
              <Kpi label="Orders" foot="Paid and pending">
                <ValueCut value={k.orders + extra.orders} locale="en-US" />
              </Kpi>
              <div className="hidden lg:block">
                <Kpi label="Conversion" foot="Visits that bought">
                  <ValueCut value={`${k.conv}%`} />
                </Kpi>
              </div>
            </div>
            <div className="mt-3 grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              <div className="flex min-h-0 flex-col rounded-xl border border-[var(--lp-line)] p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium">Recent orders</p>
                  <span className="text-[11px] lp-muted">Live</span>
                </div>
                <ListCut as="ul" aria-label="Recent orders" className="mt-2 grid">
                  {orders.map((o) => (
                    <ListCut.Item key={o.id} id={o.id} as="li" className="flex h-12 items-center gap-3 border-b border-[var(--lp-line)] last:border-b-0">
                      <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-[color-mix(in_oklab,var(--lp-ink)_7%,transparent)] text-[10px] font-medium">
                        {o.who.split(" ").map((p) => p[0]).join("")}
                      </span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate text-[13px] font-medium">{o.who}</span>
                        <span className="block truncate text-[11px] lp-muted">{o.item}</span>
                      </span>
                      <span className={cn("hidden rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline", o.status === "Refunded" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : o.status === "Pending" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400")}>
                        <ValueCut value={o.status} />
                      </span>
                      <span className="w-12 text-right text-[13px] font-medium tabular-nums">${o.amount}</span>
                      <button
                        type="button"
                        data-demo={`refund-${o.id}`}
                        disabled={o.status !== "Paid"}
                        onClick={() => setDialog(o)}
                        className="rounded-md px-2 py-1 text-[11px] font-medium ring-1 ring-[var(--lp-line)] outline-none hover:bg-[color-mix(in_oklab,var(--lp-ink)_5%,transparent)] focus-visible:ring-2 focus-visible:ring-[var(--cut)] disabled:opacity-35"
                      >
                        Refund
                      </button>
                    </ListCut.Item>
                  ))}
                </ListCut>
              </div>
              <div className="hidden min-h-0 flex-col rounded-xl border border-[var(--lp-line)] p-3.5 lg:flex">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium">Revenue</p>
                  <span className="text-[11px] lp-muted">{range === "today" ? "Hourly" : "Daily"}</span>
                </div>
                <div className="mt-2 min-h-0 flex-1">
                  <LoadCut
                    loading={loading}
                    hold={0}
                    className="h-full"
                    skeleton={
                      <div className="grid h-full content-end gap-2">
                        <div className="h-3 w-24 animate-pulse rounded bg-[color-mix(in_oklab,var(--lp-ink)_8%,transparent)]" />
                        <div className="h-32 animate-pulse rounded-lg bg-[color-mix(in_oklab,var(--lp-ink)_6%,transparent)]" />
                      </div>
                    }
                  >
                    <div className="flex h-full flex-col">
                      <p className="text-[12px] lp-muted">
                        <span className="text-[17px] font-semibold text-[var(--lp-ink)] tabular-nums">${(k.revenue / 1000).toFixed(1)}k</span> · peak {range === "today" ? "4 pm" : "Saturday"}
                      </p>
                      <div className="mt-2 min-h-0 flex-1">
                        <Chart range={range} />
                      </div>
                    </div>
                  </LoadCut>
                </div>
              </div>
            </div>
          </div>

          {/* The refund dialog: shadcn's DialogOverlay / DialogContent classes, staged inside the window. */}
          <div
            data-slot="dialog-overlay"
            {...phase}
            aria-hidden="true"
            onClick={() => setDialog(null)}
            className={cn(
              "absolute inset-0 z-20 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 data-closed:fill-mode-forwards",
              settled && "invisible",
            )}
          />
          <div
            ref={content}
            data-slot="dialog-content"
            role="dialog"
            aria-label="Refund order"
            {...phase}
            inert={settled}
            className={cn(
              "absolute top-1/2 left-1/2 z-30 grid w-[min(21rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 gap-3 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:fill-mode-forwards",
              settled && "invisible",
            )}
          >
            <div className="grid gap-1">
              <p className="text-base leading-none font-medium">Refund ${shown?.amount ?? 0}?</p>
              <p className="text-muted-foreground">
                {shown?.who ?? ""} gets the money back in 3–5 days. The {shown?.item.toLowerCase() ?? "order"} goes back into stock.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDialog(null)} className="h-8 rounded-md px-3 text-[13px] ring-1 ring-border">
                Cancel
              </button>
              <button type="button" data-demo="confirm" onClick={() => {
                const target = dialog
                setDialog(null)
                if (target) setOrders((list) => list.map((o) => (o.id === target.id ? { ...o, status: "Refunded" } : o)))
              }} className="h-8 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground">
                Refund order
              </button>
            </div>
          </div>
          <Cursor ref={cursor} shown={cursorShown && running} />
        </div>
      </div>

      {/* What just moved, and the switch that takes Keyframery away. */}
      <div className="relative mt-14 flex flex-col items-center gap-5 xl:flex-row xl:justify-between">
        <ol aria-label="What is moving" className="flex flex-wrap justify-center gap-1.5 xl:flex-nowrap xl:justify-start">
          {STEPS.map((s) => {
            const on = active.includes(s.key) && running
            return (
              <li
                key={s.key}
                className={cn(
                  "flex items-center gap-2 rounded-full px-2.5 py-1.5 text-[12px] whitespace-nowrap ring-1 transition-[background-color,box-shadow,color] duration-300",
                  on ? "bg-[var(--lp-card)] text-[var(--lp-ink)] shadow-sm ring-[color-mix(in_oklab,var(--cut)_40%,transparent)]" : "ring-[var(--lp-line)] lp-muted",
                )}
              >
                <span aria-hidden="true" className={cn("size-1.5 rounded-full transition-colors", on ? "bg-[var(--cut)]" : "bg-current opacity-40")} />
                {s.label}
                <span className={cn("font-mono text-[11px]", on ? "text-[var(--cut)]" : "opacity-70")}>{s.how}</span>
              </li>
            )
          })}
        </ol>
        <div className="flex shrink-0 items-center gap-2">
          <div role="group" aria-label="Motion" className="inline-flex rounded-lg p-0.5 ring-1 ring-[var(--lp-line)]">
            {[true, false].map((on) => (
              <button
                key={String(on)}
                type="button"
                aria-pressed={motion === on}
                onClick={() => setMotion(on)}
                className="rounded-md px-3 py-1.5 text-[12.5px] font-medium lp-muted outline-none focus-visible:ring-2 focus-visible:ring-[var(--cut)] aria-pressed:bg-[var(--lp-card)] aria-pressed:text-[var(--lp-ink)] aria-pressed:shadow-sm"
              >
                {on ? "With Keyframery" : "Stock shadcn/ui"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="rounded-lg px-3 py-2 text-[12.5px] font-medium lp-muted ring-1 ring-[var(--lp-line)] outline-none hover:text-[var(--lp-ink)] focus-visible:ring-2 focus-visible:ring-[var(--cut)]"
          >
            {playing ? "Pause" : "Play"}
          </button>
        </div>
      </div>
    </div>
  )
}
