import * as React from "react"

import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
  type TraceStatus,
} from "@/components/ui/trace"

export const meta = { name: "Trace", group: "Chat" }

/* Open the failed booking, close it, then plan again: the steps cascade back in and run one by one. */
export const play = [
  { click: '[data-step="ramiro"] [data-slot="collapsible-trigger"]', wait: 1700 },
  { click: '[data-step="ramiro"] [data-slot="collapsible-trigger"]', wait: 900 },
  { click: '[data-action="replan"]', wait: 5600 },
]

export const controls = {
  icons: { type: "select", label: "Icons", options: ["status", "action"], default: "status" },
  durations: { type: "switch", label: "Durations", default: true },
  openFailed: { type: "switch", label: "Open failed step", default: false },
  themeInk: { type: "color", label: "Step text", default: "", group: "Colours" },
  themeError: { type: "color", label: "Failed step", default: "", group: "Colours" },
  themeFont: { type: "slider", label: "Step size", min: 10, max: 18, step: 1, default: 13, unit: "px", group: "Layout" },
  themeDetailFont: { type: "slider", label: "Detail size", min: 10, max: 18, step: 0.5, default: 12.5, unit: "px", group: "Layout" },
  themeGap: { type: "slider", label: "Step spacing", min: 4, max: 24, step: 1, default: 10, unit: "px", group: "Layout" },
  themeIconSize: { type: "slider", label: "Status icon size", min: 12, max: 24, step: 1, default: 16, unit: "px", group: "Layout" },
  themeIndent: { type: "slider", label: "Detail indent", min: 8, max: 28, step: 1, default: 16, unit: "px", group: "Layout" },
} as const

type Step = {
  id: string
  /** The title while it runs, and once it is done. */
  running: string
  done: string
  failed?: boolean
  took: string
  icon: React.ReactNode
  detail?: React.ReactNode
}

const svg = (d: React.ReactNode) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
)

const steps: Step[] = [
  {
    id: "places",
    running: "Reading your saved places in Lisbon",
    done: "Read 14 saved places in Lisbon",
    took: "1.2s",
    icon: svg(<path d="M8 14s4.5-3.9 4.5-7.5a4.5 4.5 0 0 0-9 0C3.5 10.1 8 14 8 14Z M8 8.25a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z" />),
    detail: (
      <>
        <p>Time Out Market, LX Factory and Miradouro da Senhora do Monte are close together, so they go on Saturday.</p>
        <p>Pastéis de Belém is the only one west of the river bend: Sunday morning.</p>
      </>
    ),
  },
  {
    id: "flights",
    running: "Checking flights from Manchester",
    done: "Found the 07:05 on Friday, back Monday 19:40",
    took: "2.4s",
    icon: svg(<path d="M2.5 9.5 6 8.75 9.25 13l1.5-.5L9.5 8l3.25-.75a1.25 1.25 0 0 0-.5-2.45L9 5.5 5.5 2 4 2.5l2 3.75-3.25.75Z" />),
  },
  {
    id: "ramiro",
    running: "Booking Cervejaria Ramiro for Saturday",
    done: "Couldn't book Cervejaria Ramiro for Saturday",
    failed: true,
    took: "3.1s",
    icon: svg(<path d="M4 2.5v4.25a2 2 0 0 0 4 0V2.5M6 2.5v11M11.5 13.5V2.5c-1.5 0-2.5 1.75-2.5 4.5s1 3 2.5 3" />),
    detail: (
      <>
        <p>Fully booked from 19:00 to 22:30. They hold the bar for walk-ins; the queue is usually about 40 minutes.</p>
        <p>Put on the waitlist for 19:30 instead.</p>
      </>
    ),
  },
  {
    id: "hotels",
    running: "Comparing 6 hotels in Alfama",
    done: "Picked Memmo Alfama, €212 a night",
    took: "4.0s",
    icon: svg(<path d="M2.5 13.5v-9h7v9M9.5 7.5h4v6M1.5 13.5h13M5 7h2M5 9.5h2" />),
  },
  {
    id: "plan",
    running: "Writing the day-by-day plan",
    done: "Wrote a plan for 4 days",
    took: "2.2s",
    icon: svg(<path d="M4 2.5h8M4 6h8M4 9.5h5M4 13h3" />),
  },
]

