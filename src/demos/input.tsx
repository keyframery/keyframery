import * as React from "react"

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

export const controls = {
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  invalid: { type: "switch", label: "Invalid", default: false, group: "Behaviour" },
  clearable: { type: "switch", label: "Clear button", default: true, group: "Behaviour" },
  type: { type: "select", label: "Destination type", default: "text", options: ["text", "search", "url"] },
  label: { type: "text", label: "Destination label", default: "Where to?" },
  destination: { type: "text", label: "Destination", default: "Rome" },
  placeholder: { type: "text", label: "Destination hint", default: "City, landmark or address" },
  emailPlaceholder: { type: "text", label: "Email hint", default: "you@example.com" },
  description: { type: "text", label: "Email description", default: "Your tickets are sent here." },
  width: { type: "slider", label: "Width", default: 340, min: 240, max: 480, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Field gap", default: 16, min: 4, max: 32, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Field height", default: 36, min: 28, max: 52, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Corners", default: 10, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  surface: { type: "color", label: "Field", default: "", group: "Colours" },
  ink: { type: "color", label: "Text", default: "", group: "Colours" },
  hint: { type: "color", label: "Placeholder", default: "", group: "Colours" },
  focus: { type: "color", label: "Focus", default: "", group: "Colours" },
  errorColour: { type: "color", label: "Invalid", default: "", group: "Colours" },
} as const

export default function InputDemo({
  disabled = false,
  readOnly = false,
  required = false,
  invalid = false,
  clearable = true,
  type = "text",
  label = "Where to?",
  destination = "Rome",
  placeholder = "City, landmark or address",
  emailPlaceholder = "you@example.com",
  description = "Your tickets are sent here.",
  width = 340,
  gap = 16,
  height = 36,
  radius = 10,
  surface = "",
  ink = "",
  hint = "",
  focus = "",
  errorColour = "",
}: {
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  clearable?: boolean
  type?: "text" | "search" | "url"
  label?: string
  destination?: string
  placeholder?: string
  emailPlaceholder?: string
  description?: string
  width?: number
  gap?: number
  height?: number
  radius?: number
  surface?: string
  ink?: string
  hint?: string
  focus?: string
  errorColour?: string
}) {
  const theme = {
    "--input-height": `${height}px`,
    "--input-radius": `${radius}px`,
    ...(errorColour ? { "--input-invalid": errorColour } : {}),
    ...(surface ? { "--input-surface": surface } : {}),
    ...(ink ? { "--input-ink": ink } : {}),
    ...(hint ? { "--input-hint": hint } : {}),
    ...(focus ? { "--input-focus": focus } : {}),
  } as React.CSSProperties
  return (
    <div style={{ ...theme, maxWidth: width, gap }} className="flex w-full max-w-[340px] flex-col gap-4">
      <Field name="destination" disabled={disabled} invalid={invalid || undefined}>
        <FieldLabel>{label}</FieldLabel>
        <InputGroup>
          <SearchIcon />
          <Input key={destination} type={type} defaultValue={destination} placeholder={placeholder} readOnly={readOnly} required={required} autoComplete="off" />
          {clearable && <InputClear aria-label="Clear destination" />}
        </InputGroup>
      </Field>
      <Field name="email" disabled={disabled} invalid={invalid || undefined}>
        <FieldLabel>Email</FieldLabel>
        <Input readOnly={readOnly} required={required} type="email" placeholder={emailPlaceholder} autoComplete="off" />
        <FieldDescription>{description}</FieldDescription>
      </Field>
      <Field name="page" disabled={disabled} invalid={invalid || undefined}>
        <FieldLabel>Trip page</FieldLabel>
        <InputGroup className="gap-0">
          <span>trips.co/</span>
          <Input readOnly={readOnly} required={required} defaultValue="rome-in-may" autoComplete="off" spellCheck={false} />
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
