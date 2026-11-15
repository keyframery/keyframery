import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input, InputClear, InputGroup } from "@/components/ui/input"

export const meta = { name: "Input", group: "Forms" }

/* Types a value one character at a time. */
function typeOut(into: string, text: string, step = 90) {
  return Array.from(text, (_, i) => ({ type: text.slice(0, i + 1), into, wait: step }))
}

/* The demo plays itself: focus jumps between fields so the ring closes in on each one. */
export const play = [
  { type: "", into: 'input[type="email"]', wait: 200 },
  { click: '[data-slot="field"]:nth-child(2) [data-slot="field-label"]', wait: 700 },
  ...typeOut('input[type="email"]', "maya@hey.com"),
  { wait: 1000 },
  { click: '[data-slot="field"]:nth-child(3) [data-slot="field-label"]', wait: 1400 },
  { click: '[data-slot="field"]:nth-child(1) [data-slot="field-label"]', wait: 1400 },
]

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="7.25" cy="7.25" r="4.25" />
      <path d="m10.5 10.5 3 3" />
    </svg>
  )
}

export default function InputDemo() {
  return (
    <div className="flex w-[340px] flex-col gap-4">
      <Field name="destination">
        <FieldLabel>Where to?</FieldLabel>
        <InputGroup>
          <SearchIcon />
          <Input defaultValue="Lisbon" placeholder="City, landmark or address" autoComplete="off" />
          <InputClear aria-label="Clear destination" />
        </InputGroup>
      </Field>
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input type="email" placeholder="you@example.com" autoComplete="off" />
        <FieldDescription>Your tickets are sent here.</FieldDescription>
      </Field>
      <Field name="page">
        <FieldLabel>Trip page</FieldLabel>
        <InputGroup className="gap-0">
          <span>trips.co/</span>
          <Input defaultValue="lisbon-offsite" autoComplete="off" spellCheck={false} />
        </InputGroup>
      </Field>
      <Field name="reference" disabled>
        <FieldLabel>Booking reference</FieldLabel>
        <Input defaultValue="LX-48213" />
        <FieldDescription>Set once the trip is paid.</FieldDescription>
      </Field>
    </div>
  )
}
