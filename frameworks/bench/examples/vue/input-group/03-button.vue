<script setup lang="ts">
// With a button
// `InputGroupButton` is Keyframery's Button, sized to sit inside the field. Here it copies a link.

import { ref } from "vue"
import { Check, Copy } from "@lucide/vue"

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/keyframery/input-group"

const copied = ref(false)
const link = "https://cal.example/ines/30min"

function onClick() {
  navigator.clipboard?.writeText(link)
  copied.value = true
}
</script>

<template>
  <InputGroup class="max-w-[340px]">
    <InputGroupInput aria-label="Booking link" read-only :value="link" />
    <InputGroupAddon align="inline-end">
      <InputGroupButton size="icon-xs" :aria-label="copied ? 'Copied' : 'Copy link'" @click="onClick">
        <Check v-if="copied" />
        <Copy v-else />
      </InputGroupButton>
    </InputGroupAddon>
  </InputGroup>
</template>
