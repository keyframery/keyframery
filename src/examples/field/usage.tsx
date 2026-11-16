import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function Usage() {
  return (
    <Field name="email">
      <FieldLabel>Email</FieldLabel>
      <Input type="email" required />
      <FieldDescription>We never share it.</FieldDescription>
      <FieldError match="valueMissing">Enter your email.</FieldError>
    </Field>
  )
}
