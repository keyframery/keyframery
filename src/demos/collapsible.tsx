import * as React from "react"

import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@/components/ui/collapsible"

export const controls = {
  open: { type: "switch", label: "Open", default: false, group: "Behaviour" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  keepMounted: { type: "switch", label: "Keep mounted", default: false, group: "Behaviour" },
  hiddenUntilFound: { type: "switch", label: "Hidden until found", default: false, group: "Behaviour" },
  stops: { type: "slider", label: "Stops", default: 3, min: 1, max: 3, step: 1 },
  title: { type: "text", label: "Title", default: "Edinburgh to London" },
  train: { type: "text", label: "Train", default: "LNER 1E07" },
  subtitle: { type: "text", label: "Subtitle", default: "Saturday 16 May, coach 4, seat 61" },
  showLabel: { type: "text", label: "Show label", default: "Show 3 more stops" },
  hideLabel: { type: "text", label: "Hide label", default: "Hide stops" },
  departure: { type: "text", label: "Departure", default: "Edinburgh Waverley" },
  arrival: { type: "text", label: "Arrival", default: "London King's Cross" },
  width: { type: "slider", label: "Width", default: 420, min: 300, max: 480, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Height", default: 36, min: 28, max: 48, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 9, min: 0, max: 20, step: 1, unit: "px", group: "Layout" },
  font: { type: "slider", label: "Font", default: 13, min: 11, max: 17, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 12, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  muted: { type: "color", label: "Muted", default: "", group: "Colours" },
} as const

export const meta = { name: "Collapsible", group: "Disclosure" }

/* Opens and closes the hidden stops, so they cascade in as the height opens. */
export const play = [
  { click: '[data-slot="collapsible-trigger"]', wait: 2000 },
  { click: '[data-slot="collapsible-trigger"]', wait: 1500 },
]

const middle = [
  { time: "09:31", name: "Darlington" },
  { time: "10:02", name: "York" },
  { time: "10:34", name: "Doncaster" },
]

function Stop({
  time,
  name,
  detail,
  end,
}: {
  time: string
  name: string
  detail?: string
  end?: boolean
}) {
  return (
    <div className="grid grid-cols-[44px_20px_1fr] items-center py-2 leading-5">
      <span className="text-[12px] text-muted-foreground tabular-nums">{time}</span>
      <span className="grid place-items-center">
        <span
          className={
            end
              ? "relative z-10 size-2.5 rounded-full bg-primary ring-4 ring-card"
              : "relative z-10 size-1.5 rounded-full bg-muted-foreground/60 ring-4 ring-card"
          }
        />
      </span>
      <span className="flex items-baseline gap-2 pl-2">
        <span className={end ? "text-[14px] font-medium" : "text-[13px]"}>{name}</span>
        {detail && <span className="text-[12px] text-muted-foreground">{detail}</span>}
      </span>
    </div>
  )
}

export default function CollapsibleDemo({
  open = false,
  disabled = false,
  keepMounted = false,
  hiddenUntilFound = false,
  stops = 3,
  title = "Edinburgh to London",
  train = "LNER 1E07",
  subtitle = "Saturday 16 May, coach 4, seat 61",
  showLabel = "Show 3 more stops",
  hideLabel = "Hide stops",
  departure = "Edinburgh Waverley",
  arrival = "London King's Cross",
  width = 420,
  height = 36,
  radius = 9,
  font = 13,
  gap = 12,
  face = "",
  ink = "",
  muted = "",
}: {
  open?: boolean
  disabled?: boolean
  keepMounted?: boolean
  hiddenUntilFound?: boolean
  stops?: number
  title?: string
  train?: string
  subtitle?: string
  showLabel?: string
  hideLabel?: string
  departure?: string
  arrival?: string
  width?: number
  height?: number
  radius?: number
  font?: number
  gap?: number
  face?: string
  ink?: string
  muted?: string
}) {
  const [expanded, setExpanded] = React.useState(open)
  React.useEffect(() => setExpanded(open), [open])
  const theme = {
    "--collapsible-height": `${height}px`,
    "--collapsible-radius": `${radius}px`,
    "--collapsible-font": `${font}px`,
    "--collapsible-gap": `${gap}px`,
    ...(face ? { "--collapsible-face": face } : null),
    ...(ink ? { "--collapsible-ink": ink } : null),
    ...(muted ? { "--collapsible-muted": muted } : null),
  } as React.CSSProperties
  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <p className="text-[12px] text-muted-foreground tabular-nums">{train}</p>
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>

      <div className="relative mt-4 rounded-[14px] bg-card px-4 py-2 shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
        {/* The line the stops sit on. */}
        <span aria-hidden className="absolute top-6 bottom-6 left-[69px] w-px bg-border" />
        <Stop time="08:09" name={departure} detail="Platform 5" end />
        <Stop time="08:52" name="Newcastle" />
        <Collapsible open={expanded} onOpenChange={setExpanded} disabled={disabled}>
          <CollapsibleTrigger className="ml-[62px] w-[calc(100%-62px)]">
            {(state) => (state.open ? hideLabel : showLabel)}
          </CollapsibleTrigger>
          <CollapsiblePanel keepMounted={keepMounted} hiddenUntilFound={hiddenUntilFound}>
            {middle.slice(0, stops).map((stop) => (
              <Stop key={stop.name} time={stop.time} name={stop.name} />
            ))}
          </CollapsiblePanel>
        </Collapsible>
        <Stop time="11:05" name="Peterborough" />
        <Stop time="11:14" name={arrival} detail="Arrives on time" end />
      </div>
    </div>
  )
}
