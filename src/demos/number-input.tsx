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
            className="flex flex-col transition-[translate] duration-500 ease-spring [translate:0_calc(var(--d)*-1.2em)] motion-reduce:transition-none"
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

export default function NumberInputDemo() {
  const [nights, setNights] = React.useState<number | null>(3)
  const [guests, setGuests] = React.useState<number | null>(2)
  const total = (nights ?? 0) * nightly

  return (
    <div className="flex w-full max-w-[340px] flex-col gap-5">
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight">Hollow Farm cottage</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">Sleeps 4, €{nightly} a night</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <NumberInput value={nights} onValueChange={(value) => setNights(value)} min={1} max={28}>
            <NumberInputScrubArea pixelsPerStep={6}>
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
          <NumberInput value={guests} onValueChange={(value) => setGuests(value)} min={1} max={4}>
            <NumberInputScrubArea pixelsPerStep={10}>
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
