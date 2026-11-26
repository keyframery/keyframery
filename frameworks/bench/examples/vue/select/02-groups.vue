<script setup lang="ts">
// Groups and details
// Group items under labels. Pass `items` so the trigger shows each value's label, and anything else in a row stays in the list.

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/keyframery/select"

const zones = [
  { label: "Europe", items: [["london", "London", "GMT+1"], ["paris", "Paris", "GMT+2"]] },
  { label: "Asia", items: [["dubai", "Dubai", "GMT+4"], ["tokyo", "Tokyo", "GMT+9"]] },
]
/* The labels the trigger shows. */
const items = zones.flatMap((zone) => zone.items.map(([value, label]) => ({ value, label })))
</script>

<template>
  <Select default-value="london" :items="items">
    <SelectTrigger aria-label="Time zone" class="w-[220px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent class="w-60">
      <SelectGroup v-for="(zone, i) in zones" :key="zone.label">
        <SelectSeparator v-if="i > 0" />
        <SelectGroupLabel>{{ zone.label }}</SelectGroupLabel>
        <SelectItem v-for="[value, city, offset] in zone.items" :key="value" :value="value">
          <SelectItemText>{{ city }}</SelectItemText>
          <span class="text-[12px] text-muted-foreground tabular-nums">{{ offset }}</span>
          <SelectItemIndicator />
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
