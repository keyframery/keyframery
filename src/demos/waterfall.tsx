import * as React from "react"

import {
  visibleWaterfallRows,
  Waterfall,
  WaterfallAxis,
  WaterfallBar,
  WaterfallCell,
  WaterfallColumnHeader,
  WaterfallHeaderRow,
  WaterfallIndicator,
  WaterfallMark,
  WaterfallRow,
  WaterfallRowHeader,
  type WaterfallData,
} from "@/components/ui/waterfall"

export const meta = { name: "Waterfall", group: "Data" }

/* The demo plays itself: opening a span cascades its requests in, and switching to a cached load
   makes every bar and the DOMContentLoaded mark glide to the new timings. */
export const play = [
  { click: '[data-row="feed"] [data-slot="waterfall-indicator"]', wait: 1800 },
  { click: '[data-load="cached"]', wait: 1900 },
  { click: '[data-row="app"] [data-slot="waterfall-indicator"]', wait: 1800 },
  { click: '[data-row="feed"] [data-slot="waterfall-indicator"]', wait: 1000 },
  { click: '[data-row="app"] [data-slot="waterfall-indicator"]', wait: 900 },
  { click: '[data-load="cold"]', wait: 1900 },
]

type Load = "cold" | "cached"

/* [start, duration] per request, for a first visit and a repeat visit. */
const timings: Record<Load, Record<string, [number, number]>> = {
  cold: {
    doc: [0, 180], css: [190, 110], app: [195, 430], vendor: [210, 300], home: [240, 220],
    font: [320, 240], feed: [640, 380], me: [650, 120], posts: [665, 290], likes: [800, 170], hero: [700, 420],
  },
  cached: {
    doc: [0, 60], css: [64, 14], app: [66, 96], vendor: [70, 62], home: [74, 48],
    font: [80, 22], feed: [150, 230], me: [154, 70], posts: [160, 160], likes: [236, 110], hero: [170, 150],
  },
}
const loadedAt: Record<Load, number> = { cold: 630, cached: 168 }

const names: Record<string, string> = {
  doc: "/", css: "app.css", app: "app.js", vendor: "vendor.js", home: "home.js", font: "inter.woff2",
  feed: "api/feed", me: "api/me", posts: "api/posts", likes: "api/likes", hero: "hero.avif",
}

const tree: [string, string[]?][] = [["doc"], ["css"], ["app", ["vendor", "home"]], ["font"], ["feed", ["me", "posts", "likes"]], ["hero"]]

function build(load: Load): WaterfallData {
  const span = (id: string) => ({ value: id, label: names[id], start: timings[load][id][0], duration: timings[load][id][1] })
  return tree.map(([id, kids]) => ({ ...span(id), ...(kids ? { children: kids.map(span) } : {}) }))
}

const ms = { style: "unit", unit: "millisecond", unitDisplay: "narrow" } as const

const keySurface =
  "bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]"

