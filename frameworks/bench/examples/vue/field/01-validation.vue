<script setup lang="ts">
// Validation
// `FieldError` shows the message that `match`es the browser's own check, once the field has been left or the form sent.

import { Button } from "@/components/keyframery/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/keyframery/field"
import { Input } from "@/components/keyframery/input"
</script>

<template>
  <form class="flex w-full max-w-[320px] flex-col gap-4" @submit.prevent>
    <Field name="email">
      <FieldLabel>Email</FieldLabel>
      <Input type="email" required placeholder="you@example.com" />
      <FieldDescription>We send the receipt here.</FieldDescription>
      <FieldError match="valueMissing">Enter your email address.</FieldError>
      <FieldError match="typeMismatch">That doesn't look like an email address.</FieldError>
    </Field>
    <Button type="submit" variant="primary" class="self-start">Continue</Button>
  </form>
</template>
