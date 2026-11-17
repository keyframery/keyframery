import * as React from "react"

import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox"

export const controls = {
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  parent: { type: "switch", label: "Parent", default: true, group: "Behaviour" },
  state: { type: "select", label: "State", default: "checked", options: ["unchecked", "checked", "indeterminate"], group: "Behaviour" },
  title: { type: "text", label: "Title", default: "Packing for Crete" },
  subtitle: { type: "text", label: "Subtitle", default: "Flight leaves Friday at 07:40" },
  parentLabel: { type: "text", label: "Parent label", default: "Everything packed" },
  itemLabel: { type: "text", label: "Item label", default: "Passport" },
  hint: { type: "text", label: "Hint", default: "Expires March 2029" },
  boardingLabel: { type: "text", label: "Boarding label", default: "Boarding pass" },
  boardingHint: { type: "text", label: "Boarding hint", default: "Added to your wallet by the airline" },
  count: { type: "slider", label: "Count", default: 4, min: 1, max: 4, step: 1 },
  width: { type: "slider", label: "Width", default: 340, min: 260, max: 480, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 2, min: 0, max: 16, step: 1, unit: "px", group: "Layout" },
  size: { type: "slider", label: "Size", default: 18, min: 14, max: 28, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 5, min: 0, max: 14, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
} as const

export const meta = { name: "Checkbox", group: "Forms" }

/* The demo plays itself: items check and uncheck, so boxes pop and checks draw, and the
   parent goes from mixed to checked and back. */
export const play = [
  { click: '[data-item="charger"] [data-slot="checkbox"]', wait: 1000 },
  { click: '[data-item="jacket"] [data-slot="checkbox"]', wait: 1300 },
  { click: '[data-item="charger"] [data-slot="checkbox"]', wait: 1000 },
  { click: '[data-item="jacket"] [data-slot="checkbox"]', wait: 1300 },
]

const items = [
  { value: "passport", label: "Passport", hint: "Expires March 2029" },
  { value: "charger", label: "Phone charger", hint: "EU plug adapter too" },
  { value: "sunscreen", label: "Sunscreen", hint: "Under 100 ml for the carry-on" },
  { value: "jacket", label: "Rain jacket", hint: "Showers on Thursday" },
]

const row = "flex cursor-pointer items-start gap-3 rounded-[10px] px-2.5 py-2 transition-colors duration-[calc(150ms*var(--kf-speed,1))] hover:bg-muted/60 has-data-disabled:cursor-not-allowed has-data-disabled:hover:bg-transparent motion-reduce:transition-none"

export default function CheckboxDemo({
  disabled = false,
  readOnly = false,
  required = false,
  parent = true,
  state = "checked",
  title = "Packing for Crete",
  subtitle = "Flight leaves Friday at 07:40",
  parentLabel = "Everything packed",
  itemLabel = "Passport",
  hint = "Expires March 2029",
  boardingLabel = "Boarding pass",
  boardingHint = "Added to your wallet by the airline",
  count = 4,
  width = 340,
  gap = 2,
  size = 18,
  radius = 5,
  face = "",
  accent = "",
  ink = "",
}: {
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  parent?: boolean
  state?: "unchecked" | "checked" | "indeterminate"
  title?: string
  subtitle?: string
  parentLabel?: string
  itemLabel?: string
  hint?: string
  boardingLabel?: string
  boardingHint?: string
  count?: number
  width?: number
  gap?: number
  size?: number
  radius?: number
  face?: string
  accent?: string
  ink?: string
}) {
  const theme = {
    "--checkbox-size": `${size}px`,
    "--checkbox-radius": `${radius}px`,
    "--checkbox-gap": `${gap}px`,
    ...(face ? { "--checkbox-face": face } : null),
    ...(accent ? { "--checkbox-accent": accent } : null),
    ...(ink ? { "--checkbox-ink": ink } : null),
  } as React.CSSProperties
  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full">
      <h3 className="px-2.5 text-[15px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 px-2.5 text-[12px] text-muted-foreground">{subtitle}</p>
      <CheckboxGroup
        style={{ gap }} disabled={disabled} readOnly={readOnly} required={required}
        aria-label="Packing list"
        defaultValue={["passport", "sunscreen"]}
        allValues={items.slice(0, count).map((item) => item.value)}
        className="mt-4 gap-0.5"
      >
        <label className={row}>
          <Checkbox parent={parent} className="mt-px" />
          <span className="text-[13px] leading-[18px] font-medium">{parentLabel}</span>
        </label>
        <div className="mx-2.5 my-1 h-px bg-border" />
        {items.slice(0, count).map((item, index) => (
          <label key={item.value} data-item={item.value} className={row}>
            <Checkbox value={item.value} className="mt-px" />
            <span className="flex flex-col gap-1">
              <span className="text-[13px] leading-[18px] font-medium">{index === 0 ? itemLabel : item.label}</span>
              <span className="text-[12px] leading-none text-muted-foreground">{index === 0 ? hint : item.hint}</span>
            </span>
          </label>
        ))}
      </CheckboxGroup>
      <label className={row + " mt-0.5 opacity-100"}>
        <Checkbox disabled checked={state === "indeterminate" ? "indeterminate" : state === "checked"} className="mt-px" />
        <span className="flex flex-col gap-1">
          <span className="text-[13px] leading-[18px] font-medium text-muted-foreground">{boardingLabel}</span>
          <span className="text-[12px] leading-none text-muted-foreground">{boardingHint}</span>
        </span>
      </label>
    </div>
  )
}
