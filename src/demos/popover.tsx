import * as React from "react"

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

export const meta = { name: "Popover", group: "Overlays" }

/* The demo plays itself: the counter unfolds out of its trigger with its rows cascading in,
   one more child is added, and Done closes it. */
export const play = [
  { click: "[data-slot=popover-trigger]", wait: 1800 },
  { click: '[aria-label="More children"]', wait: 1000 },
  { click: "[data-slot=popover-close]", wait: 1400 },
  { click: "[data-slot=popover-trigger]", wait: 1800 },
  { click: '[aria-label="Fewer children"]', wait: 1000 },
  { click: "[data-slot=popover-close]", wait: 1400 },
]

type Kind = "adults" | "children" | "infants"

const rows: { kind: Kind; label: string; hint: string; min: number; max: number }[] = [
  { kind: "adults", label: "Adults", hint: "13 and over", min: 1, max: 8 },
  { kind: "children", label: "Children", hint: "Ages 2 to 12", min: 0, max: 6 },
  { kind: "infants", label: "Infants", hint: "Under 2", min: 0, max: 3 },
]

const stepKey = [
  "grid size-7 cursor-pointer place-items-center rounded-full bg-background text-foreground outline-none dark:bg-accent",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.06)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),inset_0_1px_0_rgb(255_255_255/0.08)]",
  "transition-[background-color,translate,scale,opacity] duration-[calc(100ms*var(--kf-speed,1))] ease-house",
  "hover:bg-[color-mix(in_oklab,var(--background),var(--foreground)_4%)] dark:hover:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_8%)]",
  "active:translate-y-px active:scale-[0.96]",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover",
  "aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:[&_svg]:opacity-40 aria-disabled:shadow-[0_0_0_1px_rgb(0_0_0/0.05)] dark:aria-disabled:shadow-[0_0_0_1px_rgb(255_255_255/0.05)] aria-disabled:active:translate-y-0 aria-disabled:active:scale-100 aria-disabled:hover:bg-background dark:aria-disabled:hover:bg-accent",
  "motion-reduce:transition-none [&_svg]:size-3.5",
].join(" ")

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  )
}

function summary(count: Record<Kind, number>) {
  const guests = count.adults + count.children
  const parts = [`${guests} ${guests === 1 ? "guest" : "guests"}`]
  if (count.infants) parts.push(`${count.infants} ${count.infants === 1 ? "infant" : "infants"}`)
  return parts.join(", ")
}

