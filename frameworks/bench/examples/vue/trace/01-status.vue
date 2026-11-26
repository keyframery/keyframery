<script setup lang="ts">
// Status
// `status` on a line is "running", "error" or "pending"; leave it out once the step is done. With no children, the icon follows it: a spinner, a mark, a dashed ring, or a tick that draws itself.

import { Trace, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "@/components/keyframery/trace"
</script>

<template>
  <Trace class="max-w-[380px]">
    <TraceLine>
      <TraceIcon />
      <TraceTitle>Checked stock at the Leeds warehouse</TraceTitle>
      <TraceDescription>0.8s</TraceDescription>
    </TraceLine>
    <TraceLine status="error">
      <TraceIcon />
      <TraceTitle>Couldn't reach the courier's tracking page</TraceTitle>
    </TraceLine>
    <TraceLine status="running">
      <TraceIcon />
      <TraceTitle>Writing to the customer</TraceTitle>
    </TraceLine>
    <TraceLine status="pending">
      <TraceIcon />
      <TraceTitle>Issue the refund</TraceTitle>
    </TraceLine>
  </Trace>
</template>
