<script setup lang="ts">
import { Chart, type ChartConfig } from "@/components/keyframery/chart"

const data = [
  { month: "Jan", visitors: 1840 },
  { month: "Feb", visitors: 2120 },
  { month: "Mar", visitors: 1980 },
]
const config = { visitors: { label: "Visitors" } } satisfies ChartConfig
</script>

<template>
  <Chart aria-label="Visitors" :data="data" :config="config" category-key="month" />
</template>
