import * as React from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  NumberInputScrubArea,
} from "@/components/ui/number-input"

export const meta = { name: "Number Input", group: "Forms" }

/* The demo plays itself: step nights up and guests to their limit, then back. */
export const play = [
  { click: '[aria-label="One more night"]', wait: 450 },
  { click: '[aria-label="One more night"]', wait: 450 },
  { click: '[aria-label="One more night"]', wait: 900 },
  { click: '[aria-label="One more guest"]', wait: 450 },
  { click: '[aria-label="One more guest"]', wait: 1300 },
  { click: '[aria-label="One night fewer"]', wait: 450 },
  { click: '[aria-label="One night fewer"]', wait: 450 },
  { click: '[aria-label="One night fewer"]', wait: 900 },
  { click: '[aria-label="One guest fewer"]', wait: 450 },
  { click: '[aria-label="One guest fewer"]', wait: 1300 },
]

/* Each digit is a column of 0 to 9 that rolls to its place. */
function Roll({ text }: { text: string }) {
  return (
    <span className="inline-flex h-[1.2em] overflow-hidden leading-[1.2em] tabular-nums">
      {text.split("").map((c, i) =>
        /\d/.test(c) ? (
          <span
            key={text.length - i}
            style={{ "--d": Number(c) } as React.CSSProperties}
            className="flex flex-col transition-[translate] duration-[calc(500ms*var(--kf-speed,1))] ease-spring [translate:0_calc(var(--d)*-1.2em)] motion-reduce:transition-none"
          >
            {Array.from({ length: 10 }, (_, d) => (
              <span key={d} className="h-[1.2em]">
                {d}
              </span>
            ))}
          </span>
        ) : (
          <span key={`${text.length - i}${c}`}>{c}</span>
        ),
      )}
    </span>
  )
}

const nightly = 142

export const controls = {
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  wheel: { type: "switch", label: "Wheel stepping", default: false, group: "Behaviour" },
  orientation: { type: "select", label: "Scrub direction", default: "horizontal", options: ["horizontal", "vertical"] },
  min: { type: "slider", label: "Minimum", default: 1, min: 0, max: 3, step: 1, unit: "", group: "Behaviour" },
  maxNights: { type: "slider", label: "Maximum nights", default: 28, min: 6, max: 60, step: 1, unit: "", group: "Behaviour" },
  maxGuests: { type: "slider", label: "Maximum guests", default: 4, min: 2, max: 12, step: 1, unit: "", group: "Behaviour" },
  step: { type: "slider", label: "Step", default: 1, min: 0.5, max: 4, step: 0.5, unit: "", group: "Behaviour" },
  initialNights: { type: "slider", label: "Nights", default: 3, min: 1, max: 28, step: 1, unit: "", group: "Reading" },
  initialGuests: { type: "slider", label: "Guests", default: 2, min: 1, max: 4, step: 1, unit: "", group: "Reading" },
  title: { type: "text", label: "Cottage", default: "Hollow Farm cottage" },
  width: { type: "slider", label: "Width", default: 340, min: 260, max: 480, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Section gap", default: 20, min: 8, max: 32, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Corners", default: 10, min: 0, max: 20, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Field height", default: 36, min: 32, max: 52, step: 1, unit: "px", group: "Layout" },
  surface: { type: "color", label: "Field", default: "", group: "Colours" },
  ink: { type: "color", label: "Text", default: "", group: "Colours" },
  keyColour: { type: "color", label: "Steppers", default: "", group: "Colours" },
  focus: { type: "color", label: "Focus", default: "", group: "Colours" },
} as const

export default function NumberInputDemo({
  disabled = false,
  readOnly = false,
  required = false,
  wheel = false,
  orientation = "horizontal",
  min = 1,
  maxNights = 28,
  maxGuests = 4,
  step = 1,
  initialNights = 3,
  initialGuests = 2,
  title = "Hollow Farm cottage",
  width = 340,
  gap = 20,
  radius = 10,
  height = 36,
  surface = "",
  ink = "",
  keyColour = "",
  focus = "",
}: {
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  wheel?: boolean
  orientation?: "horizontal" | "vertical"
  min?: number
  maxNights?: number
  maxGuests?: number
  step?: number
  initialNights?: number
  initialGuests?: number
  title?: string
  width?: number
  gap?: number
  radius?: number
  height?: number
  surface?: string
  ink?: string
  keyColour?: string
  focus?: string
}) {
  const theme = {
    "--number-input-height": `${height}px`,
    "--number-input-step-size": `${height - 8}px`,
    "--number-input-radius": `${radius}px`,
    ...(surface ? { "--number-input-surface": surface } : {}),
    ...(ink ? { "--number-input-ink": ink } : {}),
    ...(keyColour ? { "--number-input-key": keyColour } : {}),
    ...(focus ? { "--number-input-focus": focus } : {}),
  } as React.CSSProperties
  const [nights, setNights] = React.useState<number | null>(initialNights)
  const [guests, setGuests] = React.useState<number | null>(initialGuests)
  React.useEffect(() => setNights(initialNights), [initialNights])
  React.useEffect(() => setGuests(initialGuests), [initialGuests])
  const total = (nights ?? 0) * nightly

  return (
    <div style={{ ...theme, maxWidth: width, gap }} className="flex w-full max-w-[340px] flex-col gap-5">
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">Sleeps {maxGuests}, €{nightly} a night</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <NumberInput value={nights} onValueChange={(value) => setNights(value)} min={min} max={maxNights} step={step} disabled={disabled} readOnly={readOnly} required={required} wheel={wheel}>
            <NumberInputScrubArea orientation={orientation} pixelsPerStep={6}>
              <FieldLabel>Nights</FieldLabel>
            </NumberInputScrubArea>
            <NumberInputGroup>
              <NumberInputDecrement aria-label="One night fewer" />
              <NumberInputControl />
              <NumberInputIncrement aria-label="One more night" />
            </NumberInputGroup>
          </NumberInput>
        </Field>
        <Field>
          <NumberInput value={guests} onValueChange={(value) => setGuests(value)} min={min} max={maxGuests} step={step} disabled={disabled} readOnly={readOnly} required={required} wheel={wheel}>
            <NumberInputScrubArea orientation={orientation} pixelsPerStep={10}>
              <FieldLabel>Guests</FieldLabel>
            </NumberInputScrubArea>
            <NumberInputGroup>
              <NumberInputDecrement aria-label="One guest fewer" />
              <NumberInputControl />
              <NumberInputIncrement aria-label="One more guest" />
            </NumberInputGroup>
          </NumberInput>
        </Field>
      </div>
      <Field disabled>
        <FieldLabel>Rooms</FieldLabel>
        <NumberInput defaultValue={1} disabled>
          <NumberInputGroup>
            <NumberInputDecrement aria-label="One room fewer" />
            <NumberInputControl />
            <NumberInputIncrement aria-label="One more room" />
          </NumberInputGroup>
        </NumberInput>
        <FieldDescription>The flat is booked as a whole.</FieldDescription>
      </Field>
      <div className="flex items-baseline justify-between border-t border-border pt-4 text-[13px]">
        <span className="inline-flex items-baseline gap-1 text-muted-foreground tabular-nums">
          <Roll text={String(nights ?? 0)} /> {nights === 1 ? "night" : "nights"} ·{" "}
          <Roll text={String(guests ?? 0)} /> {guests === 1 ? "guest" : "guests"}
        </span>
        <span className="text-[15px] font-semibold tracking-tight">
          <Roll text={`€${total.toLocaleString("en-GB")}`} />
        </span>
      </div>
    </div>
  )
}
