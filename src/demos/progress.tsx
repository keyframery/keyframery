import * as React from "react"

import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@/components/ui/progress"

export const meta = { name: "Progress", group: "Display" }

/* Uploads in steps to the green finish, then starts over: the fill springs and the value rolls. */
export const play = [
  { click: "[data-play=more]", wait: 1300 },
  { click: "[data-play=more]", wait: 1300 },
  { click: "[data-play=more]", wait: 1300 },
  { click: "[data-play=more]", wait: 2000 },
  { click: "[data-play=reset]", wait: 1500 },
]

const key =
  "inline-flex h-8 cursor-pointer items-center rounded-[9px] bg-background px-3 text-[13px] leading-none font-medium text-foreground outline-none select-none shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[translate,scale,box-shadow,opacity] duration-[calc(100ms*var(--kf-speed,1))] ease-house active:translate-y-px active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-50 dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] motion-reduce:transition-none"

export const controls = {
  title: { type: "text", label: "Album", default: "Grandad’s 80th" },
  description: { type: "text", label: "Description", default: "Adding photos from Ellie’s phone" },
  label: { type: "text", label: "Progress label", default: "Uploading photos" },
  total: { type: "slider", label: "Total photos", default: 24, min: 12, max: 60, step: 1, unit: "", group: "Reading" },
  initialDone: { type: "slider", label: "Uploaded photos", default: 9, min: 0, max: 24, step: 1, unit: "", group: "Reading" },
  batch: { type: "slider", label: "Upload batch", default: 5, min: 1, max: 10, step: 1, unit: "", group: "Behaviour" },
  indeterminate: { type: "switch", label: "Unknown progress", default: false, group: "Behaviour" },
  showValue: { type: "switch", label: "Show value", default: true, group: "Behaviour" },
  min: { type: "slider", label: "Minimum", default: 0, min: 0, max: 30, step: 1, unit: "", group: "Reading" },
  max: { type: "slider", label: "Maximum", default: 100, min: 50, max: 150, step: 1, unit: "", group: "Reading" },
  format: { type: "select", label: "Number format", default: "percent", options: ["percent", "decimal"] },
  width: { type: "slider", label: "Width", default: 400, min: 280, max: 480, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Label gap", default: 8, min: 2, max: 20, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Track height", default: 6, min: 3, max: 16, step: 1, unit: "px", group: "Layout" },
  corners: { type: "select", label: "Track corners", default: "pill", options: ["pill", "soft", "square"] },
  fill: { type: "color", label: "Fill", default: "", group: "Colours" },
  track: { type: "color", label: "Track", default: "", group: "Colours" },
  ink: { type: "color", label: "Label", default: "", group: "Colours" },
  valueColour: { type: "color", label: "Value", default: "", group: "Colours" },
  complete: { type: "color", label: "Completed fill", default: "", group: "Colours" },
} as const

export default function ProgressDemo({
  title = "Grandad’s 80th",
  description = "Adding photos from Ellie’s phone",
  label = "Uploading photos",
  total = 24,
  initialDone = 9,
  batch = 5,
  indeterminate = false,
  showValue = true,
  min = 0,
  max = 100,
  format = "percent",
  width = 400,
  gap = 8,
  height = 6,
  corners = "pill",
  fill = "",
  track = "",
  ink = "",
  valueColour = "",
  complete = "",
}: {
  title?: string
  description?: string
  label?: string
  total?: number
  initialDone?: number
  batch?: number
  indeterminate?: boolean
  showValue?: boolean
  min?: number
  max?: number
  format?: "percent" | "decimal"
  width?: number
  gap?: number
  height?: number
  corners?: "pill" | "soft" | "square"
  fill?: string
  track?: string
  ink?: string
  valueColour?: string
  complete?: string
}) {
  const theme = {
    "--progress-height": `${height}px`,
    "--progress-gap": `${gap}px`,
    "--progress-radius": corners === "pill" ? "9999px" : corners === "soft" ? "4px" : "0px",
    ...(valueColour ? { "--progress-value-ink": valueColour } : {}),
    ...(fill ? { "--progress-fill": fill } : {}),
    ...(track ? { "--progress-track": track } : {}),
    ...(ink ? { "--progress-ink": ink } : {}),
    ...(complete ? { "--progress-complete": complete } : {}),
  } as React.CSSProperties
  const [done, setDone] = React.useState(initialDone)
  React.useEffect(() => setDone(Math.min(initialDone, total)), [initialDone, total])
  const finished = done >= total
  const minutes = Math.ceil((total - done) / 6)

  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full max-w-[400px]">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <p className="text-[12px] text-muted-foreground tabular-nums">Shared album</p>
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>

      <div className="mt-4 rounded-[14px] bg-card p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
        <Progress value={indeterminate ? null : (done / total) * 100} min={min} max={max} format={{ style: format }}>
          <ProgressLabel>{finished ? "All photos uploaded" : label}</ProgressLabel>
          {showValue && <ProgressValue />}
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
        <p className="mt-2 text-[12px] text-muted-foreground tabular-nums">
          {done} of {total} photos
          {finished ? " · 186 MB" : ` · about ${minutes} min left`}
        </p>

        <div className="my-4 h-px bg-border" />

        <Progress value={finished ? 100 : null}>
          <ProgressLabel className="font-normal text-muted-foreground">
            {finished ? "Thumbnails ready" : "Making thumbnails"}
          </ProgressLabel>
          <ProgressTrack style={{ height: height * 2 / 3 }} className="h-1">
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            data-play="more"
            className={key}
            disabled={finished}
            onClick={() => setDone((d) => Math.min(total, d + batch))}
          >
            Upload {batch} more
          </button>
          <button type="button" data-play="reset" className={key} onClick={() => setDone(0)}>
            Start over
          </button>
        </div>
      </div>
    </div>
  )
}
