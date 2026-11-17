"use client"

/* What a preset looks like: real Keyframery components, as one small travel-planning app, so colour,
   corners, type and motion are judged on the parts people ship rather than on swatches. Everything
   here reads the preset through the CSS variables the /create page sets on the preview's wrapper;
   popups render in place in the top layer, so menus, the dialog and toasts follow too. */

import { CalendarPlus, Ellipsis, Link2, Ticket, X } from "lucide-react"
import * as React from "react"

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Menu, MenuContent, MenuGroup, MenuItem, MenuItemIcon, MenuSeparator, MenuTrigger } from "@/components/ui/menu"
import { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue } from "@/components/ui/progress"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "@/components/ui/tabs"
import { createToaster, ToastRegion } from "@/components/ui/toast"
import type { PlayStep } from "@/lib/autoplay"

/* The replay: the tab key travels, a switch flips and settles back, the segmented key glides, a toast
   springs in and the menu unfolds. About six seconds; every step is a component the preset moves. */
export const replaySteps: PlayStep[] = [
  { click: '[data-play="tab-budget"]', wait: 850 },
  { click: '[data-play="tab-people"]', wait: 850 },
  { click: '[data-play="tab-overview"]', wait: 750 },
  { click: '[data-play="weekend"]', wait: 650 },
  { click: '[data-play="view-list"]', wait: 650 },
  { click: '[data-play="weekend"]', wait: 450 },
  { click: '[data-play="view-map"]', wait: 650 },
  { click: '[data-play="faq-tram"]', wait: 700 },
  { click: '[data-play="room-family"]', wait: 600 },
  { click: '[data-play="tag-host"]', wait: 600 },
  { click: '[data-play="room-twin"]', wait: 500 },
  { click: '[data-play="toast"]', wait: 1300 },
  { click: '[data-play="menu"]', wait: 1300 },
  { key: "Escape", wait: 400 },
]

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-muted/70 px-3 py-2.5">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-[15px] font-semibold tracking-tight tabular-nums">{value}</div>
    </div>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

/* The lead card: the one number the trip is about, set large on the preset's theme colour, so the
   wall has a place for the eye to land and the theme colour is seen at full size once. */
function CountdownCard() {
  return (
    <Card className="[--card-face:var(--primary)] [--card-ink:var(--primary-foreground)] [--card-muted:color-mix(in_oklab,var(--primary-foreground)_72%,transparent)]">
      <CardHeader>
        <CardDescription>Your next trip</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-1">
        <div className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="text-[56px] leading-none font-semibold tracking-[-0.04em] tabular-nums">12</span>
          <span className="text-[22px] font-semibold tracking-[-0.02em]">days to go</span>
        </div>
        <p className="mt-2 text-[13px] leading-snug text-[color:var(--card-muted)]">TAP 1351 leaves Heathrow at 07:05 on Thursday 14 May. Online check-in opens in 11 days.</p>
      </CardContent>
    </Card>
  )
}

function TripCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lisbon in May</CardTitle>
        <CardDescription>14 to 18 May, four travellers</CardDescription>
        <CardAction>
          <Badge variant="success">Booked</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList aria-label="Trip" className="w-full">
            <TabsTab value="overview" data-play="tab-overview">Overview</TabsTab>
            <TabsTab value="budget" data-play="tab-budget">Budget</TabsTab>
            <TabsTab value="people" data-play="tab-people">People</TabsTab>
          </TabsList>
          <TabsPanels className="h-[132px]">
            <TabsPanel value="overview" className="pt-3">
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Nights" value="4" />
                <Stat label="Spent" value="€1,840" />
                <Stat label="Left" value="€660" />
              </div>
              <Progress value={74} className="mt-4">
                <ProgressLabel>Budget used</ProgressLabel>
                <ProgressValue />
                <ProgressTrack>
                  <ProgressIndicator />
                </ProgressTrack>
              </Progress>
            </TabsPanel>
            <TabsPanel value="budget" className="divide-y pt-1">
              <Line label="Flights" value="€620" />
              <Line label="Casa do Largo" value="€880" />
              <Line label="Food and trams" value="€340" />
            </TabsPanel>
            <TabsPanel value="people" className="pt-3">
              <AvatarGroup>
                {["MA", "JO", "PK", "SR"].map((initials) => (
                  <Avatar key={initials}>
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <p className="mt-3 text-[13px] text-muted-foreground">Maya, Jo, Priya and Sam. Jo pays for the flights.</p>
            </TabsPanel>
          </TabsPanels>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function AlertsCard() {
  const [under, setUnder] = React.useState(120)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price alerts</CardTitle>
        <CardDescription>We&apos;ll tell you when fares to Lisbon drop.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input type="email" defaultValue="maya@fastmail.com" autoComplete="off" />
        </Field>
        <div className="grid gap-1.5">
          <span className="text-[13px] font-medium" id="create-check-label">Check prices</span>
          <Select defaultValue="daily">
            <SelectTrigger aria-labelledby="create-check-label" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Every hour</SelectItem>
              <SelectItem value="daily">Every morning</SelectItem>
              <SelectItem value="weekly">Once a week</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2.5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-medium" id="create-under-label">Alert me under</span>
            <span className="text-muted-foreground tabular-nums">€{under}</span>
          </div>
          <Slider value={under} min={60} max={240} step={5} onValueChange={(next) => setUnder(Array.isArray(next) ? next[0] : (next as number))} aria-labelledby="create-under-label">
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb aria-labelledby="create-under-label" />
              </SliderTrack>
            </SliderControl>
          </Slider>
        </div>
        <label className="flex items-center justify-between gap-3 text-[13px]">
          Weekend fares only
          <Switch data-play="weekend" defaultChecked />
        </label>
        <label className="flex items-center gap-2.5 text-[13px]">
          <Checkbox defaultChecked />
          Also send a text message
        </label>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button>Cancel</Button>
        <Button variant="primary">Save alerts</Button>
      </CardFooter>
    </Card>
  )
}

function StaysCard({ toaster }: { toaster: ReturnType<typeof createToaster<React.ReactNode>> }) {
  const [view, setView] = React.useState("map")
  return (
    <Card>
      <CardHeader>
        <CardTitle>Where you&apos;re staying</CardTitle>
        <CardDescription>Two stays, both paid</CardDescription>
        <CardAction>
          <SegmentedControl aria-label="View" value={view} onValueChange={(next) => next && setView(next as string)}>
            <SegmentedControlItem value="map" data-play="view-map">Map</SegmentedControlItem>
            <SegmentedControlItem value="list" data-play="view-list">List</SegmentedControlItem>
          </SegmentedControl>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-1">
        <div className="flex items-center gap-3 rounded-[10px] py-1.5">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium">Casa do Largo, Alfama</div>
            <div className="mt-0.5 text-[12px] text-muted-foreground">14 to 16 May</div>
          </div>
          <Badge variant="secondary">2 nights</Badge>
          <Menu>
            <MenuTrigger data-play="menu" aria-label="More for Casa do Largo" className="w-8 px-0">
              <Ellipsis aria-hidden className="size-4" />
            </MenuTrigger>
            <MenuContent align="end" className="w-56">
              <MenuGroup>
                <MenuItem value="ticket">
                  <MenuItemIcon><Ticket aria-hidden /></MenuItemIcon>
                  View booking
                </MenuItem>
                <MenuItem value="calendar">
                  <MenuItemIcon><CalendarPlus aria-hidden /></MenuItemIcon>
                  Add to calendar
                </MenuItem>
                <MenuItem value="share" shortcut="mod+shift+c">
                  <MenuItemIcon><Link2 aria-hidden /></MenuItemIcon>
                  Copy link
                </MenuItem>
              </MenuGroup>
              <MenuSeparator />
              <MenuItem value="cancel" destructive>
                <MenuItemIcon><X aria-hidden /></MenuItemIcon>
                Cancel booking
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
        <div className="flex items-center gap-3 rounded-[10px] py-1.5">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium">Lumiares, Bairro Alto</div>
            <div className="mt-0.5 text-[12px] text-muted-foreground">16 to 18 May</div>
          </div>
          <Badge variant="outline">2 nights</Badge>
          <span className="w-8" aria-hidden />
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Dialog>
          <DialogTrigger>Edit trip</DialogTrigger>
          <DialogBackdrop />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit trip</DialogTitle>
              <DialogDescription>Everyone on the trip sees these details.</DialogDescription>
            </DialogHeader>
            <div className="mt-5 grid gap-4">
              <Field name="trip">
                <FieldLabel>Name</FieldLabel>
                <Input defaultValue="Lisbon in May" />
              </Field>
              <label className="flex items-center justify-between gap-3 text-[13px]">
                Share the itinerary with everyone
                <Switch defaultChecked />
              </label>
            </div>
            <DialogFooter>
              <DialogClose>Cancel</DialogClose>
              <DialogClose variant="primary">Save changes</DialogClose>
            </DialogFooter>
            <DialogClose variant="icon" />
          </DialogContent>
        </Dialog>
        <Button
          variant="primary"
          data-play="toast"
          onClick={() => toaster.success("Saved to your phone", { description: "Lisbon in May, with both stays and the flights." })}
        >
          Save to phone
        </Button>
      </CardFooter>
    </Card>
  )
}

const activity = [
  { initials: "JO", who: "Jo", what: "booked the flights", when: "2h" },
  { initials: "PK", who: "Priya", what: "added a dinner", when: "Yesterday" },
  { initials: "SR", who: "Sam", what: "paid €220 for the stay", when: "Mon" },
]

function ActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>What the group changed this week</CardDescription>
        <CardAction>
          <Button size="sm" variant="ghost">See all</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3">
          {activity.map((row) => (
            <li key={row.initials} className="flex items-center gap-3 text-[13px]">
              <Avatar className="shrink-0">
                <AvatarFallback>{row.initials}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate">
                <span className="font-medium">{row.who}</span> <span className="text-muted-foreground">{row.what}</span>
              </span>
              <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">{row.when}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function ShareCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite to the trip</CardTitle>
        <CardDescription>Anyone with the link can see the plan</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Input aria-label="Invite link" readOnly defaultValue="trips.app/lisbon-may" className="min-w-0 flex-1" />
        <Button>
          <Link2 aria-hidden />
          Copy
        </Button>
      </CardContent>
    </Card>
  )
}

function StatusCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Before you go</CardTitle>
        <CardDescription>3 of 5 done</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2.5 text-[13px]">
        {[
          ["Passports checked", true],
          ["Travel insurance", true],
          ["Airport transfer", true],
          ["Restaurant for Friday", false],
          ["Tram passes", false],
        ].map(([label, done]) => (
          <label key={label as string} className="flex items-center gap-2.5">
            <Checkbox defaultChecked={done as boolean} />
            <span className={done ? "text-muted-foreground line-through decoration-muted-foreground/40" : undefined}>{label}</span>
          </label>
        ))}
        <div className="mt-1 flex flex-wrap gap-1.5">
          <Badge>Lisbon</Badge>
          <Badge variant="secondary">4 travellers</Badge>
          <Badge variant="destructive">1 overdue</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export type PreviewCard = { key: string; node: React.ReactNode; phone?: boolean }

/* The canvas. Wide enough (a tablet or larger), the cards sit in six fixed columns on a canvas wider
   than the preview that scrolls sideways: trackpad, Shift + wheel, dragging with the mouse, or the arrow
   keys once it has focus. A vertical wheel still scrolls the page; only sideways intent pans. It snaps
   gently to columns, and soft fades on the edges say there is more. Narrower (a phone), it is a plain
   vertical stack, with cards marked phone: false left out.

   Each card goes to the shortest column using its measured height, then single cards move or swap
   between the longest and shortest column until the ends meet, so columns finish together. */
const CANVAS_COLUMNS = 6
const COLUMN = 300
const GAP = 16

/* Replay steps whose target is on screen, so a replay plays what you can see. */
export function visibleSteps(root: HTMLElement | null, steps: PlayStep[]): PlayStep[] {
  if (!root) return steps
  const canvas = root.querySelector<HTMLElement>("[data-canvas]")
  const view = canvas?.getBoundingClientRect()
  return steps.filter((step) => {
    if (!step.click) return true
    const el = root.querySelector<HTMLElement>(step.click)
    if (!el) return false
    const r = el.getBoundingClientRect()
    const inPage = r.bottom > 0 && r.top < window.innerHeight
    const inCanvas = !view || (r.right > view.left + 8 && r.left < view.right - 8 && r.bottom > view.top + 8 && r.top < view.bottom - 8)
    return inPage && inCanvas
  })
}

const INTERACTIVE = "a,button,input,textarea,select,label,[role=slider],[role=tab],[role=radio],[role=checkbox],[role=switch],[role=option],[role=combobox],[contenteditable=true],[data-slot^=calendar]"

function useCanvasPan(scroller: React.RefObject<HTMLDivElement | null>, active: boolean) {
  const [edges, setEdges] = React.useState({ start: false, end: true })
  React.useEffect(() => {
    const el = scroller.current
    if (!el || !active) return
    const update = () => setEdges({ start: el.scrollLeft > 4, end: el.scrollLeft < el.scrollWidth - el.clientWidth - 4 })
    update()
    el.addEventListener("scroll", update, { passive: true })

    /* Drag to pan, for a mouse, starting anywhere that isn't a control. */
    let start: { x: number; left: number; id: number } | null = null
    let dragged = false
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || (e.target as Element).closest(INTERACTIVE)) return
      start = { x: e.clientX, left: el.scrollLeft, id: e.pointerId }
      dragged = false
    }
    const move = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return
      const dx = e.clientX - start.x
      if (!dragged && Math.abs(dx) < 5) return
      if (!dragged) {
        dragged = true
        el.setPointerCapture(e.pointerId)
        el.dataset.dragging = ""
      }
      el.scrollLeft = start.left - dx
    }
    const up = () => {
      if (!start) return
      start = null
      if (dragged) {
        delete el.dataset.dragging
        // The press that ended a drag is not a click on what it landed on.
        el.addEventListener("click", (e) => { e.stopPropagation(); e.preventDefault() }, { capture: true, once: true })
        setTimeout(() => (dragged = false), 0)
      }
    }
    /* Shift + a plain mouse wheel pans sideways in every browser and OS (some only do it natively
       for elements that can't also scroll vertically). A trackpad's own sideways motion is left alone. */
    const wheel = (e: WheelEvent) => {
      if (!e.shiftKey || e.deltaX !== 0 || e.deltaY === 0) return
      e.preventDefault()
      el.scrollBy({ left: e.deltaY, behavior: "auto" })
    }
    el.addEventListener("wheel", wheel, { passive: false })
    el.addEventListener("pointerdown", down)
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerup", up)
    el.addEventListener("pointercancel", up)
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener("wheel", wheel)
      el.removeEventListener("scroll", update)
      el.removeEventListener("pointerdown", down)
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerup", up)
      el.removeEventListener("pointercancel", up)
      ro.disconnect()
    }
  }, [scroller, active])
  return edges
}

