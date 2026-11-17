import * as React from "react"

import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@/components/ui/slider"

export const meta = { name: "Slider", group: "Forms" }

/* The demo plays itself: price presets make the range jump, so the fill travels on a spring
   and the price rolls. */
export const play = [
  { click: '[data-preset="budget"]', wait: 1500 },
  { click: '[data-preset="luxury"]', wait: 1500 },
  { click: '[data-preset="mid"]', wait: 1800 },
]

const presets = [
  { id: "budget", label: "Under €100", value: [40, 100] },
  { id: "mid", label: "€100 – €220", value: [100, 220] },
  { id: "luxury", label: "€220 and up", value: [220, 400] },
]

const MIN = 40
const MAX = 400
/* How many stays fall in each €15 band, from €40 to €400. */
const bands = [3, 5, 8, 12, 17, 22, 26, 31, 34, 30, 28, 24, 21, 18, 16, 13, 12, 10, 9, 7, 6, 5, 4, 4]

export const controls = {
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  range: { type: "switch", label: "Range", default: true, group: "Behaviour" },
  orientation: { type: "select", label: "Distance orientation", options: ["horizontal", "vertical"], default: "horizontal" },
  min: { type: "slider", label: "Minimum", min: 20, max: 80, step: 1, default: 40, unit: "€", group: "Layout" },
  max: { type: "slider", label: "Maximum", min: 300, max: 600, step: 1, default: 400, unit: "€", group: "Layout" },
  step: { type: "slider", label: "Price step", min: 1, max: 20, step: 1, default: 5, unit: "€", group: "Layout" },
  separation: { type: "slider", label: "Thumb separation", min: 0, max: 8, step: 1, default: 4, unit: "steps", group: "Layout" },
  title: { type: "text", label: "Title", default: "Price per night" },
  distanceLabel: { type: "text", label: "Distance label", default: "Distance from centre" },
  width: { type: "slider", label: "Width", min: 300, max: 480, step: 1, default: 380, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Preset gap", min: 0, max: 16, step: 1, default: 6, unit: "px", group: "Layout" },
  thickness: { type: "slider", label: "Thickness", min: 2, max: 12, step: 1, default: 6, unit: "px", group: "Layout" },
  thumbSize: { type: "slider", label: "Thumb size", min: 12, max: 24, step: 1, default: 16, unit: "px", group: "Layout" },
  corners: { type: "select", label: "Corners", options: ["round", "soft", "square"], default: "round" },
  items: { type: "slider", label: "Presets", min: 1, max: 3, step: 1, default: 3, unit: "", group: "Layout" },
  track: { type: "color", label: "Track", default: "", group: "Colours" },
  fill: { type: "color", label: "Fill", default: "", group: "Colours" },
  thumb: { type: "color", label: "Thumb", default: "", group: "Colours" },
} as const

export default function SliderDemo({
  disabled = false,
  readOnly = false,
  required = false,
  range = true,
  orientation = "horizontal",
  min = 40,
  max = 400,
  step = 5,
  separation = 4,
  title = "Price per night",
  distanceLabel = "Distance from centre",
  width = 380,
  gap = 6,
  thickness = 6,
  thumbSize = 16,
  corners = "round",
  items = 3,
  track = "",
  fill = "",
  thumb = "",
}: {
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  range?: boolean
  orientation?: "horizontal" | "vertical"
  min?: number
  max?: number
  step?: number
  separation?: number
  title?: string
  distanceLabel?: string
  width?: number
  gap?: number
  thickness?: number
  thumbSize?: number
  corners?: "round" | "soft" | "square"
  items?: number
  track?: string
  fill?: string
  thumb?: string
} = {}) {
  const theme = {
    "--slider-thickness": `${thickness}px`,
    "--slider-thumb-size": `${thumbSize}px`,
    ...(track ? { "--slider-track": track } : {}),
    ...(fill ? { "--slider-fill": fill } : {}),
    ...(thumb ? { "--slider-thumb": thumb } : {}),
    "--slider-radius": corners === "round" ? "9999px" : corners === "soft" ? "4px" : "0px",
  } as React.CSSProperties
  const [price, setPrice] = React.useState<number[]>([90, 260])
  const normalizePrice = React.useCallback((values: number[]) => {
    const ceiling = min + Math.floor((max - min) / step) * step
    const distance = Math.min(ceiling - min, separation * step)
    const snap = (value: number) => Math.max(min, Math.min(ceiling, min + Math.round((value - min) / step) * step))
    const lower = Math.min(snap(values[0]), ceiling - distance)
    return [lower, Math.max(snap(values[1]), lower + distance)]
  }, [min, max, step, separation])
  React.useEffect(() => setPrice(values => normalizePrice(values)), [normalizePrice])
  const lowerPrice = range ? price[0] : min
  const upperPrice = range ? price[1] : price[0]
  const tallest = Math.max(...bands)
  const bandWidth = (MAX - MIN) / bands.length
  const matches = bands.reduce((sum, count, i) => {
    const from = MIN + i * bandWidth
    return from + bandWidth > lowerPrice && from < upperPrice ? sum + count : sum
  }, 0)

  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full">
      <Slider
        value={range ? price : price[0]} disabled={disabled} readOnly={readOnly} required={required}
        onValueChange={(next) => setPrice(Array.isArray(next) ? next : [next as number, price[1]])}
        min={min}
        max={max}
        step={step}
        minStepsBetweenThumbs={separation}
        format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }}
        aria-label="Price per night"
        className="gap-0"
      >
        <div className="flex items-baseline justify-between">
          <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
          <SliderValue className="text-muted-foreground" />
        </div>
        <p className="mt-1 text-[12px] text-muted-foreground tabular-nums">{matches} stays in Edinburgh · taxes included</p>

        <div className="mt-5 flex h-14 items-end gap-[3px] px-2" aria-hidden>
          {bands.map((count, i) => {
            const from = MIN + i * bandWidth
            const inside = from + bandWidth > lowerPrice && from < upperPrice
            return (
              <span
                key={i}
                className={[
                  "flex-1 rounded-t-[3px] transition-colors duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
                  inside ? "bg-muted-foreground/45" : "bg-muted dark:bg-accent/70",
                ].join(" ")}
                style={{ height: `${Math.max(8, (count / tallest) * 100)}%` }}
              />
            )
          })}
        </div>
        <SliderControl className="-mt-[5px]">
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb index={0} aria-label="Minimum price" />
            {range && <SliderThumb index={1} aria-label="Maximum price" />}
          </SliderTrack>
        </SliderControl>
        <div className="mt-1 flex justify-between px-0.5 text-[11px] text-muted-foreground tabular-nums">
          <span>€{min}</span>
          <span>€{max}+</span>
        </div>
      </Slider>
      <div style={{ gap }} className="mt-3 flex flex-wrap">
        {presets.slice(0, items).map((p) => {
          const on = price[0] === p.value[0] && price[1] === p.value[1]
          return (
            <button
              key={p.id}
              type="button"
              data-preset={p.id}
              disabled={disabled || readOnly}
              onClick={() => setPrice(normalizePrice(p.value))}
              className={[
                "h-7 rounded-[8px] px-2.5 text-[12px] font-medium tabular-nums transition-[background-color,color,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] motion-reduce:transition-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none",
                on
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground dark:bg-accent",
              ].join(" ")}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      <div className="mt-6 h-px bg-border" />

      <Slider
        defaultValue={3} disabled={disabled} readOnly={readOnly} required={required} orientation={orientation}
        min={0.5}
        max={10}
        step={0.5}
        format={(value) => `${value} km`}
        className="mt-5"
      >
        <div className="flex items-baseline justify-between">
          <span id="distance" className="text-[13px] leading-none font-medium">{distanceLabel}</span>
          <SliderValue className="text-muted-foreground" />
        </div>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb aria-labelledby="distance" />
          </SliderTrack>
        </SliderControl>
      </Slider>
    </div>
  )
}
