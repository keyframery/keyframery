import * as React from "react"

import { Radio, RadioGroup } from "@/components/ui/radio"

export const meta = { name: "Radio", group: "Forms" }

/* The demo plays itself: far jumps, so the selection ring glides across several cards. */
export const play = [
  { click: 'label:nth-of-type(1) [data-slot="radio"]', wait: 1400 },
  { click: 'label:nth-of-type(3) [data-slot="radio"]', wait: 1400 },
  { click: 'label:nth-of-type(2) [data-slot="radio"]', wait: 1400 },
]

const speeds = [
  { value: "standard", label: "Standard", when: "Arrives Thu 21 – Mon 25 Nov", price: "Free" },
  { value: "express", label: "Express", when: "Arrives Tue 19 Nov", price: "€6.90" },
  { value: "next-day", label: "Next day", when: "Order in 2 h 14 min for tomorrow", price: "€12.50" },
  { value: "pickup", label: "Pick up in store", when: "Not available for this order", price: "Free", disabled: true },
]

export const controls = {
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  loop: { type: "switch", label: "Loop navigation", default: true, group: "Behaviour" },
  pickupDisabled: { type: "switch", label: "Disable pickup", default: true, group: "Behaviour" },
  orientation: { type: "select", label: "Card layout", default: "vertical", options: ["vertical", "horizontal"] },
  initialValue: { type: "select", label: "Selected delivery", default: "express", options: ["standard", "express", "next-day"] },
  title: { type: "text", label: "Heading", default: "Delivery" },
  description: { type: "text", label: "Order", default: "Pour-over set and a linen apron" },
  items: { type: "slider", label: "Delivery options", default: 4, min: 3, max: 4, step: 1, unit: "", group: "Layout" },
  width: { type: "slider", label: "Width", default: 380, min: 320, max: 480, step: 1, unit: "px", group: "Layout" },
  padding: { type: "slider", label: "Card padding", default: 12, min: 8, max: 20, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Card gap", default: 8, min: 4, max: 24, step: 1, unit: "px", group: "Layout" },
  size: { type: "slider", label: "Radio size", default: 18, min: 14, max: 26, step: 1, unit: "px", group: "Layout" },
  dotSize: { type: "slider", label: "Dot size", default: 7, min: 4, max: 10, step: 1, unit: "px", group: "Layout" },
  corners: { type: "select", label: "Radio corners", default: "round", options: ["round", "soft", "square"] },
  surface: { type: "color", label: "Unchecked", default: "", group: "Colours" },
  selected: { type: "color", label: "Selected", default: "", group: "Colours" },
  dot: { type: "color", label: "Dot", default: "", group: "Colours" },
  ring: { type: "color", label: "Selection ring", default: "", group: "Colours" },
} as const

export default function RadioDemo({
  disabled = false,
  readOnly = false,
  required = false,
  loop = true,
  pickupDisabled = true,
  orientation = "vertical",
  initialValue = "express",
  title = "Delivery",
  description = "Pour-over set and a linen apron",
  items = 4,
  width = 380,
  padding = 12,
  gap = 8,
  size = 18,
  dotSize = 7,
  corners = "round",
  surface = "",
  selected = "",
  dot = "",
  ring = "",
}: {
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  loop?: boolean
  pickupDisabled?: boolean
  orientation?: "vertical" | "horizontal"
  initialValue?: "standard" | "express" | "next-day"
  title?: string
  description?: string
  items?: number
  width?: number
  padding?: number
  gap?: number
  size?: number
  dotSize?: number
  corners?: "round" | "soft" | "square"
  surface?: string
  selected?: string
  dot?: string
  ring?: string
}) {
  const theme = {
    "--radio-size": `${size}px`,
    "--radio-dot-size": `${dotSize}px`,
    "--radio-gap": `${gap}px`,
    "--radio-radius": corners === "round" ? "9999px" : corners === "soft" ? "5px" : "0px",
    ...(surface ? { "--radio-surface": surface } : {}),
    ...(selected ? { "--radio-selected": selected } : {}),
    ...(dot ? { "--radio-dot": dot } : {}),
    ...(ring ? { "--radio-ring": ring } : {}),
  } as React.CSSProperties
  const [value, setValue] = React.useState<string | null>(initialValue)
  React.useEffect(() => setValue(initialValue), [initialValue])
  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full max-w-[380px]">
      <h3 id="delivery" className="text-[15px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
      <RadioGroup
        aria-labelledby="delivery"
        value={value} onValueChange={setValue} disabled={disabled} readOnly={readOnly} required={required} loop={loop}
        style={{ gap, ...(orientation === "horizontal" ? { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" } : {}) }}
        className="mt-4 gap-2 [--kf-radio-pad:0px] before:z-10 before:rounded-[12px] before:shadow-[0_0_0_1.5px_var(--radio-ring,var(--primary)),0_2px_8px_-2px_rgb(0_0_0/0.14)] dark:before:shadow-[0_0_0_1.5px_var(--radio-ring,var(--primary))]"
      >
        {speeds.slice(0, items).map((speed) => (
          <label
            key={speed.value}
            style={{ paddingTop: padding, paddingBottom: padding }}
            className={[
              "flex cursor-pointer items-center gap-3 rounded-[12px] bg-background px-3.5 py-3",
              "shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
              "transition-shadow duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
              "hover:shadow-[0_0_0_1px_rgb(0_0_0/0.14),0_1px_2px_rgb(0_0_0/0.05)] dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.14)]",
              /* The card of the checked option is what the selection ring glides to. */
              "has-data-checked:[anchor-name:--kf-radio]",
              "has-data-disabled:cursor-not-allowed has-data-disabled:opacity-60 has-data-disabled:hover:shadow-[0_0_0_1px_rgb(0_0_0/0.08)]",
            ].join(" ")}
          >
            <Radio value={speed.value} disabled={speed.value === "pickup" ? pickupDisabled : speed.disabled} className="data-checked:[anchor-name:none]" />
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-[13px] leading-none font-medium">{speed.label}</span>
              <span className="text-[12px] leading-none text-muted-foreground">{speed.when}</span>
            </span>
            <span className="text-[13px] font-medium tabular-nums">{speed.price}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}
