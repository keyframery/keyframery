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

export default function SliderDemo() {
  const [price, setPrice] = React.useState<number[]>([90, 260])
  const tallest = Math.max(...bands)
  const width = (MAX - MIN) / bands.length
  const matches = bands.reduce((sum, count, i) => {
    const from = MIN + i * width
    return from + width > price[0] && from < price[1] ? sum + count : sum
  }, 0)

  return (
    <div className="w-[380px]">
      <Slider
        value={price}
        onValueChange={(next) => setPrice(next as number[])}
        min={MIN}
        max={MAX}
        step={5}
        minStepsBetweenThumbs={4}
        format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }}
        aria-label="Price per night"
        className="gap-0"
      >
        <div className="flex items-baseline justify-between">
          <h3 className="text-[15px] font-semibold tracking-tight">Price per night</h3>
          <SliderValue className="text-muted-foreground" />
        </div>
        <p className="mt-1 text-[12px] text-muted-foreground tabular-nums">{matches} stays in Edinburgh · taxes included</p>

        <div className="mt-5 flex h-14 items-end gap-[3px] px-2" aria-hidden>
          {bands.map((count, i) => {
            const from = MIN + i * width
            const inside = from + width > price[0] && from < price[1]
            return (
              <span
                key={i}
                className={[
                  "flex-1 rounded-t-[3px] transition-colors duration-150 motion-reduce:transition-none",
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
            <SliderThumb index={1} aria-label="Maximum price" />
          </SliderTrack>
        </SliderControl>
        <div className="mt-1 flex justify-between px-0.5 text-[11px] text-muted-foreground tabular-nums">
          <span>€40</span>
          <span>€400+</span>
        </div>
      </Slider>
      <div className="mt-3 flex gap-1.5">
        {presets.map((p) => {
          const on = price[0] === p.value[0] && price[1] === p.value[1]
          return (
            <button
              key={p.id}
              type="button"
              data-preset={p.id}
              onClick={() => setPrice(p.value)}
              className={[
                "h-7 rounded-[8px] px-2.5 text-[12px] font-medium tabular-nums transition-[background-color,color,scale] duration-200 ease-pop active:scale-[0.96] motion-reduce:transition-none",
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
        defaultValue={3}
        min={0.5}
        max={10}
        step={0.5}
        format={(value) => `${value} km`}
        className="mt-5"
      >
        <div className="flex items-baseline justify-between">
          <span id="distance" className="text-[13px] leading-none font-medium">Distance from centre</span>
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
