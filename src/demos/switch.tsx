import * as React from "react"

import { Switch } from "@/components/ui/switch"

export const meta = { name: "Switch", group: "Forms" }

/* The demo plays itself: switches flip both ways, so the thumb stretches in each direction. */
export const play = [
  { click: 'li:nth-child(2) [role="switch"]', wait: 1100 },
  { click: 'li:nth-child(1) [role="switch"]', wait: 1100 },
  { click: 'li:nth-child(2) [role="switch"]', wait: 1100 },
  { click: 'li:nth-child(1) [role="switch"]', wait: 1500 },
]

const settings = [
  { id: "orders", label: "Order updates", hint: "Shipping, delivery and returns", on: true },
  { id: "price", label: "Price drops", hint: "On items in your wishlist", on: false },
  { id: "digest", label: "Weekly picks", hint: "Every Sunday morning", on: true },
  { id: "sms", label: "Text messages", hint: "Add a phone number first", on: false, disabled: true },
]

export const controls = {
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  smsDisabled: { type: "switch", label: "Sms disabled", default: true, group: "Behaviour" },
  firstChecked: { type: "switch", label: "First checked", default: true, group: "Behaviour" },
  title: { type: "text", label: "Title", default: "Notifications" },
  description: { type: "text", label: "Description", default: "Choose what we email you about" },
  label: { type: "text", label: "Label", default: "Order updates" },
  hint: { type: "text", label: "Hint", default: "Shipping, delivery and returns" },
  items: { type: "slider", label: "Settings", min: 1, max: 4, step: 1, default: 4, unit: "", group: "Layout" },
  width: { type: "slider", label: "Width", min: 280, max: 480, step: 1, default: 360, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", min: 4, max: 28, step: 1, default: 16, unit: "px", group: "Layout" },
  trackWidth: { type: "slider", label: "Track width", min: 32, max: 64, step: 1, default: 38, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Height", min: 18, max: 32, step: 1, default: 22, unit: "px", group: "Layout" },
  thumbSize: { type: "slider", label: "Thumb size", min: 12, max: 24, step: 1, default: 18, unit: "px", group: "Layout" },
  pad: { type: "slider", label: "Pad", min: 0, max: 4, step: 1, default: 2, unit: "px", group: "Layout" },
  corners: { type: "select", label: "Corners", options: ["round", "soft", "square"], default: "round" },
  off: { type: "color", label: "Off", default: "", group: "Colours" },
  on: { type: "color", label: "On", default: "", group: "Colours" },
  thumb: { type: "color", label: "Thumb", default: "", group: "Colours" },
} as const

export default function SwitchDemo({
  disabled = false,
  readOnly = false,
  required = false,
  smsDisabled = true,
  firstChecked = true,
  title = "Notifications",
  description = "Choose what we email you about",
  label = "Order updates",
  hint = "Shipping, delivery and returns",
  items = 4,
  width = 360,
  gap = 16,
  trackWidth = 38,
  height = 22,
  thumbSize = 18,
  pad = 2,
  corners = "round",
  off = "",
  on = "",
  thumb = "",
}: {
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  smsDisabled?: boolean
  firstChecked?: boolean
  title?: string
  description?: string
  label?: string
  hint?: string
  items?: number
  width?: number
  gap?: number
  trackWidth?: number
  height?: number
  thumbSize?: number
  pad?: number
  corners?: "round" | "soft" | "square"
  off?: string
  on?: string
  thumb?: string
} = {}) {
  const theme = {
    "--switch-width": `${trackWidth}px`,
    "--switch-height": `${height}px`,
    "--switch-thumb-size": `${thumbSize}px`,
    "--switch-pad": `${pad}px`,
    ...(off ? { "--switch-off": off } : {}),
    ...(on ? { "--switch-on": on } : {}),
    ...(thumb ? { "--switch-thumb": thumb } : {}),
    "--switch-radius": corners === "round" ? "9999px" : corners === "soft" ? "6px" : "0px",
  } as React.CSSProperties
  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full">
      <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
      <ul className="mt-4 divide-y divide-border">
        {settings.slice(0, items).map((s) => (
          <li key={s.id}>
            <label
              style={{ gap }}
              className={[
                "flex cursor-pointer items-center justify-between gap-4 py-3",
                (disabled || (s.id === "sms" && smsDisabled)) ? "cursor-not-allowed" : "",
              ].join(" ")}
            >
              <span className="flex flex-col gap-1">
                <span className={"text-[13px] leading-none font-medium" + ((disabled || (s.id === "sms" && smsDisabled)) ? " text-muted-foreground" : "")}>
                  {s.id === "orders" ? label : s.label}
                </span>
                <span className="text-[12px] leading-none text-muted-foreground">{s.id === "orders" ? hint : s.hint}</span>
              </span>
              <Switch key={s.id + String(firstChecked)} defaultChecked={s.id === "orders" ? firstChecked : s.on} disabled={disabled || (s.id === "sms" && smsDisabled)} readOnly={readOnly} required={required} />
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
