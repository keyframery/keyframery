<script setup lang="ts">
/* Mirrors src/examples/trace/usage.tsx. */
import { Trace, TraceIcon, TraceLine, TraceTitle } from "@/components/keyframery/trace"
</script>

<template>
  <div data-demo="trace-usage">
    <Trace>
      <TraceLine>
        <TraceIcon />
        <TraceTitle>Read the order history</TraceTitle>
      </TraceLine>
      <TraceLine status="running">
        <TraceIcon />
        <TraceTitle>Drafting the refund email</TraceTitle>
      </TraceLine>
    </Trace>
  </div>
</template>
