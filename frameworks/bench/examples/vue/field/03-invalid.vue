<script setup lang="ts">
// Server errors
// Pass `invalid` to show an error you got back from the server. `FieldError` without `match` always shows while the field is invalid.

import { Field, FieldError, FieldLabel } from "@/components/keyframery/field"
import { Input } from "@/components/keyframery/input"
</script>

<template>
  <Field name="username" invalid class="w-full max-w-[320px]">
    <FieldLabel>Username</FieldLabel>
    <Input default-value="maya" />
    <FieldError>That username is taken. Try maya.chen.</FieldError>
  </Field>
</template>
