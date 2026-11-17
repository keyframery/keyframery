import * as React from "react"

import {
  createScrollAreaController,
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@/components/ui/scroll-area"

export const meta = { name: "Scroll Area", group: "Layout" }

/* The demo plays itself: the pointer arrives and the scrollbar fades in, the thumb thickens
   under it, and the list runs to its last guest and back. */
export const play = [
  { hover: '[data-slot="scroll-area"]', wait: 900 },
  { hover: '[data-slot="scroll-area-scrollbar"]', wait: 1000 },
  { click: '[data-play="last"]', wait: 1400 },
  { unhover: '[data-slot="scroll-area-scrollbar"]', wait: 700 },
  { click: '[data-play="first"]', wait: 1400 },
  { unhover: '[data-slot="scroll-area"]', wait: 1600 },
]

function Chevron({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-3.5">
      <path d={d} />
    </svg>
  )
}

const jump =
  "grid size-7 cursor-pointer place-items-center rounded-[8px] text-muted-foreground outline-none transition-[background-color,color,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-pop hover:bg-accent hover:text-foreground active:scale-[0.94] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card motion-reduce:transition-none"

const guests = [
  { name: "Clare Dawson", note: "Hosting", reply: "Going" },
  { name: "Ben Morley", note: "Plus one", reply: "Going" },
  { name: "Nadia Haddad", note: "Vegetarian", reply: "Going" },
  { name: "Rob Fenwick", note: "Arrives Friday", reply: "Maybe" },
  { name: "Ellie Shaw", note: "Plus one", reply: "Going" },
  { name: "Gareth Price", note: "Bringing dessert", reply: "Going" },
  { name: "Priya Nair", note: "Vegan", reply: "Going" },
  { name: "Mateo Álvarez", note: "Driving up from Bristol", reply: "Going" },
  { name: "Freya Lindqvist", note: "Plus one", reply: "Maybe" },
  { name: "Omar Haddad", note: "No shellfish", reply: "Going" },
  { name: "Chloe Bennett", note: "Leaves early", reply: "Going" },
  { name: "Jun Park", note: "Plus one", reply: "No reply" },
  { name: "Sofia Ricci", note: "Bringing wine", reply: "Going" },
  { name: "Noah Fischer", note: "Arrives Saturday", reply: "Going" },
  { name: "Amara Okafor", note: "Gluten free", reply: "Going" },
  { name: "Lucas Martin", note: "Plus one", reply: "Maybe" },
  { name: "Elif Demir", note: "Vegetarian", reply: "Going" },
  { name: "Daniel Cohen", note: "Playing guitar", reply: "Going" },
  { name: "Hana Kimura", note: "Plus one", reply: "Going" },
  { name: "Marco Bianchi", note: "Taking photos", reply: "Going" },
  { name: "Leila Farahani", note: "Arrives Friday", reply: "No reply" },
  { name: "Oskar Nilsson", note: "No nuts", reply: "Going" },
  { name: "Grace Liu", note: "Plus one", reply: "Maybe" },
  { name: "Rafael Costa", note: "Bringing flowers", reply: "Going" },
]

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")

export const controls = {
  type: { type: "select", label: "Scrollbar visibility", default: "hover", options: ["hover", "scroll", "auto", "always"] },
  orientation: { type: "select", label: "Scroll axis", default: "vertical", options: ["vertical", "horizontal"] },
  behavior: { type: "select", label: "Jump behaviour", default: "smooth", options: ["smooth", "instant"] },
  stickToEnd: { type: "switch", label: "Stick to end", default: false, group: "Behaviour" },
  scrollHideDelay: { type: "slider", label: "Hide delay", default: 600, min: 0, max: 1600, step: 100, unit: "ms", group: "Behaviour" },
  title: { type: "text", label: "Heading", default: "Garden party" },
  regionLabel: { type: "text", label: "List label", default: "Guest list" },
  items: { type: "slider", label: "Guests", default: 24, min: 4, max: 24, step: 1, unit: "", group: "Layout" },
  width: { type: "slider", label: "Width", default: 320, min: 280, max: 480, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Viewport height", default: 284, min: 180, max: 380, step: 1, unit: "px", group: "Layout" },
  rowHeight: { type: "slider", label: "Guest row height", default: 48, min: 40, max: 72, step: 1, unit: "px", group: "Layout" },
  rowGap: { type: "slider", label: "Guest row gap", default: 0, min: 0, max: 16, step: 1, unit: "px", group: "Layout" },
  thickness: { type: "slider", label: "Thumb thickness", default: 8, min: 4, max: 12, step: 1, unit: "px", group: "Layout" },
  scrollbarSize: { type: "slider", label: "Scrollbar area", default: 14, min: 14, max: 24, step: 1, unit: "px", group: "Layout" },
  fade: { type: "slider", label: "Edge fade", default: 24, min: 0, max: 48, step: 1, unit: "px", group: "Layout" },
  corners: { type: "select", label: "Thumb corners", default: "pill", options: ["pill", "soft", "square"] },
  thumb: { type: "color", label: "Scrollbar thumb", default: "", group: "Colours" },
  keyColour: { type: "color", label: "Jump buttons", default: "", group: "Colours" },
  ink: { type: "color", label: "Jump icons", default: "", group: "Colours" },
  focus: { type: "color", label: "Viewport focus", default: "", group: "Colours" },
} as const

export default function ScrollAreaDemo({
  type = "hover",
  orientation = "vertical",
  behavior = "smooth",
  stickToEnd = false,
  scrollHideDelay = 600,
  title = "Garden party",
  regionLabel = "Guest list",
  items = 24,
  width = 320,
  height = 284,
  rowHeight = 48,
  rowGap = 0,
  thickness = 8,
  scrollbarSize = 14,
  fade = 24,
  corners = "pill",
  thumb = "",
  keyColour = "",
  ink = "",
  focus = "",
}: {
  type?: "hover" | "scroll" | "auto" | "always"
  orientation?: "vertical" | "horizontal"
  behavior?: "smooth" | "instant"
  stickToEnd?: boolean
  scrollHideDelay?: number
  title?: string
  regionLabel?: string
  items?: number
  width?: number
  height?: number
  rowHeight?: number
  rowGap?: number
  thickness?: number
  scrollbarSize?: number
  fade?: number
  corners?: "pill" | "soft" | "square"
  thumb?: string
  keyColour?: string
  ink?: string
  focus?: string
}) {
  const theme = {
    "--scroll-area-thickness": `${thickness}px`,
    "--scroll-area-scrollbar-size": `${scrollbarSize}px`,
    "--scroll-area-fade": `${fade}px`,
    "--scroll-area-radius": corners === "pill" ? "9999px" : corners === "soft" ? "4px" : "0px",
    ...(thumb ? { "--scroll-area-thumb": thumb } : {}),
    ...(keyColour ? { "--scroll-area-key": keyColour } : {}),
    ...(ink ? { "--scroll-area-ink": ink } : {}),
    ...(focus ? { "--scroll-area-focus": focus } : {}),
  } as React.CSSProperties
  const [controller] = React.useState(createScrollAreaController)
  /* Scripted pointer events cannot set :hover, so the demo mirrors it as data-hovered. */
  const [overBar, setOverBar] = React.useState(false)
  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full max-w-[320px] rounded-[14px] bg-card p-1.5 text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div className="flex items-center justify-between gap-3 py-1.5 pr-1 pl-2.5">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground tabular-nums">{guests.slice(0, items).filter((guest) => guest.reply === "Going").length} of {items} going</p>
        </div>
        <div className="flex items-center gap-0.5">
          <button type="button" data-play="first" aria-label="First guest" className={jump + " bg-[var(--scroll-area-key,transparent)] text-[color:var(--scroll-area-ink,var(--muted-foreground))]"} onClick={() => controller.scrollToStart({ behavior })}>
            <Chevron d="M4.5 9.75 8 6.25l3.5 3.5" />
          </button>
          <button type="button" data-play="last" aria-label="Last guest" className={jump + " bg-[var(--scroll-area-key,transparent)] text-[color:var(--scroll-area-ink,var(--muted-foreground))]"} onClick={() => controller.scrollToEnd({ behavior })}>
            <Chevron d="M4.5 6.25 8 9.75l3.5-3.5" />
          </button>
        </div>
      </div>
      <ScrollArea controller={controller} type={type} stickToEnd={stickToEnd} scrollHideDelay={scrollHideDelay} style={{ height }} className="h-[284px] rounded-[9px]">
        <ScrollAreaViewport role="region" aria-label={regionLabel}>
          <ScrollAreaContent>
            <ul style={{ display: "flex", flexDirection: orientation === "horizontal" ? "row" : "column", gap: rowGap }}>
              {guests.slice(0, items).map((guest) => (
                <li key={guest.name} style={{ height: orientation === "horizontal" ? height : rowHeight, flexShrink: 0, minWidth: orientation === "horizontal" ? 280 : undefined }} className="flex h-12 items-center gap-3 px-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                    {initials(guest.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] leading-[1.3] font-medium">{guest.name}</span>
                    <span className="block truncate text-[12px] leading-[1.3] text-muted-foreground">{guest.note}</span>
                  </span>
                  <span
                    className={
                      "mr-2 ml-auto shrink-0 text-[12px] " +
                      (guest.reply === "Going" ? "font-medium text-foreground" : "text-muted-foreground")
                    }
                  >
                    {guest.reply}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar
          orientation={orientation}
          data-hovered={overBar || undefined}
          onPointerEnter={() => setOverBar(true)}
          onPointerLeave={() => setOverBar(false)}
        >
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
      </ScrollArea>
    </div>
  )
}
