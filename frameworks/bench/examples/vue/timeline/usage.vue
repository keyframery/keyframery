<script setup lang="ts">
import { Timeline, TimelineConnector, TimelineItem, TimelineMarker, TimelineTitle } from "@/components/keyframery/timeline"
</script>

<template>
  <Timeline aria-label="Order">
    <TimelineItem status="complete">
      <TimelineMarker />
      <TimelineConnector />
      <TimelineTitle>Ordered</TimelineTitle>
    </TimelineItem>
    <TimelineItem status="current">
      <TimelineMarker />
      <TimelineTitle>Shipped</TimelineTitle>
    </TimelineItem>
  </Timeline>
</template>
