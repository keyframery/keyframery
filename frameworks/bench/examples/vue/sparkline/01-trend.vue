<script setup lang="ts">
// Coloured by its news
// `trendColor` draws a rising line green and a falling one red. Refunds should fall, so `downIsGood` turns the colour round.

import { Sparkline } from "@/components/keyframery/sparkline"

const visits = [820, 870, 860, 940, 910, 1020, 1080, 1050, 1160, 1210]
const refunds = [3.1, 3.0, 3.2, 2.9, 2.7, 2.8, 2.5, 2.4, 2.3, 2.1]
</script>

<template>
  <div class="grid w-full max-w-[280px] gap-5 text-[13px]">
    <div class="grid gap-1.5">
      <span class="font-medium">Visits</span>
      <Sparkline type="area" trend-color :data="visits" label="Visits" period="last 10 days" />
    </div>
    <div class="grid gap-1.5">
      <span class="font-medium">Refund rate</span>
      <Sparkline
        trend-color
        down-is-good
        :data="refunds"
        label="Refund rate"
        period="last 10 days"
        :format-value="(v) => `${v}%`"
      />
    </div>
  </div>
</template>
