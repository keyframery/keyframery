import * as React from "react"

import {
  createResizableController,
  Resizable,
  ResizableHandle,
  ResizablePanel,
} from "@/components/ui/resizable"

export const meta = { name: "Resizable", group: "Layout" }

/* The demo plays itself: the pointer finds the handle (the ring line grows, the grip stretches),
   then the reader widens and narrows again, so the panels glide on a spring. */
export const play = [
  { hover: '[data-slot="resizable-handle"]', wait: 1300 },
  { unhover: '[data-slot="resizable-handle"]', wait: 500 },
  { click: '[data-play="focus"]', wait: 1500 },
  { click: '[data-play="focus"]', wait: 1700 },
]

function ExpandIcon({ wide }: { wide: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-4">
      <rect x="2.5" y="3" width="11" height="10" rx="2.25" />
      <path d={wide ? "M6.25 3v10" : "M8.75 3v10"} />
    </svg>
  )
}

const mail = [
  { from: "Dana Whitfield", subject: "Moving day: the plan", time: "09:24" },
  { from: "Marcus Bell", subject: "Van is booked", time: "08:10" },
  { from: "Joanna Park", subject: "Keys for the new place", time: "Tue" },
  { from: "Leo Grant", subject: "Spare boxes?", time: "Mon" },
  { from: "Fatima Noor", subject: "Housewarming date", time: "Sun" },
]

export const controls = {
  orientation: { type: "select", label: "Orientation", default: "auto", options: ["auto", "horizontal", "vertical"] },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  handleDisabled: { type: "switch", label: "Disabled handle", default: false, group: "Behaviour" },
  collapsible: { type: "switch", label: "Collapsible inbox", default: false, group: "Behaviour" },
  grip: { type: "switch", label: "Show grip", default: true, group: "Behaviour" },
  step: { type: "slider", label: "Keyboard step", default: 1, min: 1, max: 10, step: 1, unit: "%", group: "Behaviour" },
  largeStep: { type: "slider", label: "Large keyboard step", default: 10, min: 5, max: 25, step: 1, unit: "%", group: "Behaviour" },
  minSize: { type: "slider", label: "Minimum inbox", default: 30, min: 10, max: 40, step: 1, unit: "%", group: "Behaviour" },
  maxSize: { type: "slider", label: "Maximum inbox", default: 62, min: 50, max: 80, step: 1, unit: "%", group: "Behaviour" },
  collapsedSize: { type: "slider", label: "Collapsed inbox", default: 0, min: 0, max: 15, step: 1, unit: "%", group: "Behaviour" },
  inboxSize: { type: "slider", label: "Inbox share", default: 42, min: 30, max: 62, step: 1, unit: "%", group: "Layout" },
  title: { type: "text", label: "Inbox title", default: "Inbox" },
  items: { type: "slider", label: "Messages", default: 5, min: 1, max: 5, step: 1, unit: "", group: "Layout" },
  width: { type: "slider", label: "Width", default: 468, min: 320, max: 640, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Height", default: 332, min: 300, max: 520, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Grip corners", default: 5, min: 0, max: 12, step: 1, unit: "px", group: "Layout" },
  line: { type: "color", label: "Divider", default: "", group: "Colours" },
  active: { type: "color", label: "Active divider", default: "", group: "Colours" },
  keyColour: { type: "color", label: "Grip", default: "", group: "Colours" },
  ink: { type: "color", label: "Grip dots", default: "", group: "Colours" },
} as const

