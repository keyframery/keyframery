// Validation
// `FieldError` shows the message that `match`es the browser's own check, once the field has been left or the form sent.
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function FieldValidation() {
  return (
    <form className="flex w-full max-w-[320px] flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input type="email" required placeholder="you@example.com" />
        <FieldDescription>We send the receipt here.</FieldDescription>
        <FieldError match="valueMissing">Enter your email address.</FieldError>
        <FieldError match="typeMismatch">That doesn't look like an email address.</FieldError>
      </Field>
      <Button type="submit" variant="primary" className="self-start">
        Continue
      </Button>
    </form>
  )
}
