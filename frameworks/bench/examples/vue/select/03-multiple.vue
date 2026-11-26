<script setup lang="ts">
// Several values
// `multiple` keeps it open while you pick. The trigger lists the choices, and `maxLabels` shortens a long list to “and 2 more”.

import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectItemText, SelectTrigger, SelectValue } from "@/components/keyframery/select"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
</script>

<template>
  <Select multiple :default-value="['Monday', 'Wednesday']" placeholder="Choose days">
    <SelectTrigger aria-label="Days" class="w-[260px]">
      <SelectValue :max-labels="2" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="day in days" :key="day" :value="day">
        <SelectItemText>{{ day }}</SelectItemText>
        <SelectItemIndicator />
      </SelectItem>
    </SelectContent>
  </Select>
</template>
