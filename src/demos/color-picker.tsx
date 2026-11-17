import * as React from "react"

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerContent,
  ColorPickerEyeDropper,
  ColorPickerInput,
  ColorPickerPopover,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  ColorPickerSwatch,
  ColorPickerSwatches,
  ColorPickerSwatchItem,
  ColorPickerTrigger,
} from "@/components/ui/color-picker"

export const controls = {
  space: { type: "select", label: "Space", default: "hsv", options: ["hsv", "hsl", "srgb", "oklch"], group: "Behaviour" },
  format: { type: "select", label: "Format", default: "hex", options: ["hex", "srgb", "hsl", "oklch"], group: "Behaviour" },
  gamut: { type: "select", label: "Gamut", default: "srgb", options: ["srgb", "p3", "unlimited"], group: "Behaviour" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  orientation: { type: "select", label: "Orientation", default: "horizontal", options: ["horizontal", "vertical"], group: "Behaviour" },
  channel: { type: "select", label: "Channel", default: "hue", options: ["hue", "alpha", "red", "green", "blue", "saturation", "brightness", "lightness", "chroma"], group: "Behaviour" },
  side: { type: "select", label: "Side", default: "bottom", options: ["bottom", "top", "left", "right"], group: "Behaviour" },
  align: { type: "select", label: "Align", default: "end", options: ["start", "center", "end"], group: "Behaviour" },
  presetCount: { type: "slider", label: "Preset count", default: 8, min: 1, max: 8, step: 1 },
  eventCount: { type: "slider", label: "Event count", default: 2, min: 1, max: 2, step: 1 },
  title: { type: "text", label: "Title", default: "Work" },
  subtitle: { type: "text", label: "Subtitle", default: "Calendar label colour" },
  value: { type: "text", label: "Value", default: "#0090ff" },
  width: { type: "slider", label: "Width", default: 256, min: 220, max: 360, step: 1, unit: "px", group: "Layout" },
  areaHeight: { type: "slider", label: "Area height", default: 144, min: 100, max: 220, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 14, min: 0, max: 28, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 12, min: 4, max: 24, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
} as const

export const meta = { name: "Color Picker", group: "Forms" }

/* The demo plays itself: the picker unfolds from its swatch, two presets are chosen (each ring
   pops open), then it closes. */
const swatch = (n: number) => `[data-slot="color-picker-swatch-item"]:nth-of-type(${n})`
export const play = [
  { click: '[data-slot="popover-trigger"]', wait: 1000 },
  { click: swatch(7), wait: 900 },
  { click: swatch(4), wait: 900 },
  { click: swatch(6), wait: 1000 },
  { click: '[data-slot="popover-trigger"]', wait: 1300 },
]

/* The picker's own data: preset label colours. */
const presets = ["#e5484d", "#f76b15", "#ffc53d", "#30a46c", "#12a594", "#0090ff", "#6e56cf", "#d6409f"]

const events = [
  { time: "09:30", title: "Design review", place: "Room 4" },
  { time: "13:00", title: "Lunch with Tom", place: "Bao, Soho" },
]

export default function ColorPickerDemo({
  space = "hsv",
  format = "hex",
  gamut = "srgb",
  disabled = false,
  readOnly = false,
  orientation = "horizontal",
  channel = "hue",
  side = "bottom",
  align = "end",
  presetCount = 8,
  eventCount = 2,
  title = "Work",
  subtitle = "Calendar label colour",
  value = "#0090ff",
  width = 256,
  areaHeight = 144,
  radius = 14,
  gap = 12,
  face = "",
  ink = "",
}: {
  space?: "hsv" | "hsl" | "srgb" | "oklch"
  format?: "hex" | "srgb" | "hsl" | "oklch"
  gamut?: "srgb" | "p3" | "unlimited"
  disabled?: boolean
  readOnly?: boolean
  orientation?: "horizontal" | "vertical"
  channel?: "hue" | "alpha" | "red" | "green" | "blue" | "saturation" | "brightness" | "lightness" | "chroma"
  side?: "bottom" | "top" | "left" | "right"
  align?: "start" | "center" | "end"
  presetCount?: number
  eventCount?: number
  title?: string
  subtitle?: string
  value?: string
  width?: number
  areaHeight?: number
  radius?: number
  gap?: number
  face?: string
  ink?: string
}) {
  const theme = {
    "--color-picker-width": `${width}px`,
    "--color-picker-area-height": `${areaHeight}px`,
    "--color-picker-radius": `${radius}px`,
    "--color-picker-gap": `${gap}px`,
    ...(face ? { "--color-picker-face": face } : null),
    ...(ink ? { "--color-picker-ink": ink } : null),
  } as React.CSSProperties
  const [color, setColor] = React.useState(value)
  React.useEffect(() => setColor(value), [value])

  return (
    <div style={theme} className="w-full max-w-[340px]">
      <ColorPicker aria-label="Work calendar colour" value={color} onValueChange={setColor} format={format} space={space} gamut={gamut === "unlimited" ? false : gamut} disabled={disabled} readOnly={readOnly}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[15px] font-semibold tracking-tight">{title}</div>
            <div className="mt-1 text-[12px] text-muted-foreground">{subtitle}</div>
          </div>
          <ColorPickerPopover>
            <ColorPickerTrigger aria-label="Change label colour">
              <ColorPickerSwatch />
              <span className="tabular-nums uppercase">{color}</span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m4 6 4 4 4-4" />
              </svg>
            </ColorPickerTrigger>
            <ColorPickerContent style={theme} side={side} align={align}>
              <ColorPickerArea>
                <ColorPickerAreaThumb />
              </ColorPickerArea>
              <ColorPickerSlider channel={space === "srgb" && channel === "hue" ? "red" : channel} orientation={orientation}>
                <ColorPickerSliderThumb />
              </ColorPickerSlider>
              <ColorPickerSwatches aria-label="Suggested colours" className="flex-nowrap justify-between gap-0">
                {presets.slice(0, presetCount).map((preset) => (
                  <ColorPickerSwatchItem key={preset} value={preset} />
                ))}
              </ColorPickerSwatches>
              <div className="flex items-center gap-2">
                <ColorPickerInput aria-label="Hex" className="uppercase" />
                <ColorPickerEyeDropper aria-label="Pick from screen" />
              </div>
            </ColorPickerContent>
          </ColorPickerPopover>
        </div>
      </ColorPicker>

      <ul className="mt-5 space-y-2">
        {events.slice(0, eventCount).map((event) => (
          <li
            key={event.title}
            className="relative flex items-center gap-3 overflow-hidden rounded-[10px] py-2.5 pr-3 pl-4 text-[13px]"
            style={{ background: `color-mix(in oklab, ${color} 12%, transparent)` }}
          >
            <span className="absolute inset-y-2 left-1.5 w-[3px] rounded-full" style={{ background: color }} />
            <span className="w-11 text-muted-foreground tabular-nums">{event.time}</span>
            <span className="font-medium">{event.title}</span>
            <span className="ml-auto text-[12px] text-muted-foreground">{event.place}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