export const controls = {
  side: { type: "select", label: "Side", default: "bottom", options: ["top", "right", "bottom", "left"] },
  align: { type: "select", label: "Alignment", default: "end", options: ["start", "center", "end"] },
  variant: { type: "select", label: "Done variant", default: "primary", options: ["default", "primary"] },
  modal: { type: "select", label: "Modality", default: "non-modal", options: ["non-modal", "modal", "trap-focus"] },
  presentation: { type: "select", label: "Presentation", default: "auto", options: ["auto", "popover", "sheet"] },
  disabled: { type: "switch", label: "Disabled trigger", default: false, group: "Behaviour" },
  focusableWhenDisabled: { type: "switch", label: "Focusable disabled trigger", default: false, group: "Behaviour" },
  dismissible: { type: "switch", label: "Dismissible", default: true, group: "Behaviour" },
  openOnHover: { type: "switch", label: "Open on hover", default: false, group: "Behaviour" },
  keepMounted: { type: "switch", label: "Keep mounted", default: false, group: "Behaviour" },
  title: { type: "text", label: "Popover title", default: "Who's coming?" },
  items: { type: "slider", label: "Guest categories", default: 3, min: 2, max: 3, step: 1, unit: "", group: "Layout" },
  width: { type: "slider", label: "Popover width", default: 288, min: 260, max: 380, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Corners", default: 14, min: 0, max: 28, step: 1, unit: "px", group: "Layout" },
  sideOffset: { type: "slider", label: "Trigger gap", default: 8, min: 0, max: 28, step: 1, unit: "px", group: "Layout" },
  surface: { type: "color", label: "Sheet", default: "", group: "Colours" },
  ink: { type: "color", label: "Text", default: "", group: "Colours" },
  muted: { type: "color", label: "Description", default: "", group: "Colours" },
  keyColour: { type: "color", label: "Trigger", default: "", group: "Colours" },
  primary: { type: "color", label: "Done button", default: "", group: "Colours" },
} as const

export default function PopoverDemo({
  side = "bottom",
  align = "end",
  variant = "primary",
  modal = "non-modal",
  presentation = "auto",
  disabled = false,
  focusableWhenDisabled = false,
  dismissible = true,
  openOnHover = false,
  keepMounted = false,
  title = "Who's coming?",
  items = 3,
  width = 288,
  radius = 14,
  sideOffset = 8,
  surface = "",
  ink = "",
  muted = "",
  keyColour = "",
  primary = "",
}: {
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  variant?: "default" | "primary"
  modal?: "non-modal" | "modal" | "trap-focus"
  presentation?: "popover" | "sheet" | "auto"
  disabled?: boolean
  focusableWhenDisabled?: boolean
  dismissible?: boolean
  openOnHover?: boolean
  keepMounted?: boolean
  title?: string
  items?: number
  width?: number
  radius?: number
  sideOffset?: number
  surface?: string
  ink?: string
  muted?: string
  keyColour?: string
  primary?: string
}) {
  const theme = {
    "--popover-width": `${width}px`,
    "--popover-radius": `${radius}px`,
    ...(surface ? { "--popover-surface": surface } : {}),
    ...(ink ? { "--popover-ink": ink } : {}),
    ...(muted ? { "--popover-muted": muted } : {}),
    ...(keyColour ? { "--popover-key": keyColour } : {}),
    ...(primary ? { "--popover-primary": primary } : {}),
  } as React.CSSProperties
  const [count, setCount] = React.useState<Record<Kind, number>>({ adults: 2, children: 1, infants: 0 })
  const change = (kind: Kind, by: number) => setCount((c) => ({ ...c, [kind]: c[kind] + by }))
  const canAdd = (kind: Kind) => {
    const row = rows.find((r) => r.kind === kind)!
    if (count[kind] >= row.max) return false
    return kind === "infants" || count.adults + count.children < 8
  }

  return (
    <div style={theme} className="flex w-full max-w-[340px] items-center gap-3 rounded-[14px] bg-muted/60 p-3 pl-4">
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold tracking-tight">Cabin by the lake</div>
        <div className="mt-0.5 text-[12px] text-muted-foreground tabular-nums">Fri 6 to Sun 8 June</div>
      </div>
      <Popover modal={modal === "trap-focus" ? "trap-focus" : modal === "modal"} presentation={presentation} dismissible={dismissible} openOnHover={openOnHover}>
        <PopoverTrigger disabled={disabled} focusableWhenDisabled={focusableWhenDisabled} className="tabular-nums">
          {summary(count)}
          <svg
            data-slot="popover-chevron"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="-mr-1"
          >
            <path d="m4.5 6.5 3.5 3.5 3.5-3.5" />
          </svg>
        </PopoverTrigger>
        <PopoverContent side={side} align={align} sideOffset={sideOffset} keepMounted={keepMounted}>
          <PopoverTitle>{title}</PopoverTitle>
          <PopoverDescription className="mt-0.5">The cabin sleeps up to 8.</PopoverDescription>
          <ul className="mt-3 divide-y divide-border">
            {rows.slice(0, items).map((row) => (
              <li key={row.kind} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium">{row.label}</div>
                  <div className="text-[12px] text-muted-foreground">{row.hint}</div>
                </div>
                <button
                  type="button"
                  className={stepKey}
                  aria-label={`Fewer ${row.label.toLowerCase()}`}
                  aria-disabled={count[row.kind] <= row.min}
                  onClick={() => count[row.kind] > row.min && change(row.kind, -1)}
                >
                  <Icon d="M4 8h8" />
                </button>
                <span aria-live="polite" className="w-5 text-center text-[14px] font-semibold tabular-nums">
                  {count[row.kind]}
                </span>
                <button
                  type="button"
                  className={stepKey}
                  aria-label={`More ${row.label.toLowerCase()}`}
                  aria-disabled={!canAdd(row.kind)}
                  onClick={() => canAdd(row.kind) && change(row.kind, 1)}
                >
                  <Icon d="M8 4v8M4 8h8" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-end">
            <PopoverClose variant={variant}>Done</PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
