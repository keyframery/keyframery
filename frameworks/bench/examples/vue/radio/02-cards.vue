<script setup lang="ts">
// As cards
// Put more in the label for a choice with details. `disabled` on a radio greys out that option.

import { Radio, RadioGroup } from "@/components/keyframery/radio"

const options = [
  { value: "standard", label: "Standard", hint: "3 to 5 days", price: "Free" },
  { value: "express", label: "Express", hint: "Next day", price: "£6" },
  { value: "same-day", label: "Same day", hint: "Not in your area", price: "£12", disabled: true },
]
</script>

<template>
  <RadioGroup aria-label="Delivery" default-value="express" class="w-full max-w-[320px] gap-2">
    <label
      v-for="o in options"
      :key="o.value"
      class="flex cursor-pointer items-center gap-3 rounded-[12px] border bg-background px-3.5 py-3 has-data-disabled:cursor-not-allowed has-data-disabled:opacity-60"
    >
      <Radio :value="o.value" :disabled="o.disabled" />
      <span class="flex flex-1 flex-col gap-1">
        <span class="text-[13px] leading-none font-medium">{{ o.label }}</span>
        <span class="text-[12px] leading-none text-muted-foreground">{{ o.hint }}</span>
      </span>
      <span class="text-[13px] font-medium">{{ o.price }}</span>
    </label>
  </RadioGroup>
</template>
