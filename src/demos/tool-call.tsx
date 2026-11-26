import * as React from "react"

import { ToolCall, type ToolCallStatus } from "@/components/ui/tool-call"

export const meta = { name: "Tool Call", group: "AI" }

/* Open the order lookup, close it, then run the calls again: they run one by one, the courier check
   fails and opens on its own, the email goes out. */
export const play = [
  { click: '[data-call="find_order"] [data-slot="collapsible-trigger"]', wait: 1800 },
  { click: '[data-call="find_order"] [data-slot="collapsible-trigger"]', wait: 900 },
  { click: '[data-action="rerun"]', wait: 5200 },
]

export const controls = {
  showName: { type: "switch", label: "Tool names", default: true },
  durations: { type: "switch", label: "Durations", default: true },
  failCourier: { type: "switch", label: "Courier check fails", default: true },
  openOnError: { type: "switch", label: "Open on failure", default: true },
  openFirst: { type: "switch", label: "Open first call", default: false },
  themeFace: { type: "color", label: "Card surface", default: "", group: "Colours" },
  themeInk: { type: "color", label: "Title text", default: "", group: "Colours" },
  themeMuted: { type: "color", label: "Name and time", default: "", group: "Colours" },
  themeSuccess: { type: "color", label: "Done tick", default: "", group: "Colours" },
  themeError: { type: "color", label: "Failed call", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "Corners", min: 0, max: 20, step: 1, default: 12, unit: "px", group: "Layout" },
  themeFont: { type: "slider", label: "Title size", min: 11, max: 16, step: 0.5, default: 13, unit: "px", group: "Layout" },
  themeCodeHeight: { type: "slider", label: "Tallest code", min: 80, max: 400, step: 10, default: 220, unit: "px", group: "Layout" },
} as const

type Call = {
  name: string
  title: string
  /** The title while it runs. */
  doing: string
  input: unknown
  output?: unknown
  error?: string
  took: number
}

const calls = (failCourier: boolean): Call[] => [
  {
    name: "find_order",
    title: "Looked up order #1048",
    doing: "Looking up order #1048",
    input: { order_id: "1048" },
    output: { status: "shipped", carrier: "Royal Mail", shipped: "2026-11-18", items: ["Linen shirt", "Canvas tote"], total: "£84.00" },
    took: 420,
  },
  failCourier
    ? {
        name: "track_parcel",
        title: "Couldn't reach the courier",
        doing: "Checking the courier",
        input: { carrier: "royal_mail", tracking: "RM 2048 1196 GB" },
        error: "Royal Mail's tracking page didn't answer within 10 seconds.",
        took: 10_000,
      }
    : {
        name: "track_parcel",
        title: "Found the parcel in Leeds",
        doing: "Checking the courier",
        input: { carrier: "royal_mail", tracking: "RM 2048 1196 GB" },
        output: { last_scan: "Leeds Mail Centre", at: "2026-11-19T07:42:00Z", delivered: false },
        took: 1840,
      },
  {
    name: "send_email",
    title: "Emailed Priya an update",
    doing: "Writing to Priya",
    input: { to: "priya@example.com", subject: "Your order #1048", template: "parcel_delayed" },
    output: { sent: true, id: "msg_8f2c41" },
    took: 1260,
  },
]

/* Where the calls stand when the demo first shows: two finished, the email still going. */
const START = 2

export default function ToolCallDemo({
  showName = true,
  durations = true,
  failCourier = true,
  openOnError = true,
  openFirst = false,
  themeFace = "",
  themeInk = "",
  themeMuted = "",
  themeSuccess = "",
  themeError = "",
  themeRadius = 12,
  themeFont = 13,
  themeCodeHeight = 220,
}: {
  showName?: boolean
  durations?: boolean
  failCourier?: boolean
  openOnError?: boolean
  openFirst?: boolean
  themeFace?: string
  themeInk?: string
  themeMuted?: string
  themeSuccess?: string
  themeError?: string
  themeRadius?: number
  themeFont?: number
  themeCodeHeight?: number
}) {
  const list = calls(failCourier)
  const [run, setRun] = React.useState(0)
  const [at, setAt] = React.useState(START)
  const [startedAt, setStartedAt] = React.useState(() => Date.now())
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])
  React.useEffect(() => () => timers.current.forEach(clearTimeout), [])

  /* Run again: each call runs for a moment, then finishes or fails. */
  const rerun = (e: React.MouseEvent<HTMLButtonElement>) => {
    const speed = parseFloat(getComputedStyle(e.currentTarget).getPropertyValue("--kf-speed")) || 1
    timers.current.forEach(clearTimeout)
    setRun((r) => r + 1)
    setAt(0)
    setStartedAt(Date.now())
    timers.current = list.map((_, i) =>
      setTimeout(() => {
        setAt(i + 1)
        setStartedAt(Date.now())
      }, (900 + i * 1300) * speed),
    )
  }

  const statusOf = (i: number): ToolCallStatus =>
    i < at ? (list[i].error ? "error" : "done") : i === at ? "running" : "pending"

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--tool-call-face": themeFace } : null),
    ...(themeInk ? { "--tool-call-ink": themeInk } : null),
    ...(themeMuted ? { "--tool-call-muted": themeMuted } : null),
    ...(themeSuccess ? { "--tool-call-success": themeSuccess } : null),
    ...(themeError ? { "--tool-call-error": themeError } : null),
    ...(themeRadius !== 12 ? { "--tool-call-radius": `${themeRadius}px` } : null),
    ...(themeFont !== 13 ? { "--tool-call-font": `${themeFont}px` } : null),
    ...(themeCodeHeight !== 220 ? { "--tool-call-code-height": `${themeCodeHeight}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="w-full max-w-[460px]">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[16px] rounded-br-[6px] bg-muted px-3.5 py-2.5 text-[13px] leading-snug">
          Where's my order #1048? It was meant to arrive on Friday.
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="text-[12px] font-medium text-muted-foreground">{at >= list.length ? "Used 3 tools" : "Working on it"}</div>
        <button
          type="button"
          data-action="rerun"
          data-agent-hidden
          onClick={rerun}
          className="inline-flex h-7 items-center rounded-[8px] px-2.5 text-[12px] leading-none font-medium text-muted-foreground outline-none transition-[scale,color,background-color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:bg-foreground/[0.045] hover:text-foreground active:scale-[calc(1-0.04*var(--kf-flourish,1))] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          Run again
        </button>
      </div>

      <div key={run} className="mt-3 flex flex-col gap-2">
        {list.map((call, i) => {
          const status = statusOf(i)
          const done = i < at
          return (
            <ToolCall
              key={`${call.name}-${openFirst}-${openOnError}`}
              data-call={call.name}
              name={showName ? call.name : undefined}
              title={done ? call.title : call.doing}
              status={status}
              input={call.input}
              output={done ? call.output : undefined}
              error={done ? call.error : undefined}
              duration={durations && done && !call.error ? call.took : undefined}
              startedAt={durations && status === "running" ? startedAt : undefined}
              defaultOpen={i === 0 ? openFirst : undefined}
              openOnError={openOnError}
            />
          )
        })}
      </div>
    </div>
  )
}
