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

export default function ColorPickerDemo() {
  const [color, setColor] = React.useState("#0090ff")

  return (
    <div className="w-full max-w-[340px]">
      <ColorPicker aria-label="Work calendar colour" value={color} onValueChange={setColor} format="hex">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[15px] font-semibold tracking-tight">Work</div>
            <div className="mt-1 text-[12px] text-muted-foreground">Calendar label colour</div>
          </div>
          <ColorPickerPopover>
            <ColorPickerTrigger aria-label="Change label colour">
              <ColorPickerSwatch />
              <span className="tabular-nums uppercase">{color}</span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m4 6 4 4 4-4" />
              </svg>
            </ColorPickerTrigger>
            <ColorPickerContent align="end">
              <ColorPickerArea>
                <ColorPickerAreaThumb />
              </ColorPickerArea>
              <ColorPickerSlider channel="hue">
                <ColorPickerSliderThumb />
              </ColorPickerSlider>
              <ColorPickerSwatches aria-label="Suggested colours" className="flex-nowrap justify-between gap-0">
                {presets.map((preset) => (
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
        {events.map((event) => (
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
