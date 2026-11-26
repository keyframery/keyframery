<script setup lang="ts">
// Order progress
// Each item's `status` is complete, current or upcoming. Moving it on fills the connector and lights the next marker.

import { ref } from "vue"

import { Button } from "@/components/keyframery/button"
import { Timeline, TimelineConnector, TimelineDescription, TimelineItem, TimelineMarker, TimelineTime, TimelineTitle } from "@/components/keyframery/timeline"

const steps = [
  { title: "Ordered", time: "Mon 09:12", about: "Payment received" },
  { title: "Packed", time: "Mon 16:40", about: "At the warehouse in Leeds" },
  { title: "Out for delivery", time: "Wed", about: "With your local driver" },
  { title: "Delivered", time: "Wed", about: "Left with a neighbour" },
]

const current = ref(1)
</script>

<template>
  <div class="flex w-full max-w-[340px] flex-col gap-4">
    <Timeline aria-label="Delivery">
      <TimelineItem
        v-for="(step, i) in steps"
        :key="step.title"
        :status="i < current ? 'complete' : i === current ? 'current' : 'upcoming'"
      >
        <TimelineMarker />
        <TimelineConnector />
        <TimelineTitle>{{ step.title }}</TimelineTitle>
        <TimelineTime>{{ step.time }}</TimelineTime>
        <TimelineDescription>{{ step.about }}</TimelineDescription>
      </TimelineItem>
    </Timeline>
    <Button size="sm" class="self-start" @click="current = current >= steps.length ? 0 : current + 1">{{ current >= steps.length ? 'Start again' : 'Next step' }}</Button>
  </div>
</template>
