// Server errors
// Pass `invalid` to show an error you got back from the server. `FieldError` without `match` always shows while the field is invalid.
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function FieldInvalid() {
  return (
    <Field name="username" invalid className="w-full max-w-[320px]">
      <FieldLabel>Username</FieldLabel>
      <Input defaultValue="maya" />
      <FieldError>That username is taken. Try maya.chen.</FieldError>
    </Field>
  )
}
