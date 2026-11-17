import { Check, Clock, Truck } from "lucide-react"
import * as React from "react"

import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"

export const meta = { name: "Marker", group: "Display" }

/* Sends the suggested reply: a live marker sweeps while support checks the route, settles as the
   new slot, and the answer follows. Undo in that marker puts the thread back. */
export const play = [
  { wait: 900 },
  { click: '[data-play="send"]', wait: 4300 },
  { click: '[data-play="undo"]', wait: 1400 },
]

export const controls = {
  variant: { type: "select", label: "Day markers", options: ["separator", "border", "default"], default: "separator" },
  statusVariant: { type: "select", label: "Status markers", options: ["default", "border"], default: "default" },
  themeInk: { type: "color", label: "Marker text", default: "", group: "Colours" },
  themeLink: { type: "color", label: "Marker links", default: "", group: "Colours" },
  themeLine: { type: "color", label: "Rule colour", default: "", group: "Colours" },
  themeFont: { type: "slider", label: "Marker size", min: 10, max: 18, step: 1, default: 12, unit: "px", group: "Layout" },
  themeGap: { type: "slider", label: "Content gap", min: 0, max: 20, step: 1, default: 8, unit: "px", group: "Layout" },
  themeIconSize: { type: "slider", label: "Marker icon", min: 10, max: 24, step: 1, default: 14, unit: "px", group: "Layout" },
  themeLineWidth: { type: "slider", label: "Rule thickness", min: 1, max: 4, step: 1, default: 1, unit: "px", group: "Layout" },
  themeHeight: { type: "slider", label: "Minimum height", min: 16, max: 40, step: 1, default: 16, unit: "px", group: "Layout" },
} as const

type Stage = "idle" | "checking" | "moved"

function speedOf(el: Element | null) {
  return (el && parseFloat(getComputedStyle(el).getPropertyValue("--kf-speed"))) || 1
}

function Bubble({ from, children }: { from: "them" | "me"; children: React.ReactNode }) {
  return from === "them" ? (
    <div className="flex items-end gap-2 animate-[kf-marker-in_calc(480ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none">
      <img src="/demo/face-1.jpg" alt="" className="size-6 shrink-0 rounded-full bg-muted object-cover" />
      <p className="max-w-[78%] rounded-[16px] rounded-bl-[6px] bg-muted px-3 py-2 text-[13px] leading-[1.4]">{children}</p>
    </div>
  ) : (
    <div className="flex justify-end animate-[kf-marker-in_calc(480ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none">
      <p className="max-w-[78%] rounded-[16px] rounded-br-[6px] bg-primary px-3 py-2 text-[13px] leading-[1.4] text-primary-foreground">
        {children}
      </p>
    </div>
  )
}

export default function MarkerDemo({
  variant = "separator",
  statusVariant = "default",
  themeInk = "",
  themeLink = "",
  themeLine = "",
  themeFont = 12,
  themeGap = 8,
  themeIconSize = 14,
  themeLineWidth = 1,
  themeHeight = 16,
}: {
  variant?: "separator" | "border" | "default"
  statusVariant?: "default" | "border"
  themeInk?: string
  themeLink?: string
  themeLine?: string
  themeFont?: number
  themeGap?: number
  themeIconSize?: number
  themeLineWidth?: number
  themeHeight?: number
}) {
  const [stage, setStage] = React.useState<Stage>("idle")
  const root = React.useRef<HTMLDivElement>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const send = () => {
    clearTimeout(timer.current)
    setStage("checking")
    timer.current = setTimeout(() => setStage("moved"), 2200 * speedOf(root.current))
  }
  const undo = (e: React.MouseEvent) => {
    e.preventDefault()
    clearTimeout(timer.current)
    setStage("idle")
  }

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeInk ? { "--marker-ink": themeInk } : null),
    ...(themeLink ? { "--marker-link": themeLink } : null),
    ...(themeLine ? { "--marker-line": themeLine } : null),
    ...(themeFont !== 12 ? { "--marker-font": `${themeFont}px` } : null),
    ...(themeGap !== 8 ? { "--marker-gap": `${themeGap}px` } : null),
    ...(themeIconSize !== 14 ? { "--marker-icon-size": `${themeIconSize}px` } : null),
    ...(themeLineWidth !== 1 ? { "--marker-line-width": `${themeLineWidth}px` } : null),
    ...(themeHeight !== 16 ? { "--marker-height": `${themeHeight}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} ref={root} className="@container w-full max-w-[400px]">
      <div className="overflow-hidden rounded-[18px] bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.14)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <img src="/demo/face-1.jpg" alt="" className="size-8 rounded-full bg-muted object-cover" />
          <div className="min-w-0">
            <div className="text-[13.5px] leading-tight font-semibold">Kemi at Oakwright</div>
            <div className="mt-0.5 truncate text-[12px] text-muted-foreground">Order 4471, oak dining table</div>
          </div>
        </div>

        <div className="flex min-h-[318px] flex-col gap-3 px-4 py-4 @max-[22rem]:px-3">
          <Marker variant={variant}>
            <MarkerContent>Tuesday</MarkerContent>
          </Marker>
          <Bubble from="them">Your table left the Leeds workshop this morning.</Bubble>
          <Marker variant={statusVariant}>
            <MarkerIcon>
              <Truck />
            </MarkerIcon>
            <MarkerContent>Out for delivery, arriving 1 to 3pm</MarkerContent>
          </Marker>
          <Marker variant={variant}>
            <MarkerContent>Today</MarkerContent>
          </Marker>

          {stage !== "idle" && <Bubble from="me">Could they come after 3? I'm out until then.</Bubble>}
          {stage !== "idle" && (
            <Marker variant={statusVariant} live pending={stage === "checking"}>
              <MarkerIcon key={stage}>{stage === "checking" ? <Clock /> : <Check className="text-[oklch(0.62_0.16_150)]" />}</MarkerIcon>
              <MarkerContent>
                {stage === "checking" ? (
                  "Kemi is checking the driver's route"
                ) : (
                  <>
                    Delivery moved to 3 to 5pm.{" "}
                    <a href="#undo" data-play="undo" onClick={undo}>
                      Undo
                    </a>
                  </>
                )}
              </MarkerContent>
            </Marker>
          )}
          {stage === "moved" && <Bubble from="them">Done. Marcus will ring when he's ten minutes away.</Bubble>}
        </div>

        <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
          <button
            type="button"
            data-play="send"
            disabled={stage !== "idle"}
            onClick={send}
            className="h-8 min-w-0 cursor-pointer truncate rounded-full bg-muted px-3 text-[12.5px] font-medium text-foreground outline-none transition-[scale,opacity] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-40 motion-reduce:transition-none"
          >
            Ask to come after 3pm
          </button>
          <span className="ms-auto shrink-0 text-[12px] text-muted-foreground @max-[22rem]:hidden">Suggested reply</span>
        </div>
      </div>
    </div>
  )
}
