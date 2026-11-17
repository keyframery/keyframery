import { Archive, ChevronDown, ChevronLeft, ChevronRight, Clock3, Reply, Trash2 } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group"

export const meta = { name: "Button Group", group: "Actions" }

/* The demo plays itself: the pointer runs along the actions, so one highlight glides from segment to
   segment, then pages to the next message. */
export const play = [
  { hover: '[data-action="archive"]', wait: 700 },
  { hover: '[data-action="snooze"]', wait: 700 },
  { hover: '[data-action="delete"]', wait: 900 },
  { unhover: '[data-slot="button-group"][aria-label="Message actions"]', wait: 900 },
  { hover: '[data-action="next"]', wait: 500 },
  { click: '[data-action="next"]', wait: 1200 },
  { hover: '[data-action="previous"]', wait: 500 },
  { click: '[data-action="previous"]', wait: 1000 },
  { unhover: '[data-slot="button-group"][aria-label="Pages"]', wait: 1200 },
]

export const controls = {
  orientation: { type: "select", label: "Orientation", options: ["horizontal", "vertical"], default: "horizontal" },
  size: { type: "select", label: "Size", options: ["md", "sm"], default: "md" },
  themeFace: { type: "color", label: "Counter surface", default: "", group: "Colours" },
  themeInk: { type: "color", label: "Counter text", default: "", group: "Colours" },
  themeLine: { type: "color", label: "Separator", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "Counter corners", min: 0, max: 20, step: 1, default: 9, unit: "px", group: "Layout" },
  themeFont: { type: "slider", label: "Counter size", min: 10, max: 18, step: 1, default: 13, unit: "px", group: "Layout" },
  themeGap: { type: "slider", label: "Nested group gap", min: 0, max: 16, step: 1, default: 8, unit: "px", group: "Layout" },
  themeInsetX: { type: "slider", label: "Counter padding", min: 0, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
  counterPrefix: { type: "text", label: "Counter prefix", default: "", group: "Content" },
} as const

const messages = [
  {
    from: "Lena Okafor",
    photo: "/demo/face-2.jpg",
    time: "09:42",
    subject: "Call sheet for the Lisbon shoot",
    body: "We're on the Alfama rooftop from 6:30 for first light. Vans leave the hotel at 5:45.",
  },
  {
    from: "Tomás Reyes",
    photo: "/demo/face-3.jpg",
    time: "08:15",
    subject: "Drone permit came through",
    body: "Approved for the river front on Thursday morning only. Scan attached, keep it on you.",
  },
]

export default function ButtonGroupDemo({
  orientation = "horizontal",
  size = "md",
  themeFace = "",
  themeInk = "",
  themeLine = "",
  themeRadius = 9,
  themeFont = 13,
  themeGap = 8,
  themeInsetX = 12,
  counterPrefix = "",
}: {
  orientation?: "horizontal" | "vertical"
  size?: "md" | "sm"
  themeFace?: string
  themeInk?: string
  themeLine?: string
  themeRadius?: number
  themeFont?: number
  themeGap?: number
  themeInsetX?: number
  counterPrefix?: string
}) {
  const [page, setPage] = React.useState(0)
  const message = messages[page]
  const icon = size === "sm" ? "icon-sm" : "icon"

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--button-group-face": themeFace } : null),
    ...(themeInk ? { "--button-group-ink": themeInk } : null),
    ...(themeLine ? { "--button-group-line": themeLine } : null),
    ...(themeRadius !== 9 ? { "--button-group-radius": `${themeRadius}px` } : null),
    ...(themeFont !== 13 ? { "--button-group-font": `${themeFont}px` } : null),
    ...(themeGap !== 8 ? { "--button-group-gap": `${themeGap}px` } : null),
    ...(themeInsetX !== 12 ? { "--button-group-inset-x": `${themeInsetX}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[560px] rounded-[18px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div className="flex items-start justify-between gap-2 border-b border-border p-3">
        <ButtonGroup aria-label="Message actions" orientation={orientation}>
          <Button size={size} data-action="archive" aria-label="Archive" className="@max-[26rem]:px-2">
            <Archive />
            <span className="@max-[26rem]:sr-only">Archive</span>
          </Button>
          <Button size={size} data-action="snooze" aria-label="Snooze" className="@max-[26rem]:px-2">
            <Clock3 />
            <span className="@max-[26rem]:sr-only">Snooze</span>
          </Button>
          <Button size={icon} data-action="delete" aria-label="Delete" variant="destructive">
            <Trash2 />
          </Button>
        </ButtonGroup>

        <div className="flex items-start gap-[var(--button-group-gap,0.5rem)]">
          <ButtonGroup aria-label="Pages">
            <ButtonGroupText className="tabular-nums @max-[26rem]:px-[var(--button-group-inset-x,0.5rem)]">
              <span className="@max-[26rem]:hidden">{counterPrefix}{page + 3} of 128</span>
              <span className="hidden @max-[26rem]:inline">{counterPrefix}{page + 3}/128</span>
            </ButtonGroupText>
            <Button size={icon} data-action="previous" aria-label="Previous message" onClick={() => setPage(0)}>
              <ChevronLeft />
            </Button>
            <Button size={icon} data-action="next" aria-label="Next message" onClick={() => setPage(1)}>
              <ChevronRight />
            </Button>
          </ButtonGroup>
          <ButtonGroup aria-label="Reply">
            <Button size={size} variant="primary" className="@max-[26rem]:px-2" aria-label="Reply">
              <Reply />
              <span className="@max-[26rem]:sr-only">Reply</span>
            </Button>
            <ButtonGroupSeparator className="bg-[var(--button-group-line,color-mix(in_oklab,var(--primary-foreground)_25%,transparent))]" />
            <Button size={icon} variant="primary" aria-label="More ways to reply" className="w-7">
              <ChevronDown />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      <div key={page} className="flex gap-3 p-5">
        <img src={message.photo} alt="" className="size-10 shrink-0 rounded-full bg-muted object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] font-medium">{message.from}</span>
            <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">{message.time}</span>
          </div>
          <div className="mt-1 truncate text-[15px] font-semibold tracking-tight">{message.subject}</div>
          <p className="mt-2 text-[13px] leading-5 text-muted-foreground">{message.body}</p>
        </div>
      </div>
    </div>
  )
}
