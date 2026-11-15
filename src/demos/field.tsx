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

export const meta = { name: "Field", group: "Forms" }

/* Types a value one character at a time. */
function typeOut(into: string, text: string, step = 90) {
  return Array.from(text, (_, i) => ({ type: text.slice(0, i + 1), into, wait: step }))
}

/* The demo plays itself: an empty submit opens the errors, typing fills the fields. */
export const play = [
  { type: "", into: 'input[placeholder="Your name"]', wait: 100 },
  { type: "", into: 'input[type="email"]', wait: 600 },
  { click: 'button[type="submit"]', wait: 1800 },
  ...typeOut('input[placeholder="Your name"]', "Tom Becker", 80),
  { wait: 500 },
  ...typeOut('input[type="email"]', "tom@", 90),
  { wait: 1400 },
  ...typeOut('input[type="email"]', "tom@becker.co", 90).slice(5),
  { wait: 1800 },
]

export default function FieldDemo() {
  return (
    <form className="w-[360px]" onSubmit={(event) => event.preventDefault()}>
      <FieldSet>
        <FieldLegend>Reserve a table</FieldLegend>
        <FieldDescription>Padella, Borough. Friday 14 June, 2 guests</FieldDescription>
        <FieldGroup>
          <Field name="name">
            <FieldLabel>Name</FieldLabel>
            <Input required autoComplete="off" placeholder="Your name" />
            <FieldError match="valueMissing">Enter the name for the booking.</FieldError>
          </Field>
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input type="email" required autoComplete="off" placeholder="you@example.com" />
            <FieldDescription>We send the confirmation here.</FieldDescription>
            <FieldError match="valueMissing">Enter your email address.</FieldError>
            <FieldError match="typeMismatch">That doesn't look like an email address.</FieldError>
          </Field>
          <Field name="time" disabled>
            <FieldLabel>Time</FieldLabel>
            <Input defaultValue="19:30" />
            <FieldDescription>The only table left that evening.</FieldDescription>
          </Field>
        </FieldGroup>
        <button
          type="submit"
          className="inline-flex h-9 cursor-pointer items-center justify-center rounded-[9px] bg-primary px-3.5 text-[13px] leading-none font-medium text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] outline-none transition-[translate,scale,box-shadow] duration-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px active:scale-[0.985] active:shadow-[inset_0_1px_0_rgb(255_255_255/0.1),0_0_1px_rgb(0_0_0/0.3)] motion-reduce:transition-none"
        >
          Reserve table
        </button>
      </FieldSet>
    </form>
  )
}
