import * as React from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

export const meta = { name: "Textarea", group: "Forms" }

const start =
  "We land at 22:40, so we should reach the flat around midnight. Is a late check-in possible?"
const extra = " We can bring the keys back by 11."

/* Types a value one character at a time. */
function typeOut(into: string, text: string, step = 90) {
  return Array.from(text, (_, i) => ({ type: text.slice(0, i + 1), into, wait: step }))
}

/* The demo plays itself: focus the note (the ring closes in), add a line, then put it back. */
export const play = [
  { click: '[data-slot="field"]:nth-child(1) [data-slot="field-label"]', wait: 700 },
  ...Array.from(extra, (_, i) => ({ type: start + extra.slice(0, i + 1), into: "textarea", wait: 60 })),
  { wait: 1600 },
  { type: start, into: "textarea", wait: 400 },
  { click: '[data-slot="field"]:nth-child(2) [data-slot="field-label"]', wait: 1600 },
]

export const controls = {
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  autoResize: { type: "switch", label: "Auto resize", default: true, group: "Behaviour" },
  reviewDisabled: { type: "switch", label: "Review disabled", default: true, group: "Behaviour" },
  invalid: { type: "switch", label: "Invalid", default: false, group: "Behaviour" },
  submitShortcut: { type: "select", label: "Submit shortcut", options: ["none", "enter", "mod+enter"], default: "none" },
  maxLength: { type: "slider", label: "Character limit", min: 100, max: 500, step: 1, default: 280, unit: "", group: "Layout" },
  title: { type: "text", label: "Title", default: "Note for your host" },
  placeholder: { type: "text", label: "Placeholder", default: "Arrival time, allergies, anything they should know" },
  initialText: { type: "text", label: "Initial text", default: "We land at 22:40, so we should reach the flat around midnight. Is a late check-in possible?" },
  reviewPlaceholder: { type: "text", label: "Review placeholder", default: "Reviews open after your stay, on 17 May." },
  width: { type: "slider", label: "Width", min: 280, max: 480, step: 1, default: 380, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", min: 8, max: 32, step: 1, default: 16, unit: "px", group: "Layout" },
  minHeight: { type: "slider", label: "Min height", min: 56, max: 140, step: 1, default: 76, unit: "px", group: "Layout" },
  maxHeight: { type: "slider", label: "Max height", min: 160, max: 300, step: 1, default: 220, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", min: 0, max: 24, step: 1, default: 10, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  ring: { type: "color", label: "Ring", default: "", group: "Colours" },
} as const

export default function TextareaDemo({
  disabled = false,
  readOnly = false,
  required = false,
  autoResize = true,
  reviewDisabled = true,
  invalid = false,
  submitShortcut = "none",
  maxLength = 280,
  title = "Note for your host",
  placeholder = "Arrival time, allergies, anything they should know",
  initialText = "We land at 22:40, so we should reach the flat around midnight. Is a late check-in possible?",
  reviewPlaceholder = "Reviews open after your stay, on 17 May.",
  width = 380,
  gap = 16,
  minHeight = 76,
  maxHeight = 220,
  radius = 10,
  face = "",
  ink = "",
  ring = "",
}: {
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  autoResize?: boolean
  reviewDisabled?: boolean
  invalid?: boolean
  submitShortcut?: "none" | "enter" | "mod+enter"
  maxLength?: number
  title?: string
  placeholder?: string
  initialText?: string
  reviewPlaceholder?: string
  width?: number
  gap?: number
  minHeight?: number
  maxHeight?: number
  radius?: number
  face?: string
  ink?: string
  ring?: string
} = {}) {
  const theme = {
    "--textarea-min-height": `${minHeight}px`,
    "--textarea-max-height": `${maxHeight}px`,
    "--textarea-radius": `${radius}px`,
    ...(face ? { "--textarea-face": face } : {}),
    ...(ink ? { "--textarea-ink": ink } : {}),
    ...(ring ? { "--textarea-ring": ring } : {}),
  } as React.CSSProperties
  const [note, setNote] = React.useState(initialText)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  React.useEffect(() => setNote(initialText), [initialText])

  return (
    <div style={{ ...theme, maxWidth: width, gap }} className="flex w-full flex-col">
      <Field name="note">
        <FieldLabel>{title}</FieldLabel>
        <Textarea
          ref={inputRef} value={note} disabled={disabled} readOnly={readOnly} required={required} autoResize={autoResize} aria-invalid={invalid || undefined} submitShortcut={submitShortcut === "none" ? undefined : submitShortcut} onSubmit={submitShortcut === "none" ? undefined : () => inputRef.current?.blur()}
          onValueChange={(value) => setNote(value)}
          maxLength={maxLength}
          placeholder={placeholder}
        />
        <div className="flex items-baseline justify-between gap-4">
          <FieldDescription>Marta usually replies within an hour.</FieldDescription>
          <span className="text-[12px] leading-4 text-muted-foreground tabular-nums">
            {note.length} / {maxLength}
          </span>
        </div>
      </Field>
      <Field name="review" disabled={reviewDisabled || disabled}>
        <FieldLabel>Your review</FieldLabel>
        <Textarea placeholder={reviewPlaceholder} readOnly={readOnly} required={required} autoResize={autoResize} />
      </Field>
    </div>
  )
}