function Masonry({ cards, run }: { cards: PreviewCard[]; run: number }) {
  const frame = React.useRef<HTMLDivElement>(null)
  const scroller = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState({ width: 0, height: 0, desktop: false })
  const wide = box.width >= 600
  const heights = React.useRef(new Map<string, number>())
  const [measured, setMeasured] = React.useState(0)
  /* On a desktop the canvas has the window's height, so it gets as many columns as it takes for the
     cards to fit it; elsewhere six columns, and the page scrolls. */
  const fit = wide && box.desktop && box.height > 360
  const [fitColumns, setFitColumns] = React.useState(CANVAS_COLUMNS)
  const columns = !wide ? 1 : fit ? fitColumns : CANVAS_COLUMNS
  const [placed, setPlaced] = React.useState<Record<string, number>>({})
  const [versions, setVersions] = React.useState<Record<string, number>>({})
  const edges = useCanvasPan(scroller, wide)

  const shown = cards.filter((card) => wide || card.phone !== false)
  const order = shown.map((card) => card.key).join()
  const place = React.useCallback((columns: number) => {
    const size = (key: string) => (heights.current.get(key) ?? 300) + GAP
    const ends = Array.from({ length: columns }, () => 0)
    const next: Record<string, number> = {}
    /* The lead card opens the first column; the rest go tallest first to the shortest column, which
       balances well. Within a column cards keep their story order. */
    const [lead, ...rest] = shown
    if (lead) {
      next[lead.key] = 0
      ends[0] += size(lead.key)
    }
    for (const card of [...rest].sort((a, b) => size(b.key) - size(a.key))) {
      const column = ends.indexOf(Math.min(...ends))
      next[card.key] = column
      ends[column] += size(card.key)
    }
    /* Then move or swap single cards between any two columns while that evens the ends (the sum of
       squares falls), which also lowers the longest column. */
    const score = (list: number[]) => list.reduce((sum, end) => sum + end * end, 0)
    for (let round = 0; round < 80 && columns > 1; round++) {
      const spread = score(ends)
      let best: { a: string; b?: string; from: number; to: number; spread: number } | null = null
      for (const a of rest) {
        const from = next[a.key]
        for (let to = 0; to < columns; to++) {
          if (to === from) continue
          const options: (string | undefined)[] = [undefined, ...rest.filter((card) => next[card.key] === to).map((card) => card.key)]
          for (const b of options) {
            const delta = size(a.key) - (b ? size(b) : 0)
            const trial = [...ends]
            trial[from] -= delta
            trial[to] += delta
            const after = score(trial)
            if (after < spread - 64 && (!best || after < best.spread)) best = { a: a.key, b, from, to, spread: after }
          }
        }
      }
      if (!best) break
      const delta = size(best.a) - (best.b ? size(best.b) : 0)
      next[best.a] = best.to
      if (best.b) next[best.b] = best.from
      ends[best.from] -= delta
      ends[best.to] += delta
    }
    return { next, longest: Math.max(...ends) - GAP }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, measured])

  /* On a desktop: the fewest columns whose longest still fits the canvas height. */
  const assign = React.useCallback(() => {
    let count = columns
    let result = place(count)
    if (fit) {
      const room = box.height - 40
      const total = shown.reduce((sum, card) => sum + (heights.current.get(card.key) ?? 300) + GAP, 0)
      for (count = Math.max(4, Math.ceil(total / (room + GAP))); count < 14; count++) {
        result = place(count)
        if (result.longest <= room) break
      }
      setFitColumns((now) => (now === count ? now : count))
    }
    const { next } = result
    setPlaced((now) => (shown.every((card) => now[card.key] === next[card.key]) ? now : next))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, fit, box.height, place])

  React.useLayoutEffect(() => {
    const el = frame.current
    if (!el) return
    const query = window.matchMedia("(min-width: 1024px)")
    const measure = () =>
      setBox((now) => {
        const next = { width: el.clientWidth, height: el.clientHeight, desktop: query.matches }
        return now.width === next.width && now.height === next.height && now.desktop === next.desktop ? now : next
      })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    query.addEventListener("change", measure)
    return () => {
      ro.disconnect()
      query.removeEventListener("change", measure)
    }
  }, [])

  React.useLayoutEffect(() => {
    const el = frame.current
    if (!el) return
    let pending = 0
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const key = (entry.target as HTMLElement).dataset.card
        if (key) heights.current.set(key, entry.borderBoxSize?.[0]?.blockSize ?? (entry.target as HTMLElement).offsetHeight)
      }
      cancelAnimationFrame(pending)
      pending = requestAnimationFrame(() => {
        assign()
        setMeasured(heights.current.size)
      })
    })
    el.querySelectorAll<HTMLElement>("[data-card]").forEach((card) => ro.observe(card))
    assign()
    return () => {
      cancelAnimationFrame(pending)
      ro.disconnect()
    }
  })

  /* Replay remounts the cards in view, so their entrances (bars growing, fills easing in) play again. */
  React.useEffect(() => {
    if (!run) return
    const root = frame.current
    if (!root) return
    const view = scroller.current?.getBoundingClientRect()
    const inView = [...root.querySelectorAll<HTMLElement>("[data-card]")]
      .filter((card) => {
        const r = card.getBoundingClientRect()
        return r.bottom > 0 && r.top < window.innerHeight && (!view || (r.right > view.left && r.left < view.right && r.bottom > view.top && r.top < view.bottom))
      })
      .map((card) => card.dataset.card!)
    setVersions((now) => ({ ...now, ...Object.fromEntries(inView.map((key) => [key, (now[key] ?? 0) + 1])) }))
  }, [run])

  /* Each card rises a beat after the one before it in reading order: column plus row, capped. */
  const column = (index: number) =>
    shown
      .filter((card, i) => (placed[card.key] ?? i % columns) === index)
      .map((card, row) => (
        <div
          key={`${card.key}-${versions[card.key] ?? 0}`}
          data-card={card.key}
          className="kf-create-rise min-w-0"
          style={{ "--rise": Math.min(index + row, 7) } as React.CSSProperties}
        >
          {card.node}
        </div>
      ))

  const fade = 40
  const mask = `linear-gradient(to right, ${edges.start ? "transparent" : "#000"} 0, #000 ${fade}px, #000 calc(100% - ${fade}px), ${edges.end ? "transparent" : "#000"} 100%)`

  return (
    <div ref={frame} className="h-full min-w-0">
      {wide ? (
        <div
          ref={scroller}
          data-canvas
          tabIndex={0}
          role="region"
          aria-label="Preview canvas. Scroll sideways, drag, or use the arrow keys."
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return
            const step = { ArrowRight: COLUMN + GAP, ArrowLeft: -(COLUMN + GAP), End: Infinity, Home: -Infinity }[event.key]
            if (step === undefined) return
            event.preventDefault()
            const el = event.currentTarget
            el.scrollTo({ left: Number.isFinite(step) ? el.scrollLeft + step : step > 0 ? el.scrollWidth : 0, behavior: "smooth" })
          }}
          className={[
            "-mx-4 overflow-x-auto overscroll-x-contain px-4 pb-4 outline-none sm:-mx-6 sm:px-6 lg:mx-0 lg:h-full lg:overflow-y-auto lg:py-5",
            "snap-x snap-proximity scroll-px-4 sm:scroll-px-6 motion-safe:scroll-smooth",
            "[scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]",
            "cursor-grab data-[dragging]:cursor-grabbing data-[dragging]:snap-none data-[dragging]:scroll-auto data-[dragging]:select-none",
            "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset",
          ].join(" ")}
          style={{ maskImage: mask, WebkitMaskImage: mask }}
        >
          <div className="grid w-max items-start lg:min-h-full lg:content-center" style={{ gap: GAP, gridTemplateColumns: `repeat(${columns}, ${COLUMN}px)` }}>
            {Array.from({ length: columns }, (_, index) => (
              <div key={index} className="grid min-w-0 snap-start" style={{ gap: GAP }}>
                {column(index)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid min-w-0" style={{ gap: GAP }}>
          {column(0)}
        </div>
      )}
    </div>
  )
}

/* The first cards render with the page; the rest load right after, in their own chunk. */
export function PresetPreview({ run = 0 }: { run?: number }) {
  const [toaster] = React.useState(() => createToaster<React.ReactNode>())
  React.useEffect(() => () => void toaster.dismiss(), [toaster])
  const [more, setMore] = React.useState<PreviewCard[]>([])
  React.useEffect(() => {
    let alive = true
    import("@site/components/create/preview-more").then((m) => alive && setMore(m.moreCards))
    return () => {
      alive = false
    }
  }, [])
  const first: PreviewCard[] = [
    { key: "countdown", node: <CountdownCard /> },
    { key: "trip", node: <TripCard /> },
    { key: "alerts", node: <AlertsCard /> },
    { key: "stays", node: <StaysCard toaster={toaster} /> },
    { key: "checklist", node: <StatusCard /> },
    { key: "activity", node: <ActivityCard /> },
    { key: "invite", node: <ShareCard />, phone: false },
  ]
  /* Interleaved so each screenful mixes the first cards with the later ones. */
  const cards = [...first.slice(0, 4), ...more.slice(0, 3), ...first.slice(4), ...more.slice(3)]
  return (
    <>
      <Masonry cards={cards} run={run} />
      <ToastRegion toaster={toaster} side="bottom" align="end" />
    </>
  )
}