export default function ResizableDemo({
  orientation = "auto",
  disabled = false,
  handleDisabled = false,
  collapsible = false,
  grip = true,
  step = 1,
  largeStep = 10,
  minSize = 30,
  maxSize = 62,
  collapsedSize = 0,
  inboxSize = 42,
  title = "Inbox",
  items = 5,
  width = 468,
  height = 332,
  radius = 5,
  line = "",
  active = "",
  keyColour = "",
  ink = "",
}: {
  orientation?: "auto" | "horizontal" | "vertical"
  disabled?: boolean
  handleDisabled?: boolean
  collapsible?: boolean
  grip?: boolean
  step?: number
  largeStep?: number
  minSize?: number
  maxSize?: number
  collapsedSize?: number
  inboxSize?: number
  title?: string
  items?: number
  width?: number
  height?: number
  radius?: number
  line?: string
  active?: string
  keyColour?: string
  ink?: string
}) {
  const theme = {
    "--resizable-radius": `${radius}px`,
    ...(line ? { "--resizable-line": line } : {}),
    ...(active ? { "--resizable-active": active } : {}),
    ...(keyColour ? { "--resizable-key": keyColour } : {}),
    ...(ink ? { "--resizable-ink": ink } : {}),
  } as React.CSSProperties
  const [controller] = React.useState(createResizableController)
  const [wide, setWide] = React.useState(false)
  const toggle = () => {
    if (disabled || handleDisabled) return
    controller.setLayout(wide ? [inboxSize, 100 - inboxSize] : [minSize, 100 - minSize])
    setWide(!wide)
  }
  /* On a phone two columns are too narrow to read: the inbox sits above the message instead. */
  const root = React.useRef<HTMLDivElement>(null)
  const [stacked, setStacked] = React.useState(false)
  React.useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ro = new ResizeObserver(() => setStacked(el.clientWidth < 420))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  React.useEffect(() => { controller.setLayout([inboxSize, 100 - inboxSize]) }, [controller, inboxSize])
  const axis = orientation === "auto" ? (stacked ? "vertical" : "horizontal") : orientation
  return (
    <div ref={root} data-stacked={stacked || undefined} style={{ ...theme, maxWidth: width, height: height + (stacked ? 108 : 0) }} className="h-[332px] w-full max-w-[468px] overflow-hidden data-stacked:h-[440px] rounded-[14px] bg-card text-card-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <Resizable key={axis} controller={controller} orientation={axis} disabled={disabled} step={step} largeStep={largeStep}>
        <ResizablePanel defaultSize={inboxSize} minSize={minSize} maxSize={maxSize} collapsible={collapsible} collapsedSize={collapsedSize}>
          <div className="flex items-baseline justify-between px-4 pt-3.5 pb-2">
            <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
            <span className="text-[12px] text-muted-foreground tabular-nums">2 unread</span>
          </div>
          <ul className="px-1.5">
            {mail.slice(0, items).map((message, index) => (
              <li
                key={message.subject}
                className={
                  "rounded-[8px] px-2.5 py-2 " + (index === 0 ? "bg-accent" : "")
                }
              >
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-[13px] font-medium">{message.from}</span>
                  <span className="ml-auto shrink-0 text-[11px] text-muted-foreground tabular-nums">
                    {message.time}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                  {message.subject}
                </div>
              </li>
            ))}
          </ul>
        </ResizablePanel>
        <ResizableHandle disabled={handleDisabled} aria-label="Resize inbox">{grip ? undefined : null}</ResizableHandle>
        <ResizablePanel minSize={38}>
          <article className="px-5 pt-3.5">
            <div className="flex items-start gap-3">
              <h3 className="text-[15px] font-semibold tracking-tight">
                Moving day: the plan
              </h3>
              <button
                type="button"
                disabled={disabled || handleDisabled} data-play="focus"
                aria-label={wide ? "Show more of the inbox" : "Widen the message"}
                aria-pressed={wide}
                onClick={toggle}
                className="-mt-1 -mr-2 ml-auto grid size-7 shrink-0 cursor-pointer place-items-center rounded-[8px] text-muted-foreground outline-none transition-[background-color,color,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-pop hover:bg-accent hover:text-foreground active:scale-[0.94] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card motion-reduce:transition-none"
              >
                <ExpandIcon wide={wide} />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                DW
              </span>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium">Dana Whitfield</div>
                <div className="truncate text-[12px] text-muted-foreground">To Marcus, Joanna · 09:24</div>
              </div>
            </div>
            <p className="mt-4 text-[13px] leading-[1.6]">
              The van comes at eight on Saturday. Kitchen first, then the bedrooms, and the piano
              goes last so it is the first thing out.
            </p>
            <p className="mt-3 text-[13px] leading-[1.6]">
              Tape and marker pens are in the hall. Label every box with the room it goes to.
            </p>
          </article>
        </ResizablePanel>
      </Resizable>
    </div>
  )
}
