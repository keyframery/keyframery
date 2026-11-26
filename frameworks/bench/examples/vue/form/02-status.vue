<script setup lang="ts">
// Following the submission
// `onStatusChange` reports `submitting`, `success` and `error` with a reason. A rejected
// `submit` shows its message in `FormStatus`, read out as an alert.

import { ref } from "vue"

import { Form, FormItem, FormLabel, FormMessage, FormStatus, FormSubmit } from "@/components/keyframery/form"
import { Textarea } from "@/components/keyframery/textarea"

const status = ref("idle")

async function submit() {
  await new Promise((resolve) => setTimeout(resolve, 800))
  throw new Error("The kitchen closed for orders at 21:30. Try again tomorrow from 11:00.")
}
</script>

<template>
  <Form class="w-full max-w-[360px]" @status-change="(next) => status = next" :submit="submit">
    <FormItem name="note">
      <FormLabel>Note for the kitchen</FormLabel>
      <Textarea required default-value="No coriander, please." />
      <FormMessage />
    </FormItem>
    <div class="flex items-center gap-3">
      <FormSubmit pending-label="Sending" success-label="Sent">Send order</FormSubmit>
      <span class="text-[12px] text-muted-foreground tabular-nums">{{ status }}</span>
    </div>
    <FormStatus />
  </Form>
</template>
