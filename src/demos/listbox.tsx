import * as React from "react"

import { Listbox, ListboxItem, ListboxItemIndicator } from "@/components/ui/listbox"

export const meta = { name: "Listbox", group: "Menus" }

/* The demo plays itself: toppings are added and removed (the check draws, the box pops) while the
   highlight glides between rows; then the crust changes and changes back. */
const topping = (n: number) => `[aria-labelledby="toppings-label"] > [data-slot=listbox-item]:nth-child(${n})`
const crust = (n: number) => `[aria-labelledby="crust-label"] > [data-slot=listbox-item]:nth-child(${n})`
export const play = [
  { click: topping(3), wait: 800 },
  { key: "ArrowDown", wait: 450 },
  { key: "ArrowDown", wait: 600 },
  { key: " ", wait: 900 },
  { key: " ", wait: 600 },
  { key: "ArrowUp", wait: 450 },
  { key: "ArrowUp", wait: 600 },
  { key: " ", wait: 900 },
  { click: crust(1), wait: 900 },
  { key: "ArrowDown", wait: 700 },
  { click: crust(3), wait: 1200 },
]

const crusts = [
  { value: "thin", label: "Thin and crisp" },
  { value: "classic", label: "Classic" },
  { value: "sourdough", label: "Sourdough, 48h" },
]

const toppings = [
  { value: "basil", label: "Fresh basil", price: 0.5 },
  { value: "burrata", label: "Burrata", price: 3 },
  { value: "mushroom", label: "Wild mushrooms", price: 2 },
  { value: "olive", label: "Black olives", price: 1 },
  { value: "nduja", label: "’Nduja", price: 2.5 },
  { value: "anchovy", label: "Anchovies", price: 2, disabled: true },
]

const base = 9
const euro = (n: number) => `€${n.toFixed(2)}`

export const controls = {
  multiple: { type: "switch", label: "Multiple toppings", default: true, group: "Behaviour" },
  orientation: { type: "select", label: "Orientation", default: "vertical", options: ["vertical", "horizontal"] },
  activation: { type: "select", label: "Selection follows focus", default: "default", options: ["default", "automatic", "manual"] },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  loop: { type: "switch", label: "Loop navigation", default: true, group: "Behaviour" },
  deselectable: { type: "switch", label: "Deselect current crust", default: false, group: "Behaviour" },
  keepInView: { type: "switch", label: "Keep option in view", default: true, group: "Behaviour" },
  items: { type: "slider", label: "Toppings", default: 6, min: 3, max: 6, step: 1, unit: "", group: "Layout" },
  title: { type: "text", label: "Heading", default: "Build your pizza" },
  width: { type: "slider", label: "Width", default: 460, min: 320, max: 480, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Column gap", default: 12, min: 0, max: 28, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Frame corners", default: 12, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  itemRadius: { type: "slider", label: "Option corners", default: 8, min: 0, max: 16, step: 1, unit: "px", group: "Layout" },
  rowHeight: { type: "slider", label: "Row height", default: 32, min: 28, max: 48, step: 1, unit: "px", group: "Layout" },
  surface: { type: "color", label: "Frame", default: "", group: "Colours" },
  ink: { type: "color", label: "Text", default: "", group: "Colours" },
  highlight: { type: "color", label: "Highlight", default: "", group: "Colours" },
  selected: { type: "color", label: "Selected box", default: "", group: "Colours" },
} as const

export default function ListboxDemo({
  multiple = true,
  orientation = "vertical",
  activation = "default",
  disabled = false,
  readOnly = false,
  required = false,
  loop = true,
  deselectable = false,
  keepInView = true,
  items = 6,
  title = "Build your pizza",
  width = 460,
  gap = 12,
  radius = 12,
  itemRadius = 8,
  rowHeight = 32,
  surface = "",
  ink = "",
  highlight = "",
  selected = "",
}: {
  multiple?: boolean
  orientation?: "vertical" | "horizontal"
  activation?: "default" | "automatic" | "manual"
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  loop?: boolean
  deselectable?: boolean
  keepInView?: boolean
  items?: number
  title?: string
  width?: number
  gap?: number
  radius?: number
  itemRadius?: number
  rowHeight?: number
  surface?: string
  ink?: string
  highlight?: string
  selected?: string
}) {
  const theme = {
    "--listbox-radius": `${radius}px`,
    "--listbox-item-radius": `${itemRadius}px`,
    "--listbox-row-height": `${rowHeight}px`,
    ...(surface ? { "--listbox-surface": surface } : {}),
    ...(ink ? { "--listbox-ink": ink } : {}),
    ...(highlight ? { "--listbox-highlight": highlight } : {}),
    ...(selected ? { "--listbox-selected": selected } : {}),
  } as React.CSSProperties
  const [picked, setPicked] = React.useState<string[]>(["basil", "burrata"])
  const total = base + toppings.slice(0, items).filter((t) => picked.includes(t.value)).reduce((sum, t) => sum + t.price, 0)

  return (
    <div style={{ ...theme, maxWidth: width }} className="@container w-full max-w-[460px]">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <span className="text-[13px] font-medium tabular-nums">{euro(total)}</span>
      </div>
      <div style={{ gap }} className="mt-4 grid grid-cols-[160px_1fr] gap-3 @max-[26rem]:grid-cols-1 @max-[26rem]:gap-4">
        <div>
          <div id="crust-label" className="mb-2 text-[12px] font-medium text-muted-foreground">
            Crust
          </div>
          <Listbox aria-labelledby="crust-label" defaultValue="sourdough" orientation={orientation} activation={activation === "default" ? undefined : activation} disabled={disabled} readOnly={readOnly} required={required} loop={loop} deselectable={deselectable} keepInView={keepInView}>
            {crusts.map((c) => (
              <ListboxItem key={c.value} value={c.value}>
                {c.label}
                <ListboxItemIndicator />
              </ListboxItem>
            ))}
          </Listbox>
        </div>
        <div>
          <div id="toppings-label" className="mb-2 flex justify-between text-[12px] font-medium text-muted-foreground">
            Toppings
            <span className="tabular-nums">{picked.length} chosen</span>
          </div>
          <Listbox<string, boolean>
            aria-labelledby="toppings-label"
            multiple={multiple}
            orientation={orientation}
            activation={activation === "default" ? undefined : activation}
            disabled={disabled} readOnly={readOnly} required={required} loop={loop} keepInView={keepInView}
            value={multiple ? picked : picked[0] ?? null}
            onValueChange={(value) => setPicked(Array.isArray(value) ? value : value ? [value] : [])}
          >
            {toppings.slice(0, items).map((t) => (
              <ListboxItem key={t.value} value={t.value} label={t.label} disabled={t.disabled}>
                <span className="min-w-0 flex-1 truncate">{t.label}</span>
                <span className="text-[12px] text-muted-foreground tabular-nums">
                  {t.disabled ? "Out today" : `+${euro(t.price)}`}
                </span>
                <ListboxItemIndicator className="ms-1" />
              </ListboxItem>
            ))}
          </Listbox>
        </div>
      </div>
    </div>
  )
}
