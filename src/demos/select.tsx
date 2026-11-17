import * as React from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIcon,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const meta = { name: "Select", group: "Menus" }

/* The demo plays itself: the cabin list unfolds, the highlight glides, a cabin is chosen and its
   name rises into the field; then the same for the currency, and back again. */
export const play = [
  { click: "#kf-cabin", wait: 900 },
  { key: "ArrowDown", wait: 450 },
  { key: "Enter", wait: 1300 },
  { click: "#kf-currency", wait: 900 },
  { key: "ArrowDown", wait: 450 },
  { key: "ArrowDown", wait: 450 },
  { key: "Enter", wait: 1300 },
  { click: "#kf-cabin", wait: 900 },
  { key: "ArrowUp", wait: 450 },
  { key: "Enter", wait: 1100 },
  { click: "#kf-currency", wait: 900 },
  { key: "Home", wait: 450 },
  { key: "Enter", wait: 1300 },
]

const cabins = [
  { value: "economy", label: "Economy", price: "€640" },
  { value: "premium", label: "Premium economy", price: "€1,120" },
  { value: "business", label: "Business", price: "€2,980" },
  { value: "first", label: "First", price: "Sold out", disabled: true },
]

const currencies = [
  { value: "eur", label: "Euro", code: "EUR", symbol: "€" },
  { value: "usd", label: "US dollar", code: "USD", symbol: "$" },
  { value: "gbp", label: "Pound sterling", code: "GBP", symbol: "£" },
  { value: "jpy", label: "Japanese yen", code: "JPY", symbol: "¥" },
]

function Symbol({ children }: { children: string }) {
  return <span className="text-[13px] leading-none font-medium">{children}</span>
}

export const controls = {
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  multiple: { type: "switch", label: "Multiple", default: false, group: "Behaviour" },
  loop: { type: "switch", label: "Loop", default: true, group: "Behaviour" },
  dismissible: { type: "switch", label: "Dismissible", default: true, group: "Behaviour" },
  alignItemWithTrigger: { type: "switch", label: "Align item with trigger", default: false, group: "Behaviour" },
  side: { type: "select", label: "Side", options: ["top", "right", "bottom", "left"], default: "bottom" },
  align: { type: "select", label: "Align", options: ["start", "center", "end"], default: "start" },
  presentation: { type: "select", label: "Presentation", options: ["auto", "popover", "sheet"], default: "popover" },
  modal: { type: "select", label: "Modal", options: ["pointer", "true", "false"], default: "pointer" },
  title: { type: "text", label: "Title", default: "London to Singapore" },
  items: { type: "slider", label: "Cabins", min: 2, max: 4, step: 1, default: 4, unit: "", group: "Layout" },
  width: { type: "slider", label: "Width", min: 340, max: 480, step: 1, default: 400, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Height", min: 28, max: 48, step: 1, default: 36, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", min: 0, max: 20, step: 1, default: 10, unit: "px", group: "Layout" },
  sideOffset: { type: "slider", label: "Popup gap", min: 0, max: 24, step: 1, default: 6, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
} as const

export default function SelectDemo({
  disabled = false,
  readOnly = false,
  required = false,
  multiple = false,
  loop = true,
  dismissible = true,
  alignItemWithTrigger = false,
  side = "bottom",
  align = "start",
  presentation = "popover",
  modal = "pointer",
  title = "London to Singapore",
  items = 4,
  width = 400,
  height = 36,
  radius = 10,
  sideOffset = 6,
  face = "",
  ink = "",
  accent = "",
}: {
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  multiple?: boolean
  loop?: boolean
  dismissible?: boolean
  alignItemWithTrigger?: boolean
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  presentation?: "auto" | "popover" | "sheet"
  modal?: "pointer" | "true" | "false"
  title?: string
  items?: number
  width?: number
  height?: number
  radius?: number
  sideOffset?: number
  face?: string
  ink?: string
  accent?: string
} = {}) {
  const theme = {
    "--select-height": `${height}px`,
    "--select-radius": `${radius}px`,
    ...(face ? { "--select-face": face } : {}),
    ...(ink ? { "--select-ink": ink } : {}),
    ...(accent ? { "--select-accent": accent } : {}),
  } as React.CSSProperties
  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full rounded-[16px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <span className="text-[12px] text-muted-foreground tabular-nums">Thu 9 Oct · 1 stop</span>
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">Choose a cabin and how you would like to pay.</p>
      <div className="mt-4 grid grid-cols-[1fr_150px] gap-3">
        <Select<string, boolean> key={`cabin-${multiple}`} multiple={multiple} defaultValue={multiple ? ["premium"] : "premium"} items={cabins.slice(0, items)} disabled={disabled} readOnly={readOnly} required={required} loop={loop} dismissible={dismissible} presentation={presentation} modal={modal === "pointer" ? "pointer" : modal === "true"}>
          <div>
            <SelectLabel>Cabin</SelectLabel>
            <SelectTrigger id="kf-cabin">
              <SelectValue />
            </SelectTrigger>
          </div>
          <SelectContent style={theme} side={side} align={align} sideOffset={sideOffset} alignItemWithTrigger={alignItemWithTrigger} className="w-64">
            {cabins.slice(0, items).map((cabin) => (
              <SelectItem key={cabin.value} value={cabin.value} disabled={cabin.disabled}>
                <SelectItemText>{cabin.label}</SelectItemText>
                <span className="text-[12px] text-muted-foreground tabular-nums">{cabin.price}</span>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select<string, boolean> key={`currency-${multiple}`} multiple={multiple} defaultValue={multiple ? ["eur"] : "eur"} disabled={disabled} readOnly={readOnly} required={required} loop={loop} dismissible={dismissible} presentation={presentation} modal={modal === "pointer" ? "pointer" : modal === "true"} items={currencies.map((c) => ({ value: c.value, label: c.code }))}>
          <div>
            <SelectLabel>Currency</SelectLabel>
            <SelectTrigger id="kf-currency">
              <SelectValue>
                {(state) => {
                  const c = currencies.find((x) => x.value === state.value)
                  return (
                    <span className="flex items-center gap-2">
                      <span className="w-3 text-center text-muted-foreground">{c?.symbol}</span>
                      {state.label}
                    </span>
                  )
                }}
              </SelectValue>
            </SelectTrigger>
          </div>
          <SelectContent style={theme} side={side} align={align} sideOffset={sideOffset} alignItemWithTrigger={alignItemWithTrigger} className="w-56">
            {currencies.map((c) => (
              <SelectItem key={c.value} value={c.value} label={c.code}>
                <SelectItemIcon>
                  <Symbol>{c.symbol}</Symbol>
                </SelectItemIcon>
                <SelectItemText>{c.label}</SelectItemText>
                <span className="text-[12px] text-muted-foreground">{c.code}</span>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
