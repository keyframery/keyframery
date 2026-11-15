import * as React from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

export const meta = { name: "Textarea", group: "Forms" }

const limit = 280

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

export default function TextareaDemo() {
  const [note, setNote] = React.useState(start)

  return (
    <div className="flex w-[380px] flex-col gap-4">
      <Field name="note">
        <FieldLabel>Note for your host</FieldLabel>
        <Textarea
          value={note}
          onValueChange={(value) => setNote(value)}
          maxLength={limit}
          placeholder="Arrival time, allergies, anything they should know"
        />
        <div className="flex items-baseline justify-between gap-4">
          <FieldDescription>Marta usually replies within an hour.</FieldDescription>
          <span className="text-[12px] leading-4 text-muted-foreground tabular-nums">
            {note.length} / {limit}
          </span>
        </div>
      </Field>
      <Field name="review" disabled>
        <FieldLabel>Your review</FieldLabel>
        <Textarea placeholder="Reviews open after your stay, on 17 May." />
      </Field>
    </div>
  )
}
