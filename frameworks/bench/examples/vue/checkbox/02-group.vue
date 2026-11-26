<script setup lang="ts">
// Group with select all
// In a `CheckboxGroup` with `allValues`, a checkbox marked `parent` checks them all. It shows a dash when only some are.

import { Checkbox, CheckboxGroup } from "@/components/keyframery/checkbox"

const toppings = [
  { value: "cheese", label: "Extra cheese" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "olives", label: "Olives" },
]
</script>

<template>
  <CheckboxGroup
    aria-label="Toppings"
    :default-value="['cheese']"
    :all-values="toppings.map((t) => t.value)"
    class="text-[13px]"
  >
    <label class="flex items-center gap-2.5 font-medium"><Checkbox parent />All toppings</label>
    <label v-for="t in toppings" :key="t.value" class="flex items-center gap-2.5 pl-6">
      <Checkbox :value="t.value" />{{ t.label }}
    </label>
  </CheckboxGroup>
</template>
