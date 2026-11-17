import * as React from "react"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export const controls = {
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  timeDisabled: { type: "switch", label: "Time disabled", default: true, group: "Behaviour" },
  invalid: { type: "select", label: "Invalid", default: "auto", options: ["auto", "invalid", "valid"], group: "Behaviour" },
  required: { type: "switch", label: "Required", default: true, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  title: { type: "text", label: "Title", default: "Reserve a table" },
  description: { type: "text", label: "Description", default: "Padella, Borough. Friday 14 June, 2 guests" },
  namePlaceholder: { type: "text", label: "Name placeholder", default: "Your name" },
  emailPlaceholder: { type: "text", label: "Email placeholder", default: "you@example.com" },
  submitLabel: { type: "text", label: "Submit label", default: "Reserve table" },
  nameError: { type: "text", label: "Name error", default: "Enter the name for the booking." },
  emailError: { type: "text", label: "Email error", default: "Enter your email address." },
  width: { type: "slider", label: "Width", default: 360, min: 280, max: 480, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 6, min: 0, max: 16, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 10, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Height", default: 36, min: 28, max: 48, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  muted: { type: "color", label: "Muted", default: "", group: "Colours" },
  error: { type: "color", label: "Error", default: "", group: "Colours" },
} as const

export const meta = { name: "Field", group: "Forms" }

/* Types a value one character at a time. */
function typeOut(into: string, text: string, step = 90) {
  return Array.from(text, (_, i) => ({ type: text.slice(0, i + 1), into, wait: step }))
}

/* The demo plays itself: an empty submit opens the errors, typing fills the fields. */
export const play = [
  { type: "", into: 'input[data-play="name"]', wait: 100 },
  { type: "", into: 'input[type="email"]', wait: 600 },
  { click: 'button[type="submit"]', wait: 1800 },
  ...typeOut('input[data-play="name"]', "Tom Becker", 80),
  { wait: 500 },
  ...typeOut('input[type="email"]', "tom@", 90),
  { wait: 1400 },
  ...typeOut('input[type="email"]', "tom@becker.co", 90).slice(5),
  { wait: 1800 },
]

export default function FieldDemo({
  disabled = false,
  timeDisabled = true,
  invalid = "auto",
  required = true,
  readOnly = false,
  title = "Reserve a table",
  description = "Padella, Borough. Friday 14 June, 2 guests",
  namePlaceholder = "Your name",
  emailPlaceholder = "you@example.com",
  submitLabel = "Reserve table",
  nameError = "Enter the name for the booking.",
  emailError = "Enter your email address.",
  width = 360,
  gap = 6,
  radius = 10,
  height = 36,
  face = "",
  ink = "",
  muted = "",
  error = "",
}: {
  disabled?: boolean
  timeDisabled?: boolean
  invalid?: "auto" | "invalid" | "valid"
  required?: boolean
  readOnly?: boolean
  title?: string
  description?: string
  namePlaceholder?: string
  emailPlaceholder?: string
  submitLabel?: string
  nameError?: string
  emailError?: string
  width?: number
  gap?: number
  radius?: number
  height?: number
  face?: string
  ink?: string
  muted?: string
  error?: string
}) {
  const inputTheme = { height, borderRadius: radius, ...(face ? { background: face } : null), ...(ink ? { color: ink } : null), ...(muted ? { "--input-hint": muted } : null), ...(error ? { "--input-invalid": error } : null) } as React.CSSProperties
  const theme = {
    "--field-gap": `${gap}px`,
    "--field-radius": `${radius}px`,
    "--field-height": `${height}px`,
    ...(face ? { "--field-face": face } : null),
    ...(ink ? { "--field-ink": ink } : null),
    ...(muted ? { "--field-muted": muted } : null),
    ...(error ? { "--field-error": error } : null),
  } as React.CSSProperties
  return (
    <form style={{ ...theme, maxWidth: width }} className="w-full" onSubmit={(event) => event.preventDefault()}>
      <FieldSet disabled={disabled}>
        <FieldLegend>{title}</FieldLegend>
        <FieldDescription>{description}</FieldDescription>
        <FieldGroup>
          <Field name="name" invalid={invalid === "auto" ? undefined : invalid === "invalid"}>
            <FieldLabel>Name</FieldLabel>
            <Input data-play="name" style={inputTheme} required={required} readOnly={readOnly} autoComplete="off" placeholder={namePlaceholder} />
            <FieldError match="valueMissing">{nameError}</FieldError>
          </Field>
          <Field name="email" invalid={invalid === "auto" ? undefined : invalid === "invalid"}>
            <FieldLabel>Email</FieldLabel>
            <Input style={inputTheme} type="email" required={required} readOnly={readOnly} autoComplete="off" placeholder={emailPlaceholder} />
            <FieldDescription>We send the confirmation here.</FieldDescription>
            <FieldError match="valueMissing">{emailError}</FieldError>
            <FieldError match="typeMismatch">That doesn't look like an email address.</FieldError>
          </Field>
          <Field name="time" disabled={timeDisabled}>
            <FieldLabel>Time</FieldLabel>
            <Input style={inputTheme} readOnly={readOnly} defaultValue="19:30" />
            <FieldDescription>The only table left that evening.</FieldDescription>
          </Field>
        </FieldGroup>
        <button
          type="submit"
          className="inline-flex h-9 cursor-pointer items-center justify-center rounded-[9px] bg-primary px-3.5 text-[13px] leading-none font-medium text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] outline-none transition-[translate,scale,box-shadow] duration-[calc(100ms*var(--kf-speed,1))] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px active:scale-[0.985] active:shadow-[inset_0_1px_0_rgb(255_255_255/0.1),0_0_1px_rgb(0_0_0/0.3)] motion-reduce:transition-none"
        >
          {submitLabel}
        </button>
      </FieldSet>
    </form>
  )
}
