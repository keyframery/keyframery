<script setup lang="ts">
// Icons only
// Give each item an `aria-label` when it shows only an icon.

import { LayoutGrid, List, Rows3 } from "@lucide/vue"

import { SegmentedControl, SegmentedControlItem } from "@/components/keyframery/segmented-control"
</script>

<template>
  <SegmentedControl aria-label="Layout" default-value="grid">
    <SegmentedControlItem value="list" aria-label="List">
      <List />
    </SegmentedControlItem>
    <SegmentedControlItem value="rows" aria-label="Rows">
      <Rows3 />
    </SegmentedControlItem>
    <SegmentedControlItem value="grid" aria-label="Grid">
      <LayoutGrid />
    </SegmentedControlItem>
  </SegmentedControl>
</template>
