// A set of fields
// `FieldSet` and `FieldLegend` group related fields, and `FieldGroup` spaces them. Disabling the set disables every field in it.
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function FieldFieldset() {
  return (
    <FieldSet className="w-full max-w-[320px]">
      <FieldLegend>Shipping address</FieldLegend>
      <FieldGroup>
        <Field name="street">
          <FieldLabel>Street</FieldLabel>
          <Input autoComplete="street-address" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field name="city">
            <FieldLabel>City</FieldLabel>
            <Input autoComplete="address-level2" />
          </Field>
          <Field name="postcode">
            <FieldLabel>Postcode</FieldLabel>
            <Input autoComplete="postal-code" />
          </Field>
        </div>
      </FieldGroup>
    </FieldSet>
  )
}
