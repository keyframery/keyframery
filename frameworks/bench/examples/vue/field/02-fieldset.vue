<script setup lang="ts">
// A set of fields
// `FieldSet` and `FieldLegend` group related fields, and `FieldGroup` spaces them. Disabling the set disables every field in it.

import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/keyframery/field"
import { Input } from "@/components/keyframery/input"
</script>

<template>
  <FieldSet class="w-full max-w-[320px]">
    <FieldLegend>Shipping address</FieldLegend>
    <FieldGroup>
      <Field name="street">
        <FieldLabel>Street</FieldLabel>
        <Input autocomplete="street-address" />
      </Field>
      <div class="grid grid-cols-2 gap-3">
        <Field name="city">
          <FieldLabel>City</FieldLabel>
          <Input autocomplete="address-level2" />
        </Field>
        <Field name="postcode">
          <FieldLabel>Postcode</FieldLabel>
          <Input autocomplete="postal-code" />
        </Field>
      </div>
    </FieldGroup>
  </FieldSet>
</template>
