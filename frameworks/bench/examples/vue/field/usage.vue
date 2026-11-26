<script setup lang="ts">
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/keyframery/field"
import { Input } from "@/components/keyframery/input"
</script>

<template>
  <Field name="email">
    <FieldLabel>Email</FieldLabel>
    <Input type="email" required />
    <FieldDescription>We never share it.</FieldDescription>
    <FieldError match="valueMissing">Enter your email.</FieldError>
  </Field>
</template>
