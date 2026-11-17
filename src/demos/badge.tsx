import * as React from "react"

import { Badge } from "@/components/ui/badge"

export const controls = {
  variant: { type: "select", label: "Variant", default: "default", options: ["default", "secondary", "outline", "destructive", "success"] },
  max: { type: "slider", label: "Max", default: 99, min: 5, max: 99, step: 1 },
  dot: { type: "switch", label: "Dot", default: true, group: "Behaviour" },
  count: { type: "slider", label: "Extra unread", default: 0, min: 0, max: 100, step: 1 },
  items: { type: "slider", label: "Items", default: 4, min: 1, max: 4, step: 1 },
  title: { type: "text", label: "Title", default: "Inbox" },
  receiveLabel: { type: "text", label: "Receive label", default: "Get mail" },
  readLabel: { type: "text", label: "Read label", default: "Mark all read" },
  onTime: { type: "text", label: "On time", default: "On time" },
  delayedLabel: { type: "text", label: "Delayed label", default: "Delayed 40 min" },
  booked: { type: "text", label: "Booked", default: "Booked" },
  width: { type: "slider", label: "Width", default: 420, min: 300, max: 480, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Height", default: 20, min: 16, max: 32, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 9999, min: 0, max: 9999, step: 1, unit: "px", group: "Layout" },
  font: { type: "slider", label: "Font", default: 11, min: 9, max: 16, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 6, min: 0, max: 12, step: 1, unit: "px", group: "Layout" },
  padding: { type: "slider", label: "Padding", default: 8, min: 2, max: 16, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  border: { type: "color", label: "Border", default: "", group: "Colours" },
} as const

export const meta = { name: "Badge", group: "Display" }

/* Mail arrives twice (counts roll up, the flight status flips and its dot pulses), then everything
   is marked read (counts roll down and the row badges leave). */
export const play = [
  { click: "[data-play=receive]", wait: 1700 },
  { click: "[data-play=receive]", wait: 1700 },
  { click: "[data-play=read]", wait: 2000 },
]

/* What the Customize panel under the preview offers. The demo takes the same names as props. */

const key =
  "inline-flex h-7 cursor-pointer items-center rounded-[8px] bg-background px-2.5 text-[12px] leading-none font-medium text-foreground outline-none select-none shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] motion-reduce:transition-none"

type Thread = { id: string; from: string; initials: string; subject: string; time: string; add: number }

const threads: Thread[] = [
  { id: "tap", from: "Priya Shah", initials: "PS", subject: "Train tickets attached", time: "09:41", add: 1 },
  { id: "ines", from: "Mum", initials: "M", subject: "Are you still coming Sunday?", time: "08:12", add: 3 },
  { id: "casa", from: "Gareth Price", initials: "GP", subject: "Re: boiler service", time: "Mon", add: 0 },
  { id: "bank", from: "Ellie Shaw", initials: "ES", subject: "Photos from the party", time: "Sun", add: 1 },
]

const start: Record<string, number> = { tap: 1, ines: 2, casa: 0, bank: 1 }

export default function BadgeDemo({
  variant = "default",
  max = 99,
  dot = true,
  count = 0,
  items = 4,
  title = "Inbox",
  receiveLabel = "Get mail",
  readLabel = "Mark all read",
  onTime = "On time",
  delayedLabel = "Delayed 40 min",
  booked = "Booked",
  width = 420,
  height = 20,
  radius = 9999,
  font = 11,
  gap = 6,
  padding = 8,
  face = "",
  ink = "",
  border = "",
}: {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success"
  max?: number
  dot?: boolean
  count?: number
  items?: number
  title?: string
  receiveLabel?: string
  readLabel?: string
  onTime?: string
  delayedLabel?: string
  booked?: string
  width?: number
  height?: number
  radius?: number
  font?: number
  gap?: number
  padding?: number
  face?: string
  ink?: string
  border?: string
}) {
  const theme = {
    "--badge-height": `${height}px`,
    "--badge-radius": `${radius}px`,
    "--badge-font": `${font}px`,
    "--badge-gap": `${gap}px`,
    "--badge-padding": `${padding}px`,
    ...(face ? { "--badge-face": face } : null),
    ...(ink ? { "--badge-ink": ink } : null),
    ...(border ? { "--badge-border": border } : null),
  } as React.CSSProperties
  const [unread, setUnread] = React.useState(start)
  const [delayed, setDelayed] = React.useState(false)
  const total = Object.values(unread).reduce((a, b) => a + b, 0)

  const receive = () => {
    setUnread((u) => Object.fromEntries(threads.map((t) => [t.id, u[t.id] + t.add])))
    setDelayed((d) => !d)
  }
  const readAll = () => setUnread(Object.fromEntries(threads.map((t) => [t.id, 0])))

  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full rounded-[16px] bg-card text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_-6px_rgb(0_0_0/0.08)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_6px_16px_-6px_rgb(0_0_0/0.6)]">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <Badge count={total + count} max={max} variant={variant} />
        <div className="ml-auto flex gap-1.5">
          <button type="button" data-play="receive" className={key} onClick={receive}>
            {receiveLabel}
          </button>
          <button type="button" data-play="read" className={key} onClick={readAll}>
            {readLabel}
          </button>
        </div>
      </div>
      <ul className="border-t border-border">
        {threads.slice(0, items).map((t) => {
          const n = unread[t.id]
          return (
            <li key={t.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                {t.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={"truncate text-[13px] " + (n ? "font-semibold" : "font-medium text-muted-foreground")}>
                    {t.from}
                  </span>
                  {t.id === "tap" && (
                    <Badge dot={dot} variant={delayed ? "destructive" : "success"}>
                      {delayed ? delayedLabel : onTime}
                    </Badge>
                  )}
                  {t.id === "casa" && <Badge variant="outline">{booked}</Badge>}
                </div>
                <div className="mt-0.5 truncate text-[12px] text-muted-foreground">{t.subject}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] text-muted-foreground tabular-nums">{t.time}</span>
                <span className="flex h-5 items-center">
                  {n > 0 && <Badge variant="secondary" count={n} max={max} />}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
