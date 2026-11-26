<script setup lang="ts">
// Nested spans
// Give an item `children` for a trace. `visibleWaterfallRows` lists the rows, and `WaterfallIndicator` folds a span open and shut.

import {
  Waterfall,
  WaterfallAxis,
  WaterfallBar,
  WaterfallColumnHeader,
  type WaterfallData,
  WaterfallHeaderRow,
  WaterfallIndicator,
  WaterfallRow,
  WaterfallRowHeader,
  visibleWaterfallRows,
} from "@/components/keyframery/waterfall"

const trace: WaterfallData = [
  {
    value: "request",
    label: "GET /checkout",
    start: 0,
    duration: 620,
    children: [
      { value: "auth", label: "auth", start: 10, duration: 80 },
      { value: "cart", label: "load cart", start: 100, duration: 220 },
      { value: "render", label: "render", start: 330, duration: 280 },
    ],
  },
]
const rows = visibleWaterfallRows(trace, ["request"])
</script>

<template>
  <Waterfall
    aria-label="Trace"
    :items="trace"
    :default-expanded="['request']"
    class="w-full max-w-[480px] grid-cols-[130px_minmax(0,1fr)]"
  >
    <WaterfallHeaderRow>
      <WaterfallColumnHeader>Span</WaterfallColumnHeader>
      <WaterfallColumnHeader aria-label="Timeline">
        <WaterfallAxis :max-ticks="4" />
      </WaterfallColumnHeader>
    </WaterfallHeaderRow>
    <WaterfallRow v-for="{ item } in rows" :key="item.value" :value="item.value">
      <WaterfallRowHeader>
        <WaterfallIndicator v-if="item.children" />{{ item.label }}
      </WaterfallRowHeader>
      <WaterfallBar />
    </WaterfallRow>
  </Waterfall>
</template>
