import * as React from "react"

import { Label, LabelMarker } from "@/components/ui/label"
import { Radio, RadioGroup } from "@/components/ui/radio"
import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack, SliderValue } from "@/components/ui/slider"

export const meta = { name: "Label", group: "Forms" }

/* The demo plays itself: pressing a label moves focus into its control, so the label inks in and
   its marker pops; sending without a seat turns Seating invalid until one is picked. */
export const play = [
  { click: 'label[for="kf-seating"]', wait: 1500 },
  { click: 'label[for="kf-party"]', wait: 1500 },
  { click: '[data-action="send"]', wait: 1700 },
  { click: '[data-seat="terrace"] [data-slot="radio"]', wait: 1500 },
  { click: '[data-action="clear"]', wait: 1400 },
]

const seats = [
  { value: "indoors", label: "Indoors", hint: "Main room" },
  { value: "terrace", label: "Terrace", hint: "Heated" },
  { value: "bar", label: "Bar", hint: "Walk-in" },
]

const key =
  "inline-flex h-8 items-center rounded-[9px] px-3 text-[13px] leading-none font-medium transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"

export default function LabelDemo() {
  const [seat, setSeat] = React.useState<string | null>(null)
  const [party, setParty] = React.useState(4)
  const [sent, setSent] = React.useState(false)
  const invalid = sent && !seat

  return (
    <form
      className="w-[400px]"
      onSubmit={(e) => {
        e.preventDefault()
        setSent(true)
      }}
    >
      <h3 className="text-[15px] font-semibold tracking-tight">Book a table</h3>
      <p className="mt-1 text-[12px] text-muted-foreground">Padella, Friday 22 November at 8pm</p>

      <div className="mt-5 flex items-center justify-between">
        <Label htmlFor="kf-seating">
          Seating <LabelMarker>Required</LabelMarker>
        </Label>
        <span
          className={[
            "text-[11.5px] text-destructive transition-[opacity,translate] duration-[calc(220ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
            invalid ? "opacity-100" : "translate-y-0.5 opacity-0",
          ].join(" ")}
          aria-live="polite"
        >
          {invalid ? "Pick where you'd like to sit" : ""}
        </span>
      </div>
      <RadioGroup
        id="kf-seating"
        value={seat}
        onValueChange={(v) => setSeat(v as string)}
        aria-invalid={invalid || undefined}
        className="mt-2.5 grid grid-cols-3 gap-2 [--kf-radio-pad:0px] before:z-10 before:rounded-[12px] before:shadow-[0_0_0_1.5px_var(--primary)]"
      >
        {seats.map((s) => (
          <label
            key={s.value}
            data-seat={s.value}
            className={[
              "flex cursor-pointer items-center gap-2.5 rounded-[12px] bg-background px-3 py-2.5",
              "shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
              "transition-shadow duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
              "hover:shadow-[0_0_0_1px_rgb(0_0_0/0.14),0_1px_2px_rgb(0_0_0/0.05)] dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.14)]",
              invalid ? "ring-1 ring-destructive/50" : "",
              "has-data-checked:[anchor-name:--kf-radio]",
            ].join(" ")}
          >
            <Radio value={s.value} className="data-checked:[anchor-name:none]" />
            <span className="flex flex-col gap-1">
              <span className="text-[13px] leading-none font-medium">{s.label}</span>
              <span className="text-[11px] leading-none text-muted-foreground">{s.hint}</span>
            </span>
          </label>
        ))}
      </RadioGroup>

      <Slider
        id="kf-party"
        value={party}
        onValueChange={(v) => setParty(v as number)}
        min={1}
        max={12}
        className="mt-6 gap-0"
      >
        <div className="flex items-center justify-between">
          <Label htmlFor="kf-party">
            Party size <LabelMarker>Optional</LabelMarker>
          </Label>
          <span className="text-[13px] text-muted-foreground tabular-nums">
            <SliderValue className="text-foreground" /> {party === 1 ? "guest" : "guests"}
          </span>
        </div>
        <SliderControl className="mt-3">
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          data-action="clear"
          onClick={() => {
            setSeat(null)
            setSent(false)
            setParty(4)
          }}
          className={`${key} text-muted-foreground hover:bg-foreground/[0.045] hover:text-foreground`}
        >
          Clear
        </button>
        <button
          type="submit"
          data-action="send"
          className={`${key} bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]`}
        >
          Request table
        </button>
      </div>
    </form>
  )
}
