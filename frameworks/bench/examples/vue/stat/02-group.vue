<script setup lang="ts">
// A row of stats
// StatGroup puts stats on one surface with hairlines between them: four across on a wide container, two, then one. Refunds should fall, so `downIsGood` colours their fall green.

import { Stat, StatComparison, StatDelta, StatGroup, StatLabel, StatValue } from "@/components/keyframery/stat"

const stats = [
  { label: "Revenue", value: 124505, format: (v: number) => `$${v.toLocaleString("en-US")}`, delta: 0.065 },
  { label: "Orders", value: 1839, format: (v: number) => v.toLocaleString("en-US"), delta: 0.031 },
  { label: "Average order", value: 67.7, format: (v: number) => `$${v.toFixed(2)}`, delta: -0.012 },
  { label: "Refund rate", value: 0.02, format: (v: number) => `${(v * 100).toFixed(1)}%`, delta: -0.027, downIsGood: true },
]
</script>

<template>
  <StatGroup aria-label="Store, last 30 days">
    <Stat
      v-for="s in stats"
      :key="s.label"
      :label="s.label"
      :value="s.value"
      :format-value="s.format"
      :delta="s.delta"
      :down-is-good="s.downIsGood"
    >
      <StatLabel />
      <StatValue />
      <StatDelta />
      <StatComparison>vs previous 30 days</StatComparison>
    </Stat>
  </StatGroup>
</template>