/* Where the trace stands when the demo first shows: three done, one running, one waiting. */
const START = 3

export default function TraceDemo({
  icons = "status",
  durations = true,
  openFailed = false,
  themeInk = "",
  themeError = "",
  themeFont = 13,
  themeDetailFont = 12.5,
  themeGap = 10,
  themeIconSize = 16,
  themeIndent = 16,
}: {
  icons?: "status" | "action"
  durations?: boolean
  openFailed?: boolean
  themeInk?: string
  themeError?: string
  themeFont?: number
  themeDetailFont?: number
  themeGap?: number
  themeIconSize?: number
  themeIndent?: number
}) {
  const [run, setRun] = React.useState(0)
  const [at, setAt] = React.useState(START)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])

  /* Plan again: the list comes back in, then each step runs for a moment and finishes. */
  const replan = (e: React.MouseEvent<HTMLButtonElement>) => {
    const speed = parseFloat(getComputedStyle(e.currentTarget).getPropertyValue("--kf-speed")) || 1
    timers.current.forEach(clearTimeout)
    setRun((r) => r + 1)
    setAt(0)
    timers.current = steps.map((_, i) => setTimeout(() => setAt(i + 1), (700 + i * 900) * speed))
  }

  const statusOf = (i: number): TraceStatus | undefined =>
    i < at ? (steps[i].failed ? "error" : undefined) : i === at ? "running" : "pending"

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeInk ? { "--trace-ink": themeInk } : null),
    ...(themeError ? { "--trace-error": themeError } : null),
    ...(themeFont !== 13 ? { "--trace-font": `${themeFont}px` } : null),
    ...(themeDetailFont !== 12.5 ? { "--trace-detail-font": `${themeDetailFont}px` } : null),
    ...(themeGap !== 10 ? { "--trace-gap": `${themeGap}px` } : null),
    ...(themeIconSize !== 16 ? { "--trace-icon-size": `${themeIconSize}px` } : null),
    ...(themeIndent !== 16 ? { "--trace-indent": `${themeIndent}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[460px]">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[16px] rounded-br-[6px] bg-muted px-3.5 py-2.5 text-[13px] leading-snug">
          Plan a long weekend in Lisbon, 14 to 17 March. Two of us, flying from Manchester.
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="text-[12px] font-medium text-muted-foreground">{at >= steps.length ? "Done" : "Working on it"}</div>
        <button
          type="button"
          data-action="replan"
          onClick={replan}
          className="inline-flex h-7 items-center rounded-[8px] px-2.5 text-[12px] leading-none font-medium text-muted-foreground outline-none transition-[scale,color,background-color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:bg-foreground/[0.045] hover:text-foreground active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          Plan again
        </button>
      </div>

      <Trace key={run} className="mt-3" aria-label="What the assistant did">
        {steps.map((step, i) => {
          const status = statusOf(i)
          const line = (
            <TraceLine status={status}>
              <TraceIcon>{icons === "action" && status !== "running" ? step.icon : undefined}</TraceIcon>
              <TraceTitle>{i < at ? step.done : step.running}</TraceTitle>
              {durations && i < at && <TraceDescription className="@max-[26rem]:hidden">{step.took}</TraceDescription>}
            </TraceLine>
          )
          /* A row with detail is a collapsible from the start, and can't open until its step is done. */
          return step.detail ? (
            <TraceCollapsible key={`${step.id}-${openFailed}`} data-step={step.id} disabled={i >= at} defaultOpen={step.failed ? openFailed : false}>
              <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
              <TraceCollapsibleContent>{step.detail}</TraceCollapsibleContent>
            </TraceCollapsible>
          ) : (
            <div key={step.id} data-step={step.id} className="w-fit max-w-full">
              {line}
            </div>
          )
        })}
      </Trace>
    </div>
  )
}
