<script setup lang="ts">
// Network requests
// Each item has a `start` and a `duration`. The axis picks its own ticks, and the bars draw in from the left.

import {
  Waterfall,
  WaterfallAxis,
  WaterfallBar,
  WaterfallCell,
  WaterfallColumnHeader,
  WaterfallHeaderRow,
  WaterfallRow,
  WaterfallRowHeader,
} from "@/components/keyframery/waterfall"

const requests = [
  { value: "html", label: "index.html", start: 0, duration: 180 },
  { value: "css", label: "app.css", start: 190, duration: 90 },
  { value: "js", label: "app.js", start: 190, duration: 340 },
  { value: "font", label: "inter.woff2", start: 300, duration: 120 },
  { value: "api", label: "/api/feed", start: 540, duration: 260 },
]
</script>

<template>
  <Waterfall
    aria-label="Network requests"
    :items="requests"
    class="w-full max-w-[520px] grid-cols-[110px_56px_minmax(0,1fr)]"
  >
    <WaterfallHeaderRow>
      <WaterfallColumnHeader>Request</WaterfallColumnHeader>
      <WaterfallColumnHeader class="justify-end">Time</WaterfallColumnHeader>
      <WaterfallColumnHeader aria-label="Timeline">
        <WaterfallAxis :max-ticks="4" />
      </WaterfallColumnHeader>
    </WaterfallHeaderRow>
    <WaterfallRow v-for="r in requests" :key="r.value" :value="r.value">
      <WaterfallRowHeader>{{ r.label }}</WaterfallRowHeader>
      <WaterfallCell class="justify-end tabular-nums">{{ r.duration }} ms</WaterfallCell>
      <WaterfallBar />
    </WaterfallRow>
  </Waterfall>
</template>
