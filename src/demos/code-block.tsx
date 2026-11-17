import * as React from "react"

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block"

export const meta = { name: "Code Block", group: "Display" }

/* The walkthrough moves the highlight from step to step, then copies the file. */
export const play = [
  { click: '[data-step="bakes"]', wait: 1600 },
  { click: '[data-step="slots"]', wait: 1700 },
  { click: '[data-step="trim"]', wait: 1500 },
  { click: '[data-slot="code-block-copy"]', wait: 2400 },
]

export const controls = {
  lineNumbers: { type: "switch", label: "Line numbers", default: true },
  wrap: { type: "switch", label: "Wrap lines", default: false },
  size: { type: "select", label: "Size", options: ["default", "sm"], default: "default" },
  themeFace: { type: "color", label: "Code sheet", default: "", group: "Colours" },
  themeInk: { type: "color", label: "Code text", default: "", group: "Colours" },
  themeMuted: { type: "color", label: "Comments and hints", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "Sheet corners", min: 0, max: 24, step: 1, default: 14, unit: "px", group: "Layout" },
  themeFont: { type: "slider", label: "Code size", min: 10, max: 18, step: 0.5, default: 12.5, unit: "px", group: "Layout" },
  themeInsetX: { type: "slider", label: "Line padding", min: 0, max: 28, step: 1, default: 14, unit: "px", group: "Layout" },
  themeInsetY: { type: "slider", label: "Code padding", min: 0, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
} as const

const code = `import { addMinutes, format, isBefore } from "date-fns"

// Loaves leave the oven at 7:10 and 11:40.
const BAKES = ["07:10", "11:40"] as const

export function pickupSlots(order: Order, now = new Date()) {
  const ready = nextBake(BAKES, order.items, now)
  const slots: Slot[] = []
  for (let t = ready; isBefore(t, closing(now)); t = addMinutes(t, 20)) {
    slots.push({ time: t, label: format(t, "h:mm a") })
  }
  return slots.slice(0, 6)
}
`

const steps = [
  { id: "bakes", label: "Bake times", lines: [3, 4] },
  { id: "slots", label: "Every 20 min", lines: [7, 8, 9, 10, 11] },
  { id: "trim", label: "First six", lines: [12] },
] as const

export default function CodeBlockDemo({
  lineNumbers = true,
  wrap = false,
  size = "default",
  themeFace = "",
  themeInk = "",
  themeMuted = "",
  themeRadius = 14,
  themeFont = 12.5,
  themeInsetX = 14,
  themeInsetY = 12,
}: {
  lineNumbers?: boolean
  wrap?: boolean
  size?: "default" | "sm"
  themeFace?: string
  themeInk?: string
  themeMuted?: string
  themeRadius?: number
  themeFont?: number
  themeInsetX?: number
  themeInsetY?: number
}) {
  const [step, setStep] = React.useState<(typeof steps)[number]["id"]>("slots")
  const highlight = steps.find((s) => s.id === step)?.lines ?? []

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--code-block-face": themeFace } : null),
    ...(themeInk ? { "--code-block-ink": themeInk } : null),
    ...(themeMuted ? { "--code-block-muted": themeMuted } : null),
    ...(themeRadius !== 14 ? { "--code-block-radius": `${themeRadius}px` } : null),
    ...(themeFont !== 12.5 ? { "--code-block-font": `${themeFont}px` } : null),
    ...(themeInsetX !== 14 ? { "--code-block-inset-x": `${themeInsetX}px` } : null),
    ...(themeInsetY !== 12 ? { "--code-block-inset-y": `${themeInsetY}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[600px]">
      <div className="mb-3 flex items-center justify-between gap-3 @max-[30rem]:flex-col @max-[30rem]:items-start">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold tracking-tight">Pickup times for pre-orders</div>
          <p className="mt-1 text-[12px] text-muted-foreground">Rye &amp; Sons bakery, order app</p>
        </div>
        <div
          role="group"
          aria-label="Walk through the code"
          className="flex shrink-0 gap-0.5 rounded-[11px] bg-muted p-0.5 shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]"
        >
          {steps.map((s) => (
            <button
              key={s.id}
              type="button"
              data-step={s.id}
              aria-pressed={step === s.id}
              onClick={() => setStep(s.id)}
              className={[
                "h-7 rounded-[9px] px-2.5 text-[12px] leading-none font-medium whitespace-nowrap outline-none transition-[color,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                step === s.id
                  ? "bg-background text-foreground shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08)]"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <CodeBlock code={code} language="ts" lineNumbers={lineNumbers} wrap={wrap} highlight={[...highlight]} size={size}>
        <CodeBlockHeader>
          <CodeBlockTitle>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 2.75H5A1.25 1.25 0 0 0 3.75 4v8c0 .69.56 1.25 1.25 1.25h6c.69 0 1.25-.56 1.25-1.25V6L9 2.75Z" />
              <path d="M9 2.75V6h3.25" />
            </svg>
            lib/pickup-slots.ts
          </CodeBlockTitle>
          <CodeBlockActions>
            <span className="me-1 text-[11.5px] text-muted-foreground @max-[30rem]:hidden">TypeScript</span>
            <CodeBlockCopyButton />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent aria-label="pickup-slots.ts" />
      </CodeBlock>
    </div>
  )
}
