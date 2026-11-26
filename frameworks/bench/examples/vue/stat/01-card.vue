<script setup lang="ts">
// A stat with every part
// The label, an icon, the value, the delta with its comparison, and a sparkline that takes the delta's colour.

import { Wallet } from "@lucide/vue"

import { Sparkline } from "@/components/keyframery/sparkline"
import { Stat, StatChart, StatComparison, StatDelta, StatIcon, StatLabel, StatValue } from "@/components/keyframery/stat"

const money = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`
const daily = [3120, 3380, 3290, 3610, 3540, 3880, 4020, 3950, 4210, 4380, 4290, 4620, 4710, 4890]
</script>

<template>
  <Stat
    class="w-full max-w-[300px]"
    label="Revenue"
    :value="daily.reduce((a, b) => a + b, 0)"
    :format-value="money"
    :delta="0.124"
  >
    <StatLabel />
    <StatIcon>
      <Wallet />
    </StatIcon>
    <StatValue />
    <StatDelta />
    <StatComparison>vs previous 14 days</StatComparison>
    <StatChart>
      <Sparkline
        type="area"
        :data="daily"
        label="Revenue per day"
        period="last 14 days"
        :format-value="money"
      />
    </StatChart>
  </Stat>
</template>
