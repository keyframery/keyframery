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

export default function WaterfallDemo() {
  const [load, setLoad] = React.useState<Load>("cold")
  const items = React.useMemo(() => build(load), [load])
  /* Render every row and let the waterfall hide the ones inside a closed span. */
  const rows = React.useMemo(() => visibleWaterfallRows(items, ["app", "feed"]), [items])
  const total = Math.max(...Object.values(timings[load]).map(([s, d]) => s + d))

  return (
    <div className="w-[560px]">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">lume.shop / home</h3>
          <p className="mt-1 text-[12px] text-muted-foreground tabular-nums">
            11 requests · finished in {total.toLocaleString("en")} ms
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

      <Waterfall aria-label="Network requests" items={items} format={ms} className="grid-cols-[140px_56px_minmax(0,1fr)]">
        <WaterfallHeaderRow>
          <WaterfallColumnHeader>Request</WaterfallColumnHeader>
          <WaterfallColumnHeader className="justify-end">Time</WaterfallColumnHeader>
          <WaterfallColumnHeader aria-label="Timeline">
            <WaterfallAxis maxTicks={5} />
            <WaterfallMark time={loadedAt[load]}>DOMContentLoaded</WaterfallMark>
          </WaterfallColumnHeader>
        </WaterfallHeaderRow>
        {rows.map(({ item }) => (
          <WaterfallRow key={item.value} value={item.value} data-row={item.value}>
            <WaterfallRowHeader>
              {item.children && <WaterfallIndicator />}
              {item.label}
            </WaterfallRowHeader>
            <WaterfallCell className="justify-end">{item.duration} ms</WaterfallCell>
            <WaterfallBar />
          </WaterfallRow>
        ))}
      </Waterfall>
    </div>
  )
}