export const controls = {
  visit: { type: "select", label: "Visit", options: ["cold", "cached"], default: "cold" },
  expanded: { type: "select", label: "Expanded", options: ["none", "app", "feed", "all"], default: "none" },
  selected: { type: "select", label: "Selected", options: ["none", "doc", "css", "app", "font", "feed", "hero"], default: "none" },
  items: { type: "slider", label: "Top-level requests", min: 1, max: 6, step: 1, default: 6, unit: "", group: "Layout" },
  showMark: { type: "switch", label: "Show mark", default: true, group: "Behaviour" },
  showTimes: { type: "switch", label: "Show times", default: true, group: "Behaviour" },
  zoom: { type: "slider", label: "Time zoom", min: 1, max: 4, step: 1, default: 1, unit: "×", group: "Layout" },
  ticks: { type: "slider", label: "Axis ticks", min: 2, max: 8, step: 1, default: 5, unit: "", group: "Layout" },
  phoneTicks: { type: "slider", label: "Phone ticks", min: 2, max: 5, step: 1, default: 3, unit: "", group: "Layout" },
  title: { type: "text", label: "Title", default: "lume.shop / home" },
  markLabel: { type: "text", label: "Mark label", default: "DOMContentLoaded" },
  width: { type: "slider", label: "Width", min: 300, max: 760, step: 1, default: 560, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Column gap", min: 4, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Row height", min: 24, max: 48, step: 1, default: 32, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", min: 0, max: 28, step: 1, default: 14, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  bar: { type: "color", label: "Bar", default: "", group: "Colours" },
  muted: { type: "color", label: "Muted", default: "", group: "Colours" },
  mark: { type: "color", label: "Mark", default: "", group: "Colours" },
} as const

export default function WaterfallDemo({
  visit = "cold",
  expanded = "none",
  selected = "none",
  items = 6,
  showMark = true,
  showTimes = true,
  zoom = 1,
  ticks = 5,
  phoneTicks = 3,
  title = "lume.shop / home",
  markLabel = "DOMContentLoaded",
  width = 560,
  gap = 12,
  height = 32,
  radius = 14,
  face = "",
  ink = "",
  bar = "",
  muted = "",
  mark = "",
}: {
  visit?: "cold" | "cached"
  expanded?: "none" | "app" | "feed" | "all"
  selected?: "none" | "doc" | "css" | "app" | "font" | "feed" | "hero"
  items?: number
  showMark?: boolean
  showTimes?: boolean
  zoom?: number
  ticks?: number
  phoneTicks?: number
  title?: string
  markLabel?: string
  width?: number
  gap?: number
  height?: number
  radius?: number
  face?: string
  ink?: string
  bar?: string
  muted?: string
  mark?: string
} = {}) {
  const theme = {
    "--waterfall-gap": `${gap}px`,
    "--waterfall-height": `${height}px`,
    "--waterfall-radius": `${radius}px`,
    ...(face ? { "--waterfall-face": face } : {}),
    ...(ink ? { "--waterfall-ink": ink } : {}),
    ...(bar ? { "--waterfall-bar": bar } : {}),
    ...(muted ? { "--waterfall-muted": muted } : {}),
    ...(mark ? { "--waterfall-marker-color": mark } : {}),
  } as React.CSSProperties
  const [load, setLoad] = React.useState<Load>(visit)
  React.useEffect(() => setLoad(visit), [visit])
  const data = React.useMemo(() => build(load).slice(0, items), [load, items])
  /* Render every row and let the waterfall hide the ones inside a closed span. */
  const rows = React.useMemo(() => visibleWaterfallRows(data, ["app", "feed"]), [data])
  const total = Math.max(...Object.values(timings[load]).map(([s, d]) => s + d))

  /* On a phone the time column goes, the bars carry the timing, and the axis keeps three ticks. */
  const root = React.useRef<HTMLDivElement>(null)
  const [narrow, setNarrow] = React.useState(false)
  React.useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ro = new ResizeObserver(() => setNarrow(el.clientWidth < 480))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={root} style={{ ...theme, maxWidth: width }} className="@container w-full">
      <div className="mb-3 flex items-end justify-between gap-3 @max-[30rem]:flex-col @max-[30rem]:items-start">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-[12px] text-muted-foreground tabular-nums">
            {rows.length} requests · finished in {total.toLocaleString("en")} ms
          </p>
        </div>
        <div className="flex gap-0.5 rounded-[11px] bg-muted p-0.5 shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]">
          {(["cold", "cached"] as const).map((l) => (
            <button
              key={l}
              type="button"
              data-load={l}
              aria-pressed={load === l}
              onClick={() => setLoad(l)}
              className={[
                "h-7 rounded-[9px] px-2.5 text-[12px] leading-none font-medium outline-none transition-[color,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                load === l ? `${keySurface} text-foreground` : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {l === "cold" ? "First visit" : "Repeat visit"}
            </button>
          ))}
        </div>
      </div>

      <Waterfall key={expanded + selected} defaultExpanded={expanded === "all" ? ["app", "feed"] : expanded === "none" ? [] : [expanded]} defaultValue={selected === "none" ? undefined : selected} range={zoom === 1 ? undefined : [0, total / zoom]} style={{ gridTemplateColumns: showTimes ? undefined : (narrow ? "108px minmax(0,1fr)" : "140px minmax(0,1fr)") }} aria-label="Network requests" items={data} format={ms} className="grid-cols-[140px_56px_minmax(0,1fr)] @max-[30rem]:grid-cols-[108px_minmax(0,1fr)]">
        <WaterfallHeaderRow>
          <WaterfallColumnHeader>Request</WaterfallColumnHeader>
          {showTimes && <WaterfallColumnHeader className="justify-end @max-[30rem]:hidden">Time</WaterfallColumnHeader>}
          <WaterfallColumnHeader aria-label="Timeline">
            <WaterfallAxis maxTicks={narrow ? phoneTicks : ticks} />
            {showMark && <WaterfallMark time={loadedAt[load]}>{markLabel}</WaterfallMark>}
          </WaterfallColumnHeader>
        </WaterfallHeaderRow>
        {rows.map(({ item }) => (
          <WaterfallRow key={item.value} value={item.value} data-row={item.value}>
            <WaterfallRowHeader>
              {item.children && <WaterfallIndicator />}
              {item.label}
            </WaterfallRowHeader>
            {showTimes && <WaterfallCell className="justify-end @max-[30rem]:hidden">{item.duration} ms</WaterfallCell>}
            <WaterfallBar />
          </WaterfallRow>
        ))}
      </Waterfall>
    </div>
  )
}
