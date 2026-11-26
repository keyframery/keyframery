<script setup lang="ts">
import { SegmentedControl, SegmentedControlItem } from "@/components/keyframery/segmented-control"
</script>

<template>
  <SegmentedControl aria-label="View" default-value="list">
    <SegmentedControlItem value="list">List</SegmentedControlItem>
    <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
  </SegmentedControl>
</template>
