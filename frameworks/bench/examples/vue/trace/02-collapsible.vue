<script setup lang="ts">
// A row that expands
// Wrap a line in `TraceCollapsibleTrigger` inside `TraceCollapsible`. The detail opens to its real height and its paragraphs rise in one after another.

import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/keyframery/trace"
</script>

<template>
  <Trace class="max-w-[380px]">
    <TraceCollapsible default-open>
      <TraceCollapsibleTrigger>
        <TraceLine>
          <TraceIcon />
          <TraceTitle>Thought for 6 seconds</TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent>
        <p>The parcel left Leeds on Tuesday but has no scan since. Royal Mail treats 10 working days as lost.</p>
        <p>It has been 7, so offer a resend now rather than a refund.</p>
      </TraceCollapsibleContent>
    </TraceCollapsible>
  </Trace>
</template>
