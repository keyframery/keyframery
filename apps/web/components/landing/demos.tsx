"use client"

/*
 * The landing's small live scenes. Every one runs Keyframery's real code (<Cuts /> on staged shadcn parts,
 * or a helper), loops while on screen, and waits for Play under reduced motion (useLoop).
 */

import * as React from "react"

import { initialSettle, isHidden, nextSettle } from "@/components/home/settle"
import { press, useLoop } from "@/components/cuts/loops"
import { ListCut } from "@/components/keyframery/list-cut"
import { LoadCut } from "@/components/keyframery/load-cut"
import { MatchCut } from "@/components/keyframery/match-cut"
import { ValueCut } from "@/components/keyframery/value-cut"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

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

function PlayButton({ still, playOnce, label }: { still: boolean; playOnce: () => void; label: string }) {
  if (!still) return null
  return (
    <button type="button" onClick={playOnce} aria-label={`Play the ${label} example`} className="absolute right-3 bottom-3 z-40 rounded-md px-2.5 py-1 text-xs ring-1 ring-white/15 hover:bg-white/10">
      Play
    </button>
  )
}

/** shadcn's DialogOverlay + DialogContent, staged inside a box. */
function StagedDialog({ open, onClose, title, body, action, className }: { open: boolean; onClose: () => void; title: string; body: string; action: string; className?: string }) {
  const content = React.useRef<HTMLDivElement>(null)
  const settled = useSettledClosed(open, content)
  const phase = open ? { "data-open": "" } : { "data-closed": "" }
  return (
    <>
      <div
        data-slot="dialog-overlay"
        {...phase}
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "absolute inset-0 z-10 bg-black/30 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 data-closed:fill-mode-forwards",
          settled && "invisible",
        )}
      />
      <div
        ref={content}
        data-slot="dialog-content"
        role="dialog"
        aria-label={title}
        {...phase}
        inert={settled}
        className={cn(
          "absolute top-1/2 left-1/2 z-20 grid w-[min(17rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 gap-3 rounded-xl bg-popover p-4 text-left text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:fill-mode-forwards",
          settled && "invisible",
          className,
        )}
      >
        <div className="grid gap-1">
          <p className="font-medium">{title}</p>
          <p className="text-[13px] text-muted-foreground">{body}</p>
        </div>
        <div className="flex justify-end gap-2">
          <span className="rounded-md px-2.5 py-1 text-[12px] ring-1 ring-border">Cancel</span>
          <span className="rounded-md bg-primary px-2.5 py-1 text-[12px] font-medium text-primary-foreground">{action}</span>
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ Same click, two apps */

function ProjectsPanel({ open, triggerRef }: { open: boolean; triggerRef: React.Ref<HTMLButtonElement> }) {
  return (
    <div className="relative h-[17rem] overflow-hidden rounded-xl bg-[var(--lp-card)] ring-1 ring-[var(--lp-line)]">
      <div className="flex items-center justify-between border-b border-[var(--lp-line)] px-4 py-3">
        <p className="text-[13px] font-medium">Projects</p>
        <span className="text-[11px] lp-muted">3 active</span>
      </div>
      <ul className="grid px-4">
        {["Website redesign", "Q3 roadmap", "Mobile app"].map((p, i) => (
          <li key={p} className="flex h-11 items-center justify-between border-b border-[var(--lp-line)] text-[13px] last:border-b-0">
            {p}
            {i === 1 ? (
              <button ref={triggerRef} type="button" tabIndex={-1} className="rounded-md px-2 py-1 text-[11px] font-medium text-rose-300 ring-1 ring-rose-400/30">
                Delete
              </button>
            ) : (
              <span className="text-[11px] lp-muted">{i === 0 ? "Due Friday" : "In review"}</span>
            )}
          </li>
        ))}
      </ul>
      <StagedDialog open={open} onClose={() => {}} title="Delete “Q3 roadmap”?" body="This removes the project and its 14 tasks." action="Delete" />
    </div>
  )
}

