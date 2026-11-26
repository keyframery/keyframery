<script setup lang="ts">
// Activity feed
// `feed` marks it as a live list of events, so screen readers announce new ones. Leave out the statuses for plain history.

import { Timeline, TimelineConnector, TimelineDescription, TimelineItem, TimelineMarker, TimelineTime, TimelineTitle } from "@/components/keyframery/timeline"

const events = [
  { who: "Maya", what: "merged “New pricing page”", time: "2h" },
  { who: "Tom", what: "commented on the onboarding spec", time: "5h" },
  { who: "Ines", what: "opened “Dark mode for charts”", time: "Yesterday" },
]
</script>

<template>
  <Timeline feed aria-label="Activity" class="w-full max-w-[340px]">
    <TimelineItem v-for="e in events" :key="e.what">
      <TimelineMarker />
      <TimelineConnector />
      <TimelineTitle>{{ e.who }}</TimelineTitle>
      <TimelineTime>{{ e.time }}</TimelineTime>
      <TimelineDescription>{{ e.what }}</TimelineDescription>
    </TimelineItem>
  </Timeline>
</template>
