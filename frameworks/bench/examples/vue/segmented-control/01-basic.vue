<script setup lang="ts">
// Basic
// One choice from a few. The key glides to the one you pick.

import { ref } from "vue"

import { SegmentedControl, SegmentedControlItem } from "@/components/keyframery/segmented-control"

const prices = { monthly: "£9 a month", yearly: "£90 a year" }

const period = ref<keyof typeof prices>("yearly")
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <SegmentedControl v-model:value="period" aria-label="Billing">
      <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
      <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
    </SegmentedControl>
    <span class="text-[14px] font-medium">{{ prices[period] }}</span>
  </div>
</template>