/** The plainest proof: the same click on two copies of the same screen. Only the right one has Keyframery. */
export function SameClick() {
  const [open, setOpen] = React.useState(false)
  const stock = React.useRef<HTMLButtonElement>(null)
  const ours = React.useRef<HTMLButtonElement>(null)
  const { ref: loopRef, still, playOnce } = useLoop(2300, () => {
    if (!open) {
      press(stock.current)
      press(ours.current) // the last press is where a cut starts
    }
    setOpen((o) => !o)
  })
  return (
    <div ref={loopRef} className="relative grid gap-5 md:grid-cols-2">
      {(["stock", "kf"] as const).map((side) => (
        <figure key={side} data-cut={side === "stock" ? "none" : undefined} className="min-w-0">
          <figcaption className="mb-3 flex items-center gap-2 text-[13px]">
            <span aria-hidden="true" className={cn("size-2 rounded-full", side === "kf" ? "bg-[#8098ff]" : "bg-white/30")} />
            {side === "stock" ? (
              <>
                <span className="font-medium">shadcn/ui</span>
                <span className="lp-muted">as it ships: the dialog pops up in the middle</span>
              </>
            ) : (
              <>
                <span className="font-medium">with Keyframery</span>
                <span className="lp-muted">it grows out of the button you pressed</span>
              </>
            )}
          </figcaption>
          <ProjectsPanel open={open} triggerRef={side === "stock" ? stock : ours} />
        </figure>
      ))}
      <PlayButton still={still} playOnce={playOnce} label="side-by-side" />
    </div>
  )
}

/* ------------------------------------------------------------------ Feature card scenes */

const stage = "relative grid h-60 place-items-center overflow-hidden px-6"

export function DialogScene() {
  const [open, setOpen] = React.useState(false)
  const trigger = React.useRef<HTMLButtonElement>(null)
  const { ref: loopRef, still, playOnce } = useLoop(2200, () => {
    if (!open) press(trigger.current)
    setOpen((o) => !o)
  })
  return (
    <div ref={loopRef} className={stage}>
      <div className="relative h-44 w-full max-w-xs">
        <div className="absolute inset-x-0 top-0 rounded-lg bg-white/[0.03] p-3 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-medium">Q3 Roadmap</p>
            <button ref={trigger} type="button" tabIndex={-1} className="rounded-md bg-white px-2.5 py-1 text-[11px] font-medium text-black">
              Share
            </button>
          </div>
          <div className="mt-3 grid gap-1.5">
            <div className="h-2 w-3/4 rounded bg-white/10" />
            <div className="h-2 w-1/2 rounded bg-white/10" />
          </div>
        </div>
        <StagedDialog open={open} onClose={() => setOpen(false)} title="Share Q3 Roadmap" body="Anyone at Acme with the link can view." action="Copy link" className="top-[62%]" />
      </div>
      <PlayButton still={still} playOnce={playOnce} label="dialog" />
    </div>
  )
}

const MESSAGES = [
  { who: "Maya", text: "Pushed the new pricing page" },
  { who: "Leo", text: "Can you review PR #212?" },
  { who: "Ines", text: "Standup moved to 10:30" },
  { who: "Sam", text: "Invoice #1048 was paid" },
  { who: "Noah", text: "Deploy finished in 41 s" },
]
export function ListScene() {
  const [items, setItems] = React.useState(() => MESSAGES.slice(0, 3).map((m, i) => ({ ...m, id: i })))
  const next = React.useRef(3)
  const { ref: loopRef, still, playOnce } = useLoop(1700, () => {
    const n = next.current++
    setItems((xs) => [{ ...MESSAGES[n % MESSAGES.length], id: n }, ...xs].slice(0, 3))
  })
  return (
    <div ref={loopRef} className={stage}>
      <ListCut as="ul" aria-label="Inbox" className="grid w-full max-w-xs gap-1.5">
        {items.map((m) => (
          <ListCut.Item key={m.id} id={m.id} as="li" className="flex items-center gap-2.5 rounded-lg bg-white/[0.03] px-3 py-2 ring-1 ring-white/10">
            <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-white/10 text-[10px] font-medium">{m.who[0]}</span>
            <span className="min-w-0 leading-tight">
              <span className="block text-[12px] font-medium">{m.who}</span>
              <span className="block truncate text-[11px] lp-muted">{m.text}</span>
            </span>
          </ListCut.Item>
        ))}
      </ListCut>
      <PlayButton still={still} playOnce={playOnce} label="list" />
    </div>
  )
}

