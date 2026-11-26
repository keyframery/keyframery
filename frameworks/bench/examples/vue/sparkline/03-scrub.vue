<script setup lang="ts">
// Read the point under the pointer
// `onActiveIndexChange` tells you which point someone is reading, by pointer or arrow keys, so a headline can follow it.

import { computed, ref } from "vue"

import { Roll, Sparkline } from "@/components/keyframery/sparkline"

const revenue = [4210, 4480, 4390, 4720, 5010, 4880, 5240, 5530, 5410, 5860, 6020, 6310]
const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"]
const money = (v: number) => `$${v.toLocaleString("en-US")}`

const index = ref<number | null>(null)
const at = computed(() => index.value ?? revenue.length - 1)
</script>

<template>
  <div class="grid w-full max-w-[280px] gap-2">
    <div class="text-[13px] text-muted-foreground">{{ months[at] }} revenue</div>
    <div class="text-[24px] leading-none font-semibold tracking-tight">
      <Roll :text="money(revenue[at])" />
    </div>
    <Sparkline
      type="area"
      :data="revenue"
      :labels="months"
      label="Revenue"
      period="last 12 months"
      :format-value="money"
      @active-index-change="(v) => (index = v)"
    />
  </div>
</template>
