import * as React from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export const meta = { name: "Spinner", group: "Feedback" }

/* The demo plays itself: backing up the albums, each one gets a spinner while it uploads and a
   check when it is done; the button holds its own spinner until the last one finishes. */
export const play = [{ click: '[data-play="backup"]', wait: 6200 }]

export const controls = {
  variant: { type: "select", label: "Variant", options: ["ring", "spokes"], default: "ring" },
  size: { type: "select", label: "Size", options: ["sm", "md", "lg"], default: "md" },
  themeInk: { type: "color", label: "Spinner colour", default: "", group: "Colours" },
  themeTrack: { type: "color", label: "Ring track colour", default: "", group: "Colours" },
  themeRingStroke: { type: "slider", label: "Ring thickness", min: 1, max: 4, step: 0.25, default: 2.5, unit: "", group: "Layout" },
  themeSpokeStroke: { type: "slider", label: "Spoke thickness", min: 1, max: 4, step: 0.25, default: 2.25, unit: "", group: "Layout" },
  themeDiameter: { type: "slider", label: "Custom diameter", min: 12, max: 40, step: 1, default: 16, unit: "px", group: "Layout" },
  themeOpacity: { type: "slider", label: "Spinner opacity", min: 0.3, max: 1, step: 0.1, default: 1, unit: "", group: "Layout" },
  themeTrackOpacity: { type: "slider", label: "Track opacity", min: 0, max: 0.5, step: 0.02, default: 0.16, unit: "", group: "Layout" },
  themeCap: { type: "select", label: "Stroke caps", options: ["round", "butt", "square"], default: "round", group: "Appearance" },
} as const

const albums = [
  { id: "lisbon", name: "Bruges, November", count: "214 photos", photo: "/demo/canal.jpg" },
  { id: "coast", name: "Cornish coast walk", count: "86 photos", photo: "/demo/coast-3.jpg" },
  { id: "supper", name: "Harvest in the Douro", count: "41 photos", photo: "/demo/food-4.jpg" },
]

type Status = "waiting" | "uploading" | "done"

function Check() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-4">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  )
}

export default function SpinnerDemo({
  variant = "ring",
  size = "md",
  themeInk = "",
  themeTrack = "",
  themeRingStroke = 2.5,
  themeSpokeStroke = 2.25,
  themeDiameter = 16,
  themeOpacity = 1,
  themeTrackOpacity = 0.16,
  themeCap = "round",
}: {
  variant?: "ring" | "spokes"
  size?: "sm" | "md" | "lg"
  themeInk?: string
  themeTrack?: string
  themeRingStroke?: number
  themeSpokeStroke?: number
  themeDiameter?: number
  themeOpacity?: number
  themeTrackOpacity?: number
  themeCap?: "round" | "butt" | "square"
}) {
  const [status, setStatus] = React.useState<Record<string, Status>>({})
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const busy = Object.values(status).some((s) => s !== "done")

  const backUp = (e: React.MouseEvent<HTMLElement>) => {
    const speed = parseFloat(getComputedStyle(e.currentTarget).getPropertyValue("--kf-speed")) || 1
    timers.current.forEach(clearTimeout)
    setStatus(Object.fromEntries(albums.map((a) => [a.id, "waiting" as Status])))
    albums.forEach((album, i) => {
      timers.current.push(setTimeout(() => setStatus((s) => ({ ...s, [album.id]: "uploading" })), (250 + i * 650) * speed))
      timers.current.push(setTimeout(() => setStatus((s) => ({ ...s, [album.id]: "done" })), (1700 + i * 900) * speed))
    })
  }

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeInk ? { "--spinner-ink": themeInk } : null),
    ...(themeTrack ? { "--spinner-track": themeTrack } : null),
    ...(themeRingStroke !== 2.5 ? { "--spinner-ring-stroke": `${themeRingStroke}` } : null),
    ...(themeSpokeStroke !== 2.25 ? { "--spinner-spoke-stroke": `${themeSpokeStroke}` } : null),
    ...(themeDiameter !== 16 ? { "--spinner-diameter": `${themeDiameter}px` } : null),
    ...(themeOpacity !== 1 ? { "--spinner-opacity": `${themeOpacity}` } : null),
    ...(themeTrackOpacity !== 0.16 ? { "--spinner-track-opacity": `${themeTrackOpacity}` } : null),
    ...(themeCap !== "round" ? { "--spinner-cap": themeCap } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[400px]">
      <div className="rounded-[18px] bg-background p-2 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.14)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <div className="flex items-center justify-between gap-3 px-3 pt-3 pb-2">
          <div className="min-w-0">
            <div className="text-[15px] font-semibold tracking-tight">Back up albums</div>
            <div className="mt-1 text-[12px] text-muted-foreground">To your Mac mini at home</div>
          </div>
          <Button variant="primary" size="sm" data-play="backup" aria-busy={busy || undefined} onClick={(e) => !busy && backUp(e)} className="gap-2">
            {busy && <Spinner variant={variant} size="sm" label="Backing up" />}
            {busy ? "Backing up" : "Back up now"}
          </Button>
        </div>
        <ul className="mt-1">
          {albums.map((album) => {
            const s = status[album.id]
            return (
              <li key={album.id} className="flex items-center gap-3 rounded-[12px] px-3 py-2.5">
                <img src={album.photo} alt="" className="size-10 shrink-0 rounded-[9px] object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] leading-tight font-medium">{album.name}</div>
                  <div className="mt-1 text-[12px] leading-tight text-muted-foreground tabular-nums">
                    {s === "uploading" ? "Uploading…" : s === "done" ? "Backed up just now" : album.count}
                  </div>
                </div>
                <span className="grid size-6 shrink-0 place-items-center text-muted-foreground">
                  {s === "uploading" && <Spinner variant={variant} size={size} label={`Uploading ${album.name}`} />}
                  {s === "done" && (
                    <span className="text-[oklch(0.62_0.16_150)] animate-[kf-spinner-in_calc(420ms*var(--kf-speed,1))_var(--ease-pop)_backwards] motion-reduce:animate-none">
                      <Check />
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