const STATUS = ["Processing", "Packed", "Shipped", "Delivered"]
export function NumberScene() {
  const [tick, setTick] = React.useState(0)
  const { ref: loopRef, still, playOnce } = useLoop(1500, () => setTick((t) => t + 1))
  const revenue = 48210 + ((tick * 1379) % 9000)
  return (
    <div ref={loopRef} className={stage}>
      <div className="grid w-full max-w-xs gap-2">
        <div className="rounded-lg bg-white/[0.03] p-3 ring-1 ring-white/10">
          <p className="text-[11px] lp-muted">Monthly revenue</p>
          <p className="mt-1 text-[28px] leading-none font-semibold tracking-tight tabular-nums">
            <ValueCut value={revenue} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} locale="en-US" />
          </p>
          <p className="mt-1.5 text-[11px] text-emerald-400">↗ 12.4% this month</p>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2.5 ring-1 ring-white/10 text-[12px]">
          <span className="lp-muted">Order #1048</span>
          <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 font-medium text-emerald-300">
            <ValueCut value={STATUS[tick % STATUS.length]} />
          </span>
        </div>
      </div>
      <PlayButton still={still} playOnce={playOnce} label="numbers" />
    </div>
  )
}

export function LoadScene() {
  const [loading, setLoading] = React.useState(false)
  const [set, setSet] = React.useState(0)
  const { ref: loopRef, still, playOnce } = useLoop(2600, () => {
    setLoading(true)
    setTimeout(() => {
      setSet((s) => s + 1)
      setLoading(false)
    }, 1000)
  })
  const bars = set % 2 ? [40, 62, 48, 80, 66, 92, 74] : [55, 38, 70, 52, 86, 60, 78]
  return (
    <div ref={loopRef} className={stage}>
      <div className="w-full max-w-xs rounded-lg bg-white/[0.03] p-3 ring-1 ring-white/10">
        <LoadCut
          loading={loading}
          hold={0}
          skeleton={
            <div className="grid gap-2">
              <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-28 animate-pulse rounded-md bg-white/[0.06]" />
            </div>
          }
        >
          <p className="text-[12px] font-medium">Visitors this week</p>
          <div className="mt-2 flex h-28 items-end gap-1.5">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#2f4fd8] to-[#8098ff]" style={{ height: `${h}%` }} />
            ))}
          </div>
        </LoadCut>
      </div>
      <PlayButton still={still} playOnce={playOnce} label="loading" />
    </div>
  )
}

const TABS = [
  { v: "overview", label: "Overview", body: "Revenue is up 12% on last week." },
  { v: "activity", label: "Activity", body: "Maya invited 2 people to Acme." },
  { v: "billing", label: "Billing", body: "Next invoice: $240 on Dec 1." },
]
export function TabsScene() {
  const [tab, setTab] = React.useState("overview")
  const host = React.useRef<HTMLDivElement>(null)
  const { ref: loopRef, still, playOnce } = useLoop(1600, () => {
    const i = TABS.findIndex((t) => t.v === tab)
    const next = TABS[(i + 1) % TABS.length].v
    press(host.current?.querySelector(`[data-tab="${next}"]`) ?? null)
    setTab(next)
  })
  return (
    <div ref={loopRef} className={stage}>
      <div ref={host} className="w-full max-w-xs">
        <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.v} value={t.v} data-tab={t.v} tabIndex={-1}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((t) => (
            <TabsContent key={t.v} value={t.v} className="mt-3 rounded-lg bg-white/[0.03] p-3 text-[12.5px] ring-1 ring-white/10">
              {t.body}
              <div className="mt-2.5 h-9 rounded bg-white/[0.05]" />
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <PlayButton still={still} playOnce={playOnce} label="tabs" />
    </div>
  )
}

export function MatchScene() {
  const [big, setBig] = React.useState(false)
  const { ref: loopRef, still, playOnce } = useLoop(2000, () => setBig((b) => !b))
  return (
    <div ref={loopRef} className={stage}>
      {big ? (
        <MatchCut key="big" id="lp-order" className="w-full max-w-xs rounded-xl bg-[#14161c] p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium">Order #1048</p>
            <span className="text-[11px] text-emerald-300">Shipped</span>
          </div>
          <p className="mt-1 text-[11px] lp-muted">Linen shirt · Field jacket</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="h-12 rounded bg-white/[0.06]" />
            <div className="h-12 rounded bg-white/[0.06]" />
            <div className="h-12 rounded bg-white/[0.06]" />
          </div>
        </MatchCut>
      ) : (
        <MatchCut key="small" id="lp-order" className="w-44 rounded-lg bg-[#14161c] px-3 py-2.5 ring-1 ring-white/10">
          <p className="text-[12px] font-medium">Order #1048</p>
          <p className="text-[11px] lp-muted">$312 · Shipped</p>
        </MatchCut>
      )}
      <PlayButton still={still} playOnce={playOnce} label="card to page" />
    </div>
  )
}
